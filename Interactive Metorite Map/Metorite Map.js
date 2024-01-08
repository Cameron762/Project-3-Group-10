let allMeteorData = [];
let map = L.map('map', { center: [0, 0], zoom: 2 }); // Initialize map once

// Initialize the base layer of the map
let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function getCentury(year) {
    if (!year) return 'Unknown';
    let century = Math.ceil(year / 100);
    return `${(century - 1) * 100 + 1}-${century * 100}`;
}

function createMarkers(meteorData) {
    // Clear existing markers from the map
    map.eachLayer(function(layer) {
        if (!!layer.toGeoJSON) {
            map.removeLayer(layer);
        }
    });

    // Add new markers based on the provided data
    let meteorMarkers = L.layerGroup(
        meteorData.map(meteor => {
            if (meteor.reclat && meteor.reclong) {
                let year = meteor.year ? (new Date(meteor.year)).getFullYear() : 'Unknown';
                return L.circleMarker([parseFloat(meteor.reclat), parseFloat(meteor.reclong)], {
                    radius: 3,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup(`<h3>${meteor.name}</h3><hr><p>Year: ${year}</p>`);
            }
            return null;
        }).filter(marker => marker != null)
    ).addTo(map);

    if (meteorMarkers.getLayers().length > 0) {
        let group = L.featureGroup(meteorMarkers.getLayers());
        map.fitBounds(group.getBounds());
    }
}

function populateYearDropdown() {
    let yearFilter = document.getElementById('yearFilter');
    let centurySet = new Set();
    allMeteorData.forEach(meteor => {
        if (meteor.year) {
            let year = (new Date(meteor.year)).getFullYear();
            centurySet.add(getCentury(year));
        }
    });

    [...centurySet].sort().forEach(century => {
        let option = document.createElement('option');
        option.value = century;
        option.textContent = century;
        yearFilter.appendChild(option);
    });
}

function filterDataByYear() {
    let selectedCentury = document.getElementById('yearFilter').value;
    let filteredData;

    if (selectedCentury === '') {
        filteredData = allMeteorData; // Show all data if 'All Centuries' is selected
    } else {
        filteredData = allMeteorData.filter(meteor => {
            if (meteor.year) {
                let year = (new Date(meteor.year)).getFullYear();
                return getCentury(year) === selectedCentury;
            }
            return false;
        });
    }

    createMarkers(filteredData);
}

function loadMeteorData() {
    fetch('http://localhost:5000/api/meteor_data')
        .then(response => response.json())
        .then(data => {
            allMeteorData = data;
            createMarkers(data);
            populateYearDropdown();
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.getElementById('yearFilter').addEventListener('change', filterDataByYear);

loadMeteorData();
