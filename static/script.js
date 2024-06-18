$(document).ready(function() {
    const TIME_FIELD = 'TIME';
    const MAC_FIELD = 'MAC';
    const LOCATION_FIELD = 'LOCATION';
    const L1_VALUE_FIELD = 'L1_VALUE';
    const L2_VALUE_FIELD = 'L2_VALUE';
    const L3_VALUE_FIELD = 'L3_VALUE';

    let chartInstance = null;

    function drawChart(data) {
        const labels = data.map(entry => entry[TIME_FIELD]);
        const values = data.map(entry => entry[L1_VALUE_FIELD]);

        const ctx = document.getElementById('myChart').getContext('2d');

        if (chartInstance) {
            console.log("Destroying existing chart instance");
            chartInstance.destroy();
        }

        console.log("Creating new chart instance with labels:", labels);
        console.log("Creating new chart instance with values:", values);

        chartInstance = new Chart(ctx, {
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
                        },
                        adapters: {
                            date: {
                                locale: dateFns
                            }
                        }
                    }
                }
            }
        });
    }

    $('#record-form').submit(function(event) {
        event.preventDefault();

        const numRecords = $('#num-records').val();
        const macAddress = $('#mac-address').val();
        const location = $('#location').val();

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
                console.log("Fetched data: ", data);
                renderTable(data);
                drawChart(data);
            },
            error: function(xhr, status, error) {
                console.error("Failed to fetch data:", status, error);
            }
        });
    }

    function renderTable(data) {
        const tbody = $('#data-container tbody');
        tbody.empty();

        const currentTime = new Date();

        data.forEach(entry => {
            const recordTime = new Date(entry[TIME_FIELD]);
            const timeDifference = Math.round((currentTime - recordTime) / (1000 * 60));
            let timeDifferenceText = '';

            if (timeDifference < 60) {
                timeDifferenceText = timeDifference + ' minutes ago';
            } else if (timeDifference < 1440) {
                timeDifferenceText = Math.floor(timeDifference / 60) + ' hours ago';
            } else {
                timeDifferenceText = Math.floor(timeDifference / 1440) + ' days ago';
            }

            const row = `<tr>
                <td>${entry[TIME_FIELD]}</td>
                <td>${timeDifferenceText}</td>
                <td>${entry[MAC_FIELD]}</td>
                <td>${entry[LOCATION_FIELD]}</td>
                <td>${entry[L1_VALUE_FIELD]}</td>
                <td>${entry[L2_VALUE_FIELD]}</td>
                <td>${entry[L3_VALUE_FIELD]}</td>
            </tr>`;
            tbody.append(row);
        });
    }

    // Fetch data on page load
    $('#record-form').submit();
    setInterval(function() {
        $('#record-form').submit();
    }, 60*1000);
});

// $(document).ready(function() {
//     const TIME_FIELD = 'TIME';
//     const L1_VALUE_FIELD = 'L1_VALUE';
//     let chartInstance = null; // Referencja do wykresu


//     function drawChart(data) {
//         const labels = data.map(entry => entry[TIME_FIELD]);
//         const values = data.map(entry => entry[L1_VALUE_FIELD]);

//         const ctx = document.getElementById('myChart').getContext('2d');

//         // Sprawdź, czy istnieje już wykres, jeśli tak, zniszcz go
//         if (chartInstance) {
//             console.log("Destroying existing chart instance");
//             chartInstance.destroy();
//             chartInstance = null; // Ustaw na null po zniszczeniu
//         }

//         console.log("Creating new chart instance with labels:", labels);
//         console.log("Creating new chart instance with values:", values);

//         // Utwórz nowy wykres
//         chartInstance = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     label: 'L1 Value',
//                     data: values,
//                     borderColor: 'rgb(75, 192, 192)',
//                     tension: 0.1
//                 }]
//             },
//             options: {
//                 scales: {
//                     x: {
//                         type: 'time',
//                         time: {
//                             unit: 'minute'
//                         },
//                         adapters: {
//                             date: {
//                                 locale: dateFns
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     $('#record-form').submit(function(event) {
//         event.preventDefault();

//         var numRecords = $('#num-records').val();
//         var macAddress = $('#mac-address').val();
//         var location = $('#location').val();

//         fetchData(numRecords, macAddress, location);
//     });

//     function fetchData(numRecords, macAddress, location) {
//         $.ajax({
//             url: '/fetch_data',
//             type: 'GET',
//             data: {
//                 num_records: numRecords,
//                 mac_address: macAddress,
//                 location: location
//             },
//             dataType: 'json',
//             success: function(data) {
//                 console.log("Fetched data: ", data);
//                 var tbody = $('#data-container tbody');
//                 tbody.empty();

//                 var currentTime = new Date();

//                 data.forEach(function(entry) {
//                     var recordTime = new Date(entry.TIME);
//                     var timeDifference = Math.round((currentTime - recordTime) / (1000 * 60));
//                     var timeDifferenceText = '';
                    
//                     if (timeDifference < 60) {
//                         timeDifferenceText = timeDifference + ' minutes ago';
//                     } else if (timeDifference < 1440) {
//                         timeDifferenceText = Math.floor(timeDifference / 60) + ' hours ago';
//                     } else {
//                         timeDifferenceText = Math.floor(timeDifference / 1440) + ' days ago';
//                     }

//                     var row = '<tr>' +
//                         '<td>' + entry.TIME + '</td>' +
//                         '<td>' + timeDifferenceText + '</td>' +
//                         '<td>' + entry.MAC + '</td>' +
//                         '<td>' + entry.LOCATION + '</td>' +
//                         '<td>' + entry.L1_VALUE + '</td>' +
//                         '<td>' + entry.L2_VALUE + '</td>' +
//                         '<td>' + entry.L3_VALUE + '</td>' +
//                         '</tr>';
//                     tbody.append(row);
//                 });

//                 drawChart(data);
//             }
//         });
//     }

//     // Fetch data on page load
//     $('#record-form').submit();
//     setInterval(function() {
//         $('#record-form').submit();
//     }, 5000);
// });