$(document).ready(function() {
    const TIME_FIELD = 'TIME';
    const MAC_FIELD = 'MAC';
    const LOCATION_FIELD = 'LOCATION';
    const L1_VALUE_FIELD = 'L1_VALUE';
    const L2_VALUE_FIELD = 'L2_VALUE';
    const L3_VALUE_FIELD = 'L3_VALUE';

    let chartInstance = null;

    function drawChart(data) {
        // Sortowanie danych od najstarszych do najnowszych
        data.sort((a, b) => new Date(a[TIME_FIELD]) - new Date(b[TIME_FIELD]));

        const labels = data.map(entry => entry[TIME_FIELD]);
        const l1Values = data.map(entry => entry[L1_VALUE_FIELD]);
        const l2Values = data.map(entry => entry[L2_VALUE_FIELD]);
        const l3Values = data.map(entry => entry[L3_VALUE_FIELD]);

        const ctx = document.getElementById('myChart').getContext('2d');

        if (chartInstance) {
            console.log("Destroying existing chart instance");
            chartInstance.destroy();
        }

        console.log("Creating new chart instance with labels:", labels);
        console.log("Creating new chart instance with values:", l1Values, l2Values, l3Values);

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'L1 Value',
                        data: l1Values,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: 'L2 Value',
                        data: l2Values,
                        borderColor: 'rgb(192, 75, 75)',
                        tension: 0.1
                    },
                    {
                        label: 'L3 Value',
                        data: l3Values,
                        borderColor: 'rgb(75, 75, 192)',
                        tension: 0.1
                    }
                ]
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
