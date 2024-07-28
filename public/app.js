document.addEventListener("DOMContentLoaded", function () {
    // Booking page functions
    function showBookingPage() {
        document.getElementById('bookingPage').style.display = 'block'; // Show the booking page
    }

    function cancelBooking() {
        document.getElementById('bookingPage').style.display = 'none'; // Hide the booking page
        // Optionally clear the input
        document.getElementById('locationInput').value = '';
    }

    function goBack() {
        // Similar to cancel, but can have other logic if necessary
        document.getElementById('bookingPage').style.display = 'none';
    }

    // Signup form validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = function(event) {
            var firstName = document.getElementById('firstName').value;
            var lastName = document.getElementById('lastName').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            if (!firstName || !lastName || !email || !password) {
                alert('Please fill out all fields.');
                event.preventDefault(); // Prevent form submission
            } else if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                event.preventDefault(); // Prevent form submission
            }
        };
    }

    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function(event) {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            if (email.trim() === '' || password.trim() === '') {
                alert('Please fill in all fields.');
                event.preventDefault();  // Prevent form from submitting
            } else if (!email.includes('@')) {
                alert('Please enter a valid email.');
                event.preventDefault();  // Prevent form from submitting
            }
        };
    }

    // Azure Maps Initialization
    const azureMapsKey = window.azureMapsKey;
    console.log("Azure Maps Key:", azureMapsKey);

    if (!azureMapsKey) {
        console.error("Azure Maps Key is missing");
        return;
    }

    // Check if the map container is present
    const mapContainer = document.getElementById('myMap');
    console.log("Map container element:", mapContainer);
    if (!mapContainer) {
        console.error("Map container element is not present");
        return;
    }

    // Initialize the map
    const map = new atlas.Map('myMap', {
        center: [-122.33, 47.6], // Coordinates for the initial map center (Seattle, WA)
        zoom: 12,
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: azureMapsKey
        }
    });

    // Wait until the map resources are ready.
    map.events.add('ready', function () {
        console.log("Map resources are ready");
        // Add your code here to customize the map after it has been loaded.
    });
// Geolocation
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        console.log(`User's current position: ${userLocation.lat}, ${userLocation.lng} with accuracy: ${position.coords.accuracy} meters`);

        // Update map center with user's location
        map.setCamera({
            center: [userLocation.lng, userLocation.lat],
            zoom: 12
        });

        // Add a marker to the user's current location
        const userMarker = new atlas.HtmlMarker({
            color: 'DodgerBlue',
            text: 'U', // U for User
            position: [userLocation.lng, userLocation.lat]
        });

        if (map.markers) {
            map.markers.add(userMarker);
        } else {
            console.error("Markers object is not initialized.");
        }

        // Example: Add markers if `spaces` is defined
        if (typeof spaces !== 'undefined' && spaces.length > 0) {
            spaces.forEach(space => {
                const position = [space.lng, space.lat];

                const marker = new atlas.HtmlMarker({
                    color: 'DodgerBlue',
                    text: space.location,
                    position: position
                });

                if (map.markers) {
                    map.markers.add(marker);
                } else {
                    console.error("Markers object is not initialized.");
                }

                const popup = new atlas.Popup({
                    content: `<div><h3>${space.location}</h3><p>${space.description}</p><p>$${space.price}/day</p></div>`,
                    position: position
                });

                marker.events.add('click', () => {
                    popup.open(map);
                });
            });
        } else {
            console.log('No parking spaces available.');
        }
    }, function(error) {
        console.error("Error getting user location:", error);
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    });
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Function to search for a location
function searchLocation() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    if (!searchQuery) {
        alert('Please enter a location to search.');
        return;
    }

    // Call Azure Maps Search API
    const searchEndpoint = `https://atlas.microsoft.com/search/address/json?api-version=1.0&query=${encodeURIComponent(searchQuery)}&subscription-key=${azureMapsKey}`;

    fetch(searchEndpoint)
        .then(response => response.json())
        .then(data => {
            console.log("Search results:", data);

            // Check if any results were found
            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0]; // Take the first result

                // Ensure position object exists and contains valid lat and lon
                if (firstResult.position && typeof firstResult.position.lat === 'number' && typeof firstResult.position.lon === 'number') {
                    const coordinates = {
                        lat: firstResult.position.lat,
                        lon: firstResult.position.lon
                    };

                    console.log(`Coordinates: ${coordinates.lat}, ${coordinates.lon}`);

                    // Update map center with the searched location
                    map.setCamera({
                        center: [coordinates.lon, coordinates.lat],
                        zoom: 12
                    });

                    // Add a marker to the searched location
                    const marker = new atlas.HtmlMarker({
                        color: 'Green',
                        text: 'S', // S for Searched
                        position: [coordinates.lon, coordinates.lat]
                    });

                    if (map.markers) {
                        map.markers.add(marker);
                    } else {
                        console.error("Markers object is not initialized.");
                    }

                    // Open a popup with the address information
                    const address = firstResult.address.freeformAddress;
                    const popup = new atlas.Popup({
                        content: `<div><h3>Searched Location</h3><p>${address}</p></div>`,
                        position: [coordinates.lon, coordinates.lat]
                    });

                    marker.events.add('click', () => {
                        popup.open(map);
                    });
                } else {
                    console.error('Invalid coordinates in the response:', firstResult.position);
                    alert('No valid coordinates found for your search query.');
                }
            } else {
                alert('No results found for your search query.');
            }
        })
        
}

// Attach the searchLocation function to the global scope
window.searchLocation = searchLocation;


}
,
async function loadParkingSpaces() {
try {
    const response = await fetch('/rent-space');
    const parkingSpaces = await response.json();

    if (parkingSpaces.length === 0) {
        console.log('No parking spaces available.');
        return;
    }

    parkingSpaces.forEach(space => {
        const [latitude, longitude] = space.location.split(',').map(coord => parseFloat(coord.trim()));
        const marker = new atlas.HtmlMarker({
            color: 'DodgerBlue',
            text: space.price.toString(),
            position: [longitude, latitude]
        });
        map.markers.add(marker);
    });

    console.log(`${parkingSpaces.length} parking spaces loaded.`);
} catch (err) {
    console.error('Error loading parking spaces:', err);
}
GetMap();
document.getElementById('signupForm').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        event.preventDefault();
    }
});
document.getElementById('bookingForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const parkingSpaceId = document.getElementById('parkingSpaceId').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    try {
        const response = await fetch('/bookings/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                parkingSpaceId,
                startTime,
                endTime
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        } else {
            const result = await response.json();
            alert('Booking successful!');
        }
    } catch (error) {
        console.error('Error booking parking spot:', error);
        alert('An error occurred while booking the parking spot.');
    }
});
});

document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([0, 0], 2); // World view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const messageDiv = document.getElementById('message');

    function fetchParkingSpaces() {
        fetch('/api/parkingspaces')
            .then(response => response.json())
            .then(data => {
                data.forEach(space => {
                    L.marker([space.location.lat, space.location.lng])
                        .addTo(map)
                        .bindPopup(`<b>${space.name}</b><br>${space.description}`);
                });
            })
            .catch(error => console.error('Error fetching parking spaces:', error));
    }

    function showMessage(message) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    fetchParkingSpaces();

    // Simulate a successful listing message for demonstration purposes
    const successMessage = 'Parking space successfully listed.';
    showMessage(successMessage);
});
