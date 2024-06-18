$(document).ready(function() {
    const TIME_FIELD = 'TIME';
    const L1_VALUE_FIELD = 'L1_VALUE';

    
    function drawChart(data) {
        var labels = [];
        var values = [];

        data.forEach(function(entry) {
            labels.push(entry.TIME);
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
                console.log("Fetched data: ", data);
                var tbody = $('#data-container tbody');
                tbody.empty();

                var currentTime = new Date();

                data.forEach(function(entry) {
                    var recordTime = new Date(entry.TIME);
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
                        '<td>' + entry.TIME + '</td>' +
                        '<td>' + timeDifferenceText + '</td>' +
                        '<td>' + entry.MAC + '</td>' +
                        '<td>' + entry.LOCATION + '</td>' +
                        '<td>' + entry.L1_VALUE + '</td>' +
                        '<td>' + entry.L2_VALUE + '</td>' +
                        '<td>' + entry.L3_VALUE + '</td>' +
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