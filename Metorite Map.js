// Global variables
let mapCenterCoords = [0, 0];
let mapZoomLevel = 2;
let allMeteorData = [];
let map; // Global map variable

// Function to create the map
function createMap(meteorLayer) {
    map = L.map('map', {
        center: mapCenterCoords,
        zoom: mapZoomLevel,
    });

    let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    meteorLayer.addTo(map);

    let baseMaps = { "Base Layer": baseLayer };
    let overlayMaps = { "Meteorites": meteorLayer };
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
}

// Function to create markers
function createMarkers(meteorData) {
    let meteorMarkers = [];

    meteorData.forEach(meteor => {
        if (meteor.reclat && meteor.reclong) {
            let year = meteor.year ? (new Date(meteor.year)).getFullYear() : 'Unknown';
            let marker = L.circleMarker([parseFloat(meteor.reclat), parseFloat(meteor.reclong)], {
                radius: 3,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<h3>${meteor.name}</h3><hr><p>Year: ${year}</p>`);

            meteorMarkers.push(marker);
        }
    });

    let meteorLayer = L.layerGroup(meteorMarkers);
    createMap(meteorLayer);

    if (meteorMarkers.length > 0) {
        let group = new L.featureGroup(meteorMarkers);
        map.fitBounds(group.getBounds());
    }
}

// Function to populate year dropdown
function populateYearDropdown() {
    let yearFilter = document.getElementById('yearFilter');
    let allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    yearFilter.appendChild(allOption);

    let years = [...new Set(allMeteorData.map(meteor => {
        return meteor.year ? (new Date(meteor.year)).getFullYear() : 'Unknown';
    }))].sort((a, b) => a - b);

    years.forEach(year => {
        if (year !== 'Unknown') {
            let option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    });
}

// Function to filter data by year
function filterByYear() {
    let selectedYear = document.getElementById('yearFilter').value;
    let filteredData = selectedYear === '' ? allMeteorData : allMeteorData.filter(meteor => {
        return meteor.year && (new Date(meteor.year)).getFullYear().toString() === selectedYear;
    });

    createMarkers(filteredData);
}

// Function to load meteor data
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

// Event listener for the dropdown
document.getElementById('yearFilter').addEventListener('change', filterByYear);

// Initial data load
loadMeteorData();
