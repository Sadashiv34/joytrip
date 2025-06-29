// Global variables
let userLatLng = null;
let userMarker = null;
let searchRadius = 30; // Default radius in km
let currentPlaces = [];
const placeCache = new Map(); // Cache for API responses
let isFetching = false; // Prevent multiple simultaneous requests

// Initialize map with mobile-friendly settings
const map = L.map('map', {
    zoomControl: false, // We'll add a custom zoom control
    tap: !L.Browser.mobile, // Disable tap on mobile devices
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    zoomSnap: 0.5,
    zoomDelta: 1,
    wheelPxPerZoomLevel: 60,
    tapTolerance: 15,
    touchZoom: L.Browser.touch && !L.Browser.android23 && !L.Browser.mobileOpera,
    bounceAtZoomLimits: false,
    preferCanvas: true,          // Render vector layers on canvas for better performance
    updateWhenIdle: true         // Delay expensive updates until interactions stop
});

// Add Geoapify tile layer
L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=49f54774eecb471b98f1afec04a2df6a', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    minZoom: 2,
    detectRetina: false,       // Disable retina tiles to halve payload size
    updateWhenIdle: true,      // Defer tile loading during map move
    reuseTiles: true,          // Reuse previously loaded tiles
    keepBuffer: 8              // Retain tiles outside the viewport for smoother pans
}).addTo(map);

// Add zoom control with a better position for mobile
L.control.zoom({
    position: 'bottomright',
    zoomInTitle: 'Zoom in',
    zoomOutTitle: 'Zoom out'
}).addTo(map);

// Add touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

// Add tap delay for touch devices
if (isTouchDevice) {
    L.DomEvent.on(document, 'click', L.DomEvent.stopPropagation);
}

// Get DOM elements
const mapElement = document.getElementById('map');
const radiusSelect = document.getElementById('radius');

// Update search radius when dropdown changes
radiusSelect.addEventListener('change', () => {
    const radius = parseInt(radiusSelect.value);
    updateSearchRadius(radius * 1000); // Convert km to meters
});

// Initial radius update
updateSearchRadius(parseInt(radiusSelect.value) * 1000); // Convert km to meters

// Function to update the search radius and refresh places
async function updateSearchRadius(radiusMeters) {
    if (!userLatLng) return;
    
    // Show loading state without blocking the UI
    updateLoading(`Searching within ${searchRadius} km...`);
    
    // Use requestAnimationFrame to keep the UI responsive
    requestAnimationFrame(async () => {
        try {
            // Remove existing markers except user location in the next frame
            requestAnimationFrame(() => {
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker && layer !== userMarker) {
                        map.removeLayer(layer);
                    }
                });
            });
            
            // Get new places with updated radius
            const touristPlaces = await getNearbyTouristPlaces(
                userLatLng.lat, 
                userLatLng.lng, 
                radiusMeters
            );
            
            // Add markers in a separate frame
            requestAnimationFrame(() => {
                if (touristPlaces.length > 0) {
                    addTouristPlaceMarkers(touristPlaces);
                    updateLoading(`Found ${touristPlaces.length} places`);
                } else {
                    updateLoading('No places found');
                }
                
                // Hide loading after a short delay
                setTimeout(hideLoading, 1000);
            });
            
        } catch (error) {
            console.error('Error updating places:', error);
            updateLoading('Error loading places');
            setTimeout(hideLoading, 1500);
        }
    });
}

// Loading element (now hidden permanently)
const loadingElement = document.getElementById('loading');
if (loadingElement) loadingElement.style.display = 'none';

// Loading functions now no-op to avoid overlay
function updateLoading(_) {}


function hideLoading() {}

// Function to get user's current location with improved accuracy
function getUserLocation(desiredAccuracy = 30, maxWait = 12000) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('Geolocation is not supported by your browser'));
        }

        updateLoading('Getting precise location…');

        let resolved = false;
        let bestPosition = null;

        const finalize = (pos) => {
            if (resolved) return;
            resolved = true;
            navigator.geolocation.clearWatch(watchId);
            clearTimeout(fallbackTimer);
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        };

        const handleError = (err) => {
            if (resolved) return;
            resolved = true;
            navigator.geolocation.clearWatch(watchId);
            clearTimeout(fallbackTimer);
            reject(err);
        };

        // Continuously watch until accuracy threshold met
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                bestPosition = pos;
                if (pos.coords.accuracy && pos.coords.accuracy <= desiredAccuracy) {
                    finalize(pos);
                }
            },
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: maxWait
            }
        );

        // Fallback after maxWait ms: use best position so far or low-accuracy quick read
        const fallbackTimer = setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (bestPosition) {
                finalize(bestPosition);
            } else {
                // Final fallback: non-high-accuracy request (fast)
                navigator.geolocation.getCurrentPosition(
                    finalize,
                    handleError,
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
                );
            }
        }, maxWait);
    });
}

// Function to fetch places for a single category with caching
async function fetchPlacesForCategory(category, bbox, apiKey) {
    const cacheKey = `${category}_${bbox}`;
    
    // Return cached results if available
    if (placeCache.has(cacheKey)) {
        return placeCache.get(cacheKey);
    }
    
    // Prevent multiple simultaneous requests for the same category and bbox
    if (isFetching) {
        return [];
    }
    
    isFetching = true;
    
    try {
        // Use Promise.race to implement a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(
            `https://api.geoapify.com/v2/places?categories=${category}&filter=rect:${bbox}&limit=20&apiKey=${apiKey}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            console.warn(`API request failed for category ${category}:`, errorData);
            return [];
        }

        const data = await response.json();
        const features = data.features || [];
        
        // Cache the results
        placeCache.set(cacheKey, features);
        
        return features;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn(`Request timed out for category ${category}`);
        } else {
            console.error(`Error fetching places for category ${category}:`, error);
        }
        return [];
    } finally {
        isFetching = false;
    }
}

// Function to get nearby tourist places—optimized: single API call + aggressive caching
async function getNearbyTouristPlaces(lat, lng, radius = 30000) {
    try {
        updateLoading('Finding nearby tourist places...');

        // Calculate bounding box centre → bbox string (reduced precision for cache-friendly key)
        const earthRadius = 6371000; // m
        const latDelta = (radius / earthRadius) * (180 / Math.PI);
        const lngDelta = (radius / (earthRadius * Math.cos(Math.PI * lat / 180))) * (180 / Math.PI);

        const bbox = [
            (lng - lngDelta).toFixed(6),
            (lat - latDelta).toFixed(6),
            (lng + lngDelta).toFixed(6),
            (lat + latDelta).toFixed(6)
        ].join(',');

        // Return cached result if available
        const cacheKey = `tour_places_${bbox}`;
        if (placeCache.has(cacheKey)) {
            return placeCache.get(cacheKey);
        }

        const categories = [
            'tourism.attraction',
            'entertainment.museum',
            'entertainment.theme_park',
            'building.historic',
            'entertainment.culture'
        ].join(',');

        const apiKey = '49f54774eecb471b98f1afec04a2df6a';
        const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=rect:${bbox}&limit=30&sort=distance&apiKey=${apiKey}`;

        // 5-second timeout to avoid hanging UI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn('Places request failed:', await response.text());
            return [];
        }

        const data = await response.json();
        const places = data.features || [];

        // Cache and trim to keep UI snappy
        placeCache.set(cacheKey, places);
        return places.slice(0, 20);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Places request timed out');
        } else {
            console.error('Error fetching tourist places:', error);
        }
        updateLoading('Unable to load places');
        return [];
    }
}

// Function to add markers for tourist places
async function addTouristPlaceMarkers(places) {
    for (const place of places) {
        const { lat, lon } = place.properties;
        const { name, categories, address_line2 } = place.properties;
        
        const category = categories ? categories[0].split('.').pop() : 'place';
        const address = address_line2 || 'No address available';
        
        // Create tourist place marker with simple blue icon and pulse effect
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'tourist-place-marker',
                html: `
                    <div class="location-marker">
                        <div class="location-pin">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#4285F4"/>
                                <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" fill="white"/>
                            </svg>
                        </div>
                        <div class="pulse-ring"></div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            })
        }).addTo(map);
        
        // Initial popup content
        const popupContent = `
            <div class="place-popup">
                <h3>${name}</h3>
                <p><em>${category}</em></p>
                <p>${address}</p>
                <div class="distance-loading">Calculating distance...</div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event to calculate distance when popup opens
        marker.on('popupopen', async () => {
            try {
                if (userLatLng) {
                    const response = await fetch(
                        `https://api.geoapify.com/v1/routing?` +
                        `waypoints=${userLatLng.lat},${userLatLng.lng}|${lat},${lon}` +
                        `&mode=drive` +
                        `&apiKey=d3840f8cbe13433cad0391baaeb42431`
                    );
                    
                    const data = await response.json();
                    
                    if (data.features && data.features[0]) {
                        const distance = (data.features[0].properties.distance / 1000).toFixed(1);
                        const time = Math.ceil(data.features[0].properties.time / 60);
                        
                        // Update popup with distance information
                        marker.setPopupContent(`
                            <div class="place-popup">
                                <h3>${name}</h3>
                                <p><em>${category}</em></p>
                                <p>${address}</p>
                                <div class="distance-info">
                                    <strong>Distance:</strong> ${distance} km<br>
                                    <strong>Travel Time:</strong> ~${time} min by car
                                </div>
                            </div>
                        `);
                    }
                }
            } catch (error) {
                console.error('Error calculating distance:', error);
                marker.setPopupContent(`
                    <div class="place-popup">
                        <h3>${name}</h3>
                        <p><em>${category}</em></p>
                        <p>${address}</p>
                        <div class="distance-error">
                            Could not calculate distance
                        </div>
                    </div>
                `);
            }
        });
    }
}

// Main function to initialize the map
async function initializeMap() {
    try {
        // Get user's current location quickly (accept first fix)
        const userLocation = await getUserLocation(Infinity, 8000);
        const { lat, lng } = userLocation;
        
        // Store user location
        userLatLng = { lat, lng };
        
        // Set map view to user's location
        map.setView([lat, lng], 13);
        
        // Create a modern user location marker with pulse effect
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
                <div class="location-marker">
                    <div class="location-pin">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring delay"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48],
            popupAnchor: [0, -10]
        });
        
        userMarker = L.marker([lat, lng], { 
            icon: userIcon,
            zIndexOffset: 1000
        }).addTo(map);
        
        userMarker.bindPopup('<b>Your Location</b>', {
            closeButton: true,
            autoClose: false,
            closeOnClick: false,
            className: 'user-location-popup'
        }).openPopup();
        
        // Show radius controls
        radiusControls.style.display = 'flex';
        
        // Get nearby tourist places with default radius
        const touristPlaces = await getNearbyTouristPlaces(lat, lng, searchRadius * 1000);
        
        if (touristPlaces.length > 0) {
            addTouristPlaceMarkers(touristPlaces);
            updateLoading(`Found ${touristPlaces.length} tourist places near you!`);
            
            // Zoom to show all markers
            const group = new L.featureGroup([userMarker, ...touristPlaces.map(p => 
                L.marker([p.properties.lat, p.properties.lon])
            )]);
            map.fitBounds(group.getBounds().pad(0.1));
        } else {
            updateLoading('No tourist places found nearby. Try moving to a different location.');
        }
        
        // Hide loading after a short delay
        setTimeout(hideLoading, 3000);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        updateLoading(`Error: ${error.message}`);
        
        // Set default view if location access is denied
        map.setView([0, 0], 2);
    }
}

// Start the application
initializeMap();

