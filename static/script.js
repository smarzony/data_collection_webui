$(document).ready(function() {
    const TIME_FIELD = 'TIME';
    const MAC_FIELD = 'MAC';
    const LOCATION_FIELD = 'LOCATION';
    const L1_VALUE_FIELD = 'L1_VALUE';
    const L2_VALUE_FIELD = 'L2_VALUE';
    const L3_VALUE_FIELD = 'L3_VALUE';

    let chartInstance = null;

    function drawChart(data) {
        if (chartInstance) {
            chartInstance.destroy();
            console.log("Chart destroyed!");
        }
        // Sortowanie danych od najstarszych do najnowszych
        data.sort((a, b) => new Date(a[TIME_FIELD]) - new Date(b[TIME_FIELD]));

        // Odwracanie danych, aby najnowsze były po prawej stronie
        const labels = data.map(entry => entry[TIME_FIELD]).reverse();
        const l1Values = data.map(entry => entry[L1_VALUE_FIELD]).reverse();
        const l2Values = data.map(entry => entry[L2_VALUE_FIELD]).reverse();
        const l3Values = data.map(entry => entry[L3_VALUE_FIELD]).reverse();
    
        const ctx = document.getElementById('myChart').getContext('2d');
        // const chart = new Chart(ctx, {
            chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'L1 Value',
                    data: l1Values,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }, {
                    label: 'L2 Value',
                    data: l2Values,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                }, {
                    label: 'L3 Value',
                    data: l3Values,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'YYYY-MM-DD HH:mm:ss',  // Dodaj parser, jeśli używasz niestandardowego formatu
                            tooltipFormat: 'll HH:mm'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true
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

    $('#chart-form').submit(function(event) {
        event.preventDefault();

        const macAddress = $('#mac-address-chart').val();
        const location = $('#location-chart').val();
        const startDate = $('#start-date-chart').val();
        const endDate = $('#end-date-chart').val();

        fetchDataForChart(macAddress, location, startDate, endDate);
    });

    document.addEventListener('DOMContentLoaded', function() {
        // Inicjalizacja flatpickr
        flatpickr("#start-date-chart", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            time_24hr: true
        });
    
        flatpickr("#end-date-chart", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            time_24hr: true
        });
    
        // Obsługa przycisku "Teraz"
        document.getElementById('set-now-button').addEventListener('click', function() {
            var now = new Date();
            var nowFormatted = flatpickr.formatDate(now, "Y-m-d H:i");
            document.getElementById('end-date-chart').value = nowFormatted;
        });
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
                // drawChart(data);
            },
            error: function(xhr, status, error) {
                console.error("Failed to fetch data:", status, error);
            }
        });
    }

    function fetchDataForChart(macAddress, location, startDate, endDate) {
        $.ajax({
            url: '/fetch_chart_data',
            type: 'GET',
            data: {
                mac_address: macAddress,
                location: location,
                start_date: startDate,
                end_date: endDate
            },
            dataType: 'json',
            success: function(data) {
                console.log("Fetched data for chart: ", data);
                drawChart(data);
            },
            error: function(xhr, status, error) {
                console.error("Failed to fetch data for chart:", status, error);
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
