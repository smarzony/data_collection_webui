function fetchData(numRecords, selectedMacAddress, selectedLocation) {
    $.ajax({
        url: '/fetch_data',
        type: 'GET',
        data: { 
            num_records: numRecords,
            mac_address: selectedMacAddress,
            location: selectedLocation
        },
        dataType: 'json',
        success: function(data) {
            var tbody = $('#data-container tbody');
            tbody.empty();

            var currentTime = new Date(); // Aktualny czas

            data.forEach(function(entry) {
                var recordTime = new Date(entry.time); // Czas utworzenia rekordu
                var timeDifference = Math.round((currentTime - recordTime) / (1000 * 60)); // Różnica czasów w minutach

                var row = '<tr>' +
                    '<td>' + entry.time + '</td>' +
                    '<td>' + timeDifference + ' minutes ago</td>' +
                    '<td>' + entry.mac + '</td>' +
                    '<td>' + entry.location + '</td>' +
                    '<td>' + entry.l1_value + '</td>' +
                    '<td>' + entry.l2_value + '</td>' +
                    '<td>' + entry.l3_value + '</td>' +                    
                    '</tr>';
                tbody.append(row);
            });
        }
    });
}

$(document).ready(function() {
    var selectedMacAddress = $('#mac-address').val();
    var selectedLocation = $('#location').val();

    // Wywołaj funkcję fetchData() po załadowaniu strony
    var numRecords = $('#num-records').val();
    fetchData(numRecords, selectedMacAddress, selectedLocation);

    $('#record-form').submit(function(event) {
        event.preventDefault(); // Zapobiega domyślnej akcji przesyłania formularza

        var numRecords = $('#num-records').val();
        selectedMacAddress = $('#mac-address').val();
        selectedLocation = $('#location').val();

        fetchData(numRecords, selectedMacAddress, selectedLocation);
    });

    // Cyklicznie pobierz dane z formularza co 5 sekund
    setInterval(function() {
        var numRecords = $('#num-records').val();
        fetchData(numRecords, selectedMacAddress, selectedLocation);
    }, 5000);
});