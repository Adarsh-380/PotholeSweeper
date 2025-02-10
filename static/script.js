// Initial Coordinates
var ibc_center = [12.933083, 77.602064];  // Latitude, Longitude

// Map Options
var mapOptions = {
    zoom_start: 16,      // Initial zoom level
    min_zoom: 16,
    max_zoom: 16,
    zoomControl: false
};

// Initialize the map with options
var map = L.map('map', mapOptions).setView(ibc_center, 16);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker setup:  Make it draggable!
var marker = L.marker(ibc_center, { draggable: true }).addTo(map);

// 1km boundary setup
var boundary; // Declare boundary outside the functions

function createBoundary(lat, lng) {
    const latOffset = 0.005;
    const lngOffset = 0.005;

    const corner1 = [lat - latOffset, lng - lngOffset];
    const corner2 = [lat + latOffset, lng + lngOffset];

    return L.rectangle([corner1, corner2], {
        color: 'red',
        weight: 1,
        fillColor: 'transparent',
        fillOpacity: 0
    });
}

// Function to display coordinates (can be updated to display in a specific element)
function displayCoordinates(lat, lng) {
    console.log("displayCoordinates called with:", lat, lng);
    document.getElementById("latitude").textContent = lat.toFixed(6);
    document.getElementById("longitude").textContent = lng.toFixed(6);

    // Update Boundary on each move (including initial move)
    if (boundary) {
        map.removeLayer(boundary);  // Remove the old boundary
        console.log("Boundary removed");
    }
    boundary = createBoundary(lat, lng).addTo(map); // Create and add new boundary
    console.log("Boundary added");
}

// Initial display of coordinates and boundary
displayCoordinates(ibc_center[0], ibc_center[1]);  // Now handled by marker drag and autocomplete

// Add event listener for marker dragend
marker.on('dragend', function(event) {
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    map.panTo(new L.LatLng(position.lat, position.lng))
    displayCoordinates(position.lat, position.lng);
});


// Autocomplete functionality
const searchInput = document.getElementById('search_query');
const suggestionsList = document.createElement('ul');
suggestionsList.id = 'suggestions';
document.getElementById('search-container').appendChild(suggestionsList);

searchInput.addEventListener('input', function() {
    const query = this.value;
    if (!query) {
        suggestionsList.innerHTML = '';
        return;
    }

    fetch(`/autocomplete?q=${query}&countrycodes=in`)
        .then(response => response.json())
        .then(data => {
            suggestionsList.innerHTML = '';
            data.forEach(suggestion => {
                const listItem = document.createElement('li');
                listItem.textContent = suggestion.display_name;
                listItem.addEventListener('click', function(event) {
                    event.preventDefault();

                    suggestionsList.innerHTML = '';

                    searchInput.value = suggestion.display_name;

                    let latitude = parseFloat(suggestion.latitude)
                    let longitude = parseFloat(suggestion.longitude)

                    if (isNaN(latitude) || isNaN(longitude)) {
                        console.error("Invalid latitude or longitude from suggestion:", suggestion);
                        return;
                    }

                    marker.setLatLng([latitude, longitude]);
                    map.panTo([latitude, longitude]);
                    displayCoordinates(latitude, longitude);
                    console.log("displayCoordinates from suggestion click Latitude:", latitude, "Longitude",longitude);

                });
                suggestionsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching autocomplete suggestions:', error);
            suggestionsList.innerHTML = '';
        });
});

// Get Map Image Button
const getMapImageButton = document.getElementById('get-map-image-button');

getMapImageButton.addEventListener('click', function() {
    const lat = document.getElementById("latitude").textContent;
    const lng = document.getElementById("longitude").textContent;

    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        console.error("Invalid latitude or longitude");
        alert("Please select a valid location first.");
        return;
    }

    const imageUrl = `/get_map_image?lat=${lat}&lng=${lng}`;
    window.open(imageUrl, '_blank');
});