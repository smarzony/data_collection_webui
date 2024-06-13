$(document).ready(function() {
    function drawChart(data) {
        var labels = [];
        var values = [];

        data.forEach(function(entry) {
            labels.push(entry.time);
            values.push(entry.l1_value);
        });

        var ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'L1 Value',
                    data: values,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    }
                }
            }
        });
    }

    $('#record-form').submit(function(event) {
        event.preventDefault();

        var numRecords = $('#num-records').val();
        var macAddress = $('#mac-address').val();
        var location = $('#location').val();

        fetchData(numRecords, macAddress, location);
    });

    function fetchData(numRecords, macAddress, location) {
        $.ajax({
            url: '/fetch_data',
            type: 'GET',
            data: {
                num_records: numRecords,
                mac_address: macAddress,
                location: location
            },
            dataType: 'json',
            success: function(data) {
                var tbody = $('#data-container tbody');
                tbody.empty();

                var currentTime = new Date();

                data.forEach(function(entry) {
                    var recordTime = new Date(entry.time);
                    var timeDifference = Math.round((currentTime - recordTime) / (1000 * 60));
                    var timeDifferenceText = '';
                    
                    if (timeDifference < 60) {
                        timeDifferenceText = timeDifference + ' minutes ago';
                    } else if (timeDifference < 1440) {
                        timeDifferenceText = Math.floor(timeDifference / 60) + ' hours ago';
                    } else {
                        timeDifferenceText = Math.floor(timeDifference / 1440) + ' days ago';
                    }

                    var row = '<tr>' +
                        '<td>' + entry.time + '</td>' +
                        '<td>' + timeDifferenceText + '</td>' +
                        '<td>' + entry.mac + '</td>' +
                        '<td>' + entry.location + '</td>' +
                        '<td>' + entry.l1_value + '</td>' +
                        '<td>' + entry.l2_value + '</td>' +
                        '<td>' + entry.l3_value + '</td>' +
                        '</tr>';
                    tbody.append(row);
                });

                drawChart(data);
            }
        });
    }

    // Fetch data on page load
    $('#record-form').submit();
    setInterval(function() {
        $('#record-form').submit();
    }, 5000);
});

// function fetchData(numRecords, selectedMacAddress, selectedLocation) {
//     $.ajax({
//         url: '/fetch_data',
//         type: 'GET',
//         data: { 
//             num_records: numRecords,
//             mac_address: selectedMacAddress,
//             location: selectedLocation
//         },
//         dataType: 'json',
//         success: function(data) {
//             var tbody = $('#data-container tbody');
//             tbody.empty();

//             var currentTime = new Date(); // Aktualny czas

//             data.forEach(function(entry) {
//                 var recordTime = new Date(entry.time); // Czas utworzenia rekordu
//                 var timeDifference = Math.round((currentTime - recordTime) / (1000 * 60)); // Różnica czasów w minutach

//                 var timeString;
//                 if (timeDifference < 2) {
//                     timeString = timeDifference + ' minute ago';
//                 }
//                 else if (timeDifference >= 2 & timeDifference < 60) {
//                     timeString = timeDifference + ' minutes ago';
//                 } else if (timeDifference >= 60 & timeDifference < 1440) {
//                     var hours = Math.floor(timeDifference / 60);
//                     var minutes = timeDifference % 60;
//                     timeString = hours + ' hours, ' + minutes + ' minutes ago';
//                 } else {
//                     var days = Math.floor(timeDifference / 1440);
//                     var remainingMinutes = timeDifference % 1440;
//                     var hours = Math.floor(remainingMinutes / 60);
//                     var minutes = remainingMinutes % 60;
//                     timeString = days + ' days, ' + hours + ' hours, ' + minutes + ' minutes ago';
//                 }

//                 var row = '<tr>' +
//                     '<td>' + entry.time + '</td>' +
//                     '<td>' + timeString + '</td>' +
//                     '<td>' + entry.mac + '</td>' +
//                     '<td>' + entry.location + '</td>' +
//                     '<td>' + entry.l1_value + '</td>' +
//                     '<td>' + entry.l2_value + '</td>' +
//                     '<td>' + entry.l3_value + '</td>' +                    
//                     '</tr>';
//                 tbody.append(row);
//             });
//         }
//     });
// }

// $(document).ready(function() {
//     var selectedMacAddress = $('#mac-address').val();
//     var selectedLocation = $('#location').val();

//     // Wywołaj funkcję fetchData() po załadowaniu strony
//     var numRecords = $('#num-records').val();
//     fetchData(numRecords, selectedMacAddress, selectedLocation);

//     $('#record-form').submit(function(event) {
//         event.preventDefault(); // Zapobiega domyślnej akcji przesyłania formularza

//         var numRecords = $('#num-records').val();
//         selectedMacAddress = $('#mac-address').val();
//         selectedLocation = $('#location').val();

//         fetchData(numRecords, selectedMacAddress, selectedLocation);
//     });

//     // Cyklicznie pobierz dane z formularza co 5 sekund
//     setInterval(function() {
//         var numRecords = $('#num-records').val();
//         fetchData(numRecords, selectedMacAddress, selectedLocation);
//     }, 5000);
// });