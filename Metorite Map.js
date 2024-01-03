// Define default map center coordinates and zoom level
let mapCenterCoords = [0, 0]; // Update this with appropriate default coordinates
let mapZoomLevel = 2; // You can adjust this zoom level

let allMeteorData = []; // Global variable to store all meteor data

// Create the createMap function
function createMap(meteorLayer) {
  // Create the tile layer that will be the background of our map
  let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  // Create a baseMaps object to hold the base layer
  let baseMaps = {
    "Base Layer": baseLayer
  };

  // Create an overlayMaps object to hold the meteor layer
  let overlayMaps = {
    "Meteorites": meteorLayer
  };

  // Create the map object with options
  let map = L.map('map', {
    center: mapCenterCoords,
    zoom: mapZoomLevel,
    layers: [baseLayer, meteorLayer]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
}

// Create the createMarkers function
function createMarkers(meteorData) {
  let meteorMarkers = [];

  meteorData.forEach(function(meteor) {
    if (meteor.reclat && meteor.reclong) {
      let year = meteor.year ? (new Date(meteor.year)).getFullYear() : 'Unknown';
      let marker = L.circleMarker([parseFloat(meteor.reclat), parseFloat(meteor.reclong)], {
        radius: 3, // Adjust size of the marker
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
}

// Load meteor data and populate the year dropdown
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

// Populate the year dropdown with unique years from the data
function populateYearDropdown() {
  let years = new Set(allMeteorData.map(meteor => {
    return meteor.year ? (new Date(meteor.year)).getFullYear() : 'Unknown';
  }));

  let yearFilter = document.getElementById('yearFilter');
  years.forEach(year => {
    let option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

// Filter meteor data by the selected year
function filterByYear() {
  let selectedYear = document.getElementById('yearFilter').value;
  let filteredData = allMeteorData.filter(meteor => {
    return meteor.year && (new Date(meteor.year)).getFullYear().toString() === selectedYear;
  });

  createMarkers(filteredData.length > 0 ? filteredData : allMeteorData);
}

document.getElementById('yearFilter').addEventListener('change', filterByYear);

loadMeteorData();
