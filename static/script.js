// Initial Coordinates
var ibc_center = [12.934533, 77.612204];  // Latitude, Longitude

// Map Options
var mapOptions = {
    zoom_start: 16,      // Initial zoom level
    min_zoom: 16,        // Minimum zoom level
    max_zoom: 16,        // Maximum zoom level
    zoomControl: false   // Disable zoom control buttons
};

// Initialize the map with options
var map = L.map('map', mapOptions).setView(ibc_center, 16); // Use ibc_center and zoom from mapOptions

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, // Keep this at 19 for the tile layer's max zoom. Or increase as needed.
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marker setup:  Make it draggable!
var marker = L.marker(ibc_center, { draggable: true }).addTo(map);

// Function to display coordinates (can be updated to display in a specific element)
function displayCoordinates(lat, lng) {
    console.log("displayCoordinates called with:", lat, lng); // ADD THIS LINE
    // Optionally, update HTML elements to show the coordinates:
    document.getElementById("latitude").textContent = lat.toFixed(6); //Show values on HTML page with 6 decimals
    document.getElementById("longitude").textContent = lng.toFixed(6);

}

// Initial display of coordinates
displayCoordinates(ibc_center[0], ibc_center[1]);

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

    // Corrected fetch URL:  ADD &countrycodes=in
    fetch(`/autocomplete?q=${query}&countrycodes=in`)
        .then(response => response.json())
        .then(data => {
            suggestionsList.innerHTML = ''; // Clear previous suggestions
            data.forEach(suggestion => {
                const listItem = document.createElement('li');
                listItem.textContent = suggestion.display_name;
                listItem.addEventListener('click', function(event) {
                    event.preventDefault();

                    suggestionsList.innerHTML = ''; // Clear suggestions 

                    searchInput.value = suggestion.display_name;
                    //Convert Suggestion to Float

                     let latitude = parseFloat(suggestion.latitude)
                     let longitude = parseFloat(suggestion.longitude)

                     if (isNaN(latitude) || isNaN(longitude)) {
                        console.error("Invalid latitude or longitude from suggestion:", suggestion);
                        return;
                    }

                    marker.setLatLng([latitude, longitude]);
                    map.panTo([latitude, longitude]);
                    displayCoordinates(latitude, longitude);
                    console.log("displayCoordinates from suggestion click Latitude:", latitude, "Longitude",longitude);// See if gets here!

                });
                suggestionsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching autocomplete suggestions:', error);
            suggestionsList.innerHTML = ''; // Clear suggestions on error
        });
});

// Get Map Image Button
const getMapImageButton = document.getElementById('get-map-image-button');

getMapImageButton.addEventListener('click', function() {
    const lat = document.getElementById("latitude").textContent;
    const lng = document.getElementById("longitude").textContent;

    //Check if coordinates are there
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        console.error("Invalid latitude or longitude");
        alert("Please select a valid location first."); // Or display a better error message
        return;
    }


    const imageUrl = `/get_map_image?lat=${lat}&lng=${lng}`; // Build URL
    window.open(imageUrl, '_blank');  // Open the image URL in a new tab
});

// // Prevent form submission on Enter key (optional, but good for UX)
// const searchForm = document.getElementById('search-form');
// searchForm.addEventListener('submit', function(event) {
//     //Update Marker from server side geocoding with nominatim
//         event.preventDefault();  // Prevent default form submission

//         const query = searchInput.value; //Get user's search query

//         //Make a request to your Flask app endpoint
//         fetch('/', {
//             method:'POST', //Assuming your form uses post
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: 'search_query=' + encodeURIComponent(query), // Send the search query
//         })
//         .then (response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.text(); // Get the HTML content of the page

//         })
//         .then(html => {
//                 // Parse the HTML to find latitude and longitude
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(html, 'text/html');

//             // Get Latitiude and Longitude
//             let latitude = doc.getElementById('latitude').textContent;
//             let longitude = doc.getElementById('longitude').textContent;

//             //Update map
//             marker.setLatLng([parseFloat(latitude), parseFloat(longitude)]);
//             map.panTo([parseFloat(latitude), parseFloat(longitude)]);
//             displayCoordinates(latitude, longitude);
//         })
//         .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);

//         });

// });