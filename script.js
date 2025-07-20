// Default view constants
const DEFAULT_CENTER = [90.41, 23.81];
const DEFAULT_ZOOM = 6;

const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',

    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: DEFAULT_ZOOM
});

// File paths   
const defaultGeoJsonPathADM3 = './allGeoJSON/ADM3_filtered_mapshift.json';
const defaultGeoJsonPathADM2 = './allGeoJSON/ADM2_filtered_mapshift.json';
const defaultGeoJsonPathADM4 = './allGeoJSON/ADM4_filtered_mapshift.json';
const kilnsGeoJsonPath = './Excel to JSON/AllJson/kilns.geojson';
//const kilnsGeoJsonPath = 'http://localhost:3000/API/get_geojson.php';


const controlInfoPath = './Excel to JSON/AllJson/controlInfo.json';
//const controlInfoPath = 'http://localhost:3000/API/get_geojson_ControlInfo.php';



// Global Variables for selected filters for output panel
let districtCount = 0;
let upazilaCount = 0;
let unionCount = 0;
let kilnCount = 0;
let harmrateCountSumCount = "0.00";
let isInitialLoad_forScorll = true;
let firstTimeLoad = true;

// Animation function for smooth opacity transition
function fadeLayer(layerId, property, targetValue, duration = 1000) {
    const startTime = performance.now();
    const initialValue = map.getPaintProperty(layerId, property) || 0;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newValue = initialValue + (targetValue - initialValue) * progress;

        map.setPaintProperty(layerId, property, newValue);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}



// Helper function to convert RGB string to hex color
function rgbToHex(rgbString) {
    const [r, g, b] = rgbString.split(' ').map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
function zoomToFeatures(features) {
    if (!features.length) return;

    if (features.length === 1) {
        // Single feature: Zoom to its coordinates with a lower zoom level
        const coords = features[0].geometry.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
            console.error('Invalid coordinates for single feature:', coords);
            return;
        }
        map.flyTo({
            center: coords,
            zoom: 17, // Lower zoom level for single feature
            duration: 1000
        });
    } else {
        // Multiple features: Fit to bounds
        const coordinates = features.map(f => f.geometry.coordinates);
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));


        if (firstTimeLoad) {
            map.fitBounds(bounds, { padding: 1000, duration: 1000 });
            firstTimeLoad = false;
        }
        else {
            map.fitBounds(bounds, { padding: 50, duration: 1000 });

        }

    }
}
// Function to zoom to a specific marker
function zoomToMarker(coords) {
    if (!coords || !Array.isArray(coords) || coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        console.error('Invalid coordinates for zooming:', coords);
        return;
    }
    map.flyTo({
        center: coords,
        zoom: 17,
        duration: 1000
    });
}

// Function to reset to default zoom
function resetZoom() {
    selectedDistrict = null;
    selectedUpazila = null;
    selectedUnion = null;
    selectedKilnType = null;
    selectedHarmRange = null;
    document.getElementById('districtDropdown').textContent = 'Select District';
    document.getElementById('upazilaDropdown').textContent = 'Select Upazila';
    document.getElementById('unionDropdown').textContent = 'Select Union';
    document.getElementById('kilnTypeDropdown').textContent = 'Select Kiln Type';
    document.getElementById('harmRangeDropdown').textContent = 'Select Harm Range';

    // Repopulate all dropdowns with full options
    updateUpazilaDropdown();
    updateUnionDropdown();
    updateKilnTypeDropdown();
    updateHarmRangeDropdown();

    applyFilters();
    map.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1000
    });

    const coordinateSection = document.querySelector('.coordinates-section');
    if (coordinateSection) {
        coordinateSection.classList.add('d-none');
    }
}

/* loading screen logic here */

// Update the loading progress
function updateLoadingProgress(completed, total) {
    const percentage = Math.round((completed / total) * 100);
    const bar = document.querySelector('.bar');
    const valueSpan = document.getElementById('valueSpan');

    // Update bar width and percentage text
    bar.style.width = `${percentage}%`;
    /* valueSpan.textContent = `${percentage}%`; */

}



// Fetch all data
async function fetchData() {
    try {
        const totalFetches = 5;
        let completedFetches = 0;


        const kilnsResponse = await fetch(kilnsGeoJsonPath);
        if (!kilnsResponse.ok) throw new Error(`Kilns HTTP error! Status: ${kilnsResponse.status}`);
        const kilnsData = await kilnsResponse.json();
        completedFetches++;
        updateLoadingProgress(completedFetches, totalFetches);


        const adm3Response = await fetch(defaultGeoJsonPathADM3);
        if (!adm3Response.ok) throw new Error(`ADM3 HTTP error! Status: ${adm3Response.status}`);
        const adm3Data = await adm3Response.json();
        completedFetches++;
        updateLoadingProgress(completedFetches, totalFetches);



        const adm2Response = await fetch(defaultGeoJsonPathADM2);
        if (!adm2Response.ok) throw new Error(`ADM2 HTTP error! Status: ${adm2Response.status}`);
        const adm2Data = await adm2Response.json();
        completedFetches++;
        updateLoadingProgress(completedFetches, totalFetches);



        const controlResponse = await fetch(controlInfoPath);
        if (!controlResponse.ok) throw new Error(`Control Info HTTP error! Status: ${controlResponse.status}`);
        const controlData = await controlResponse.json();
        completedFetches++;
        updateLoadingProgress(completedFetches, totalFetches);


        const adm4Response = await fetch(defaultGeoJsonPathADM4);
        if (!adm4Response.ok) throw new Error(`ADM4 HTTP error! Status: ${adm4Response.status}`);
        const adm4Data = await adm4Response.json();
        completedFetches++;
        updateLoadingProgress(completedFetches, totalFetches);

        const excludeMap = new Map();
        controlData.forEach(item => excludeMap.set(item.Upazila, item.exclude));
        const filteredADM3Features = adm3Data.features.filter(feature => {
            const upazilaName = feature.properties.shapeName;
            const excludeValue = excludeMap.get(upazilaName);
            return excludeValue === 0 || excludeValue === undefined;
        });
        const filteredADM3GeoJson = { type: 'FeatureCollection', crs: adm3Data.crs, features: filteredADM3Features };

        return { adm3Data: filteredADM3GeoJson, adm2Data, adm4Data, kilnsData, controlData };
    } catch (error) {
        console.error('Error fetching data:', error.message);
        document.getElementById('map').innerHTML = `
            <div style="color: red; padding: 20px;">
                Failed to load data: ${error.message}<br>
                Check console for more details and ensure files exist at: ${defaultGeoJsonPathADM3}, ${defaultGeoJsonPathADM2}, ${defaultGeoJsonPathADM4}, ${kilnsGeoJsonPath}, and ${controlInfoPath}
            </div>`;
        throw error;
    }
}

function setupMap(data) {
    map.addSource('adm3-source', { 'type': 'geojson', 'data': data.adm3Data });
    map.addLayer({
        'id': 'adm3-polygons',
        'type': 'fill',
        'source': 'adm3-source',
        'layout': {},
        'paint': {
            'fill-color': '#888888',
            'fill-opacity': 0
        }
    });
    fadeLayer('adm3-polygons', 'fill-opacity', 0.4, 1000);

    // Red (adm4-borders, bottom layer)
    const adm4AppearZoomLevel = 9;
    map.addSource('adm4-source', { 'type': 'geojson', 'data': data.adm4Data });
    map.addLayer({
        'id': 'adm4-borders',
        'type': 'line',
        'source': 'adm4-source',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-color': '#e73e6f', 'line-width': 1, 'line-opacity': 0 },
        'minzoom': adm4AppearZoomLevel
    });

    // White (adm3-borders, middle layer)
    const adm3AppearZoomLevel = 10;
    map.addLayer({
        'id': 'adm3-borders',
        'type': 'line',
        'source': 'adm3-source',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0 },
        'minzoom': adm3AppearZoomLevel
    });

    // Yellow (adm2-borders, top layer)
    const adm2AppearZoomLevel = 8;
    map.addSource('adm2-source', { 'type': 'geojson', 'data': data.adm2Data });
    map.addLayer({
        'id': 'adm2-borders',
        'type': 'line',
        'source': 'adm2-source',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-color': '#FFFF00', 'line-width': 2, 'line-opacity': 0 },
        'minzoom': adm2AppearZoomLevel
    });

    map.on('zoom', () => {
        const currentZoom = map.getZoom();
        const adm2Opacity = map.getPaintProperty('adm2-borders', 'line-opacity');
        if (currentZoom >= adm2AppearZoomLevel && adm2Opacity === 0) {
            fadeLayer('adm2-borders', 'line-opacity', 0.8, 1000);
        }
        const adm4Opacity = map.getPaintProperty('adm4-borders', 'line-opacity');
        if (currentZoom >= adm4AppearZoomLevel && adm4Opacity === 0) {
            fadeLayer('adm4-borders', 'line-opacity', 0.8, 1000);
        } else if (currentZoom < adm4AppearZoomLevel && adm4Opacity > 0) {
            fadeLayer('adm4-borders', 'line-opacity', 0, 1000);
        }
        const adm3Opacity = map.getPaintProperty('adm3-borders', 'line-opacity');
        if (currentZoom >= adm3AppearZoomLevel && adm3Opacity === 0) {
            fadeLayer('adm3-borders', 'line-opacity', 0.8, 1000);
        } else if (currentZoom < adm3AppearZoomLevel && adm3Opacity > 0) {
            fadeLayer('adm3-borders', 'line-opacity', 0, 1000);
        }
    });
}

// Show Google Maps link in panel
function showGoogleMapLink(googleMapUrl, fid) {
    const googleMapPanel = document.querySelector('.google-map-panel');
    const googleMapContent = document.getElementById('googleMapContent');
    if (googleMapUrl) {
        googleMapContent.innerHTML = `
            <p><strong>FID ${fid}:</strong> <a href="${googleMapUrl}" target="_blank">Click here for google map direction</a></p>
        `;
    } else {
        googleMapContent.innerHTML = `
            <p><strong>FID ${fid}:</strong> No Google Maps link available</p>
        `;
    }
    googleMapPanel.classList.remove('d-none');
    googleMapPanel.classList.add('show');
}

// Create table in sidebar
function createTable(features) {
    const sidebar = document.querySelector('.mapClass');
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered ';
    //table.className = 'table table-group-divider table-bordered ';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>FID</th>
            <th>District</th>
            <th>Upazila</th>
            <th>Union</th>
            <th>Name</th>
            <th>Type</th>
            <th>Health Harm</th>
            <th>In Paura Shava</th>
            <th>1km Clinic</th>
            <th>1km ECA</th>
            <th>1km School</th>
            <th>2km Forest</th>
            <th>1km Railway</th>
            <th>1km Wetland</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    features.forEach(feature => {
        const row = document.createElement('tr');
        row.setAttribute('data-fid', feature.properties.FID || 'N/A');
        row.innerHTML = `
            <td>${feature.properties.FID || 'N/A'}</td>
            <td>${feature.properties.District || 'N/A'}</td>
            <td>${feature.properties.Upazila || 'N/A'}</td>
            <td>${feature.properties.Union || 'N/A'}</td>
            <td>${feature.properties.NAME || 'N/A'}</td>
            <td>${feature.properties.Type_correct || 'N/A'}</td>
            <td>${feature.properties.health_harm_index_numerical || 'N/A'}</td>
            <td>${feature.properties.in_paurashava || 'N/A'}</td>
            <td>${feature.properties['1km_clinic'] || 'N/A'}</td>
            <td>${feature.properties['1km_eca'] || 'N/A'}</td>
            <td>${feature.properties['1km_school'] || 'N/A'}</td>
            <td>${feature.properties['2km_forest'] || 'N/A'}</td>
            <td>${feature.properties['1km_railway'] || 'N/A'}</td>
            <td>${feature.properties['1km_wetland'] || 'N/A'}</td>
        `;
        row.addEventListener('click', () => {
            const fid = row.getAttribute('data-fid');
            const selectedFeature = features.find(f => f.properties.FID == fid);
            if (selectedFeature) {
                updateGauge(selectedFeature.properties.health_harm_index_numerical / 100);
                showGoogleMapLink(selectedFeature.properties.google_map, fid);
                zoomToMarker(selectedFeature.geometry.coordinates);
                updateOutputPanel(
                    districtCount,
                    upazilaCount,
                    selectedFeature.properties.Union || 'NaN',
                    kilnCount,
                    selectedFeature.properties.health_harm_index_numerical || '0.00',
                    selectedFeature.geometry.coordinates || null
                );
                const coordinatesSection = document.querySelector('.coordinates-section');
                const kilnCountSection = document.querySelector('.kiln-count-section');
                if (coordinatesSection) {
                    coordinatesSection.classList.remove('d-none');
                    kilnCountSection.classList.add('d-none');

                }
            }
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    sidebar.innerHTML = '';
    sidebar.appendChild(table);
}

function updateGauge(value) {
    if (value < 0 || value > 1) return;

    let snappedValue = 0;
    let label = '';

    if (value <= 0.20) {
        snappedValue = 0.10;  // middle of 0 to 0.20
        label = 'Least harmful';
    } else if (value <= 0.35) {
        snappedValue = 0.275; // middle of 0.20 to 0.35
        label = 'Less harmful than most kilns';
    } else if (value <= 0.50) {
        snappedValue = 0.425; // middle of 0.35 to 0.50
        label = 'Moderately harmful';
    } else if (value <= 0.70) {
        snappedValue = 0.60;  // middle of 0.50 to 0.70
        label = 'More harmful than most kilns';
    } else {
        snappedValue = 0.85;  // middle of 0.70 to 1.00+
        label = 'Most harmful';
    }

    // Calculate angle (0 to 1 scaled to -90 to +90 degrees)
    const angle = (snappedValue * 180) - 90;
    tick.style.transform = `translateX(-50%) rotate(${angle}deg)`;

    // Show snapped value & label for debugging yarr
    //valueDisplay.textContent = `${snappedValue.toFixed(2)} - ${label}`;
}

function updateOutputPanel(districtCount, upazilaCount, unionCount, kilnCount, harmrateCountSumCount, coordinates = null) {
    const outputPanel = document.querySelector('.outputPanel');

    if (kilnCount == "NaN") {
        kilnCount = "Name of the kiln is not available";
    };
    /* 
    console.log("kilnCount", kilnCount); */

    // Format coordinates or show fallback
    const coordsText = coordinates && Array.isArray(coordinates) && coordinates.length === 2
        ? `<strong>Lonitude</strong> <br> ${coordinates[0].toFixed(4)}, <br><br>  <strong>Latitude</strong>:<br> ${coordinates[1].toFixed(4)}`
        : "Coordinates unavailable";

    outputPanel.innerHTML = `
        <div class="row">
            <div class="col border border-5 rounded-5 rounded-top-0 text-center district-info">
                <p><strong>Districts:</strong> ${districtCount} districts</p>
                <p><strong>Upazilas:</strong> ${upazilaCount} upazilas</p>
                <p><strong>Unions:</strong> ${unionCount} unions</p>
            </div>
            <div class="col border border-5 rounded-5 rounded-top-0 text-center kiln-info">
            
                <div class="kiln-count-section">
                    <p><strong>Number of Kiln:</strong></p>
                    <p>${kilnCount}</p>
                </div>
                
                <div class="coordinates-section d-none">
                    <p>${coordsText}</p>
                </div>
            </div>
            <div class="col border border-5 rounded-5 rounded-top-0 text-center ">
                <p><strong>Harm Rate:</strong></p>
                <div class="wrapper speedo-meter-info">
                    <div class="chart-speedo" id="chart-speedo">
                        <div class="background"></div>
                        <div class="indicator">
                            <div class="tick" id="tick"></div>
                        </div>
                    </div>
                    
                </div>
                 ${harmrateCountSumCount} 
            </div>
        </div>        
    `;
    const tick = document.getElementById('tick');
    const valueDisplay = document.getElementById('valueDisplay');
    const valueInput = document.getElementById('valueInput');

    // Automatically update gauge with harmrateCountSumCount
    const val = parseFloat(harmrateCountSumCount / 100);

    if (!isNaN(val))
        updateGauge(val);
}



// Apply filters and update markers
let markers = [];
function applyFilters() {
    markers.forEach(({ marker }) => marker.remove());
    markers = [];

    // Hide Google Maps panel when applying filters
    const googleMapPanel = document.querySelector('.google-map-panel');
    if (googleMapPanel) {
        googleMapPanel.classList.add('d-none');
        googleMapPanel.classList.remove('show');
    }

    const filteredFeatures = data.kilnsData.features.filter(f =>
        (!selectedDistrict || f.properties.District === selectedDistrict) &&
        (!selectedUpazila || f.properties.Upazila === selectedUpazila) &&
        (!selectedUnion || f.properties.Union === selectedUnion) &&
        (!selectedKilnType || f.properties.Type_correct === selectedKilnType) &&
        (!selectedHarmRange || f.properties.harm_range === selectedHarmRange)
    );

    filteredFeatures.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const color = rgbToHex(feature.properties.color || '0 0 0');
        const marker = new maplibregl.Marker({ color: color, scale: 0.8 })
            .setLngLat(coords)
            .addTo(map);

        marker.getElement().style.opacity = 0;
        setTimeout(() => {
            marker.getElement().style.transition = 'opacity 1s';
            marker.getElement().style.opacity = 1;
        }, 100);

        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        });
        const popupMinZoom = 11;
        marker.getElement().addEventListener('mouseenter', () => {
            const fid = feature.properties.FID;
            if (fid !== undefined && map.getZoom() >= popupMinZoom) {
                popup.setLngLat(coords)
                    .setHTML(`<strong>FID:</strong> ${fid}<br><strong>Type:</strong> ${feature.properties.Type_correct || 'N/A'} 
                                <br><strong>Health Harm:</strong> ${feature.properties.health_harm_index_numerical || 'N/A'}
                                <br><strong>1km Clinic:</strong> ${feature.properties['1km_clinic'] || 'N/A'}
                                <br><strong>1km ECA:</strong> ${feature.properties['1km_eca'] || 'N/A'}
                                <br><strong>1km School:</strong> ${feature.properties['1km_school'] || 'N/A'}`)
                    .addTo(map);
            }
        });

        marker.getElement().addEventListener('mouseleave', () => {
            popup.remove();
        });

        marker.getElement().addEventListener('click', () => {
            const fid = feature.properties.FID;
            const clickedFeature = markers.find(m => m.feature.properties.FID == fid)?.feature;

            if (clickedFeature) {
                createTable([clickedFeature]); // Only show that one in table
                zoomToMarker(clickedFeature.geometry.coordinates);
                updateGauge(clickedFeature.properties.health_harm_index_numerical / 100);
                showGoogleMapLink(clickedFeature.properties.google_map, fid);
                updateOutputPanel(
                    districtCount,
                    upazilaCount,
                    clickedFeature.properties.Union || 'NaN',
                    1, // kilnCount = 1 since only one is shown
                    clickedFeature.properties.health_harm_index_numerical || '0.00',
                    clickedFeature.geometry.coordinates || null
                );

                // Show/hide sections
                const coordinatesSection = document.querySelector('.coordinates-section');
                const kilnCountSection = document.querySelector('.kiln-count-section');
                if (coordinatesSection && kilnCountSection) {
                    coordinatesSection.classList.remove('d-none');
                    kilnCountSection.classList.add('d-none');
                }

                // Optional: scroll to bottom
                setTimeout(() => {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });


        markers.push({ marker, feature });
    });

    // Calculate counts for output panel
    districtCount = [...new Set(filteredFeatures.map(f => f.properties.District))].length;
    upazilaCount = [...new Set(filteredFeatures.map(f => f.properties.Upazila))].length;
    unionCount = [...new Set(filteredFeatures.map(f => f.properties.Union))].length;
    kilnCount = filteredFeatures.length;
    harmrateSum = filteredFeatures.reduce((sum, f) => {
        const value = Number(f.properties.health_harm_index_numerical);
        if (isNaN(value)) {
            return sum;
        } else {
            return sum + value;
        }
    }, 0);
    const harmrateCountSumCount = filteredFeatures.length > 0 ? (harmrateSum / filteredFeatures.length).toFixed(2) : "0.00";

    createTable(filteredFeatures);
    updateOutputPanel(districtCount, upazilaCount, unionCount, kilnCount, harmrateCountSumCount, null);
    const coordinateSection = document.querySelector('.coordinates-section');
    if (coordinateSection) {
        coordinateSection.classList.add('d-none');
    }
    zoomToFeatures(filteredFeatures);

    // Scroll to bottom only if not first load
    // I used the setTimeout to ensure the scroll happens after the map and table are fully rendered the map and table changes its height after the data is loaded and displayed
    if (!isInitialLoad_forScorll) {
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 0);
    }

    isInitialLoad_forScorll = false; // Set to false after first load

}

// Global data and filter variables
let data;
let selectedDistrict = null;
let selectedUpazila = null;
let selectedUnion = null;
let selectedKilnType = null;
let selectedHarmRange = null;

// Dropdown update and select functions
function selectDistrict(district) {
    selectedDistrict = district;
    document.getElementById('districtDropdown').textContent = district;
    selectedUpazila = null;
    selectedUnion = null;
    document.getElementById('upazilaDropdown').textContent = 'Select Upazila';
    document.getElementById('unionDropdown').textContent = 'Select Union';
    updateUpazilaDropdown();
    updateKilnTypeDropdown();
    updateHarmRangeDropdown();
    applyFilters();
}

function updateUpazilaDropdown() {
    if (!data || !data.kilnsData) return; // Guards nigga against undefined data

    const upazilas = [...new Set(data.kilnsData.features
        .filter(f =>
            (!selectedDistrict || f.properties.District === selectedDistrict) &&
            (!selectedKilnType || f.properties.Type_correct === selectedKilnType) &&
            (!selectedHarmRange || f.properties.harm_range === selectedHarmRange)
        )
        .map(f => f.properties.Upazila))].sort();

    const upazilaMenu = document.getElementById('upazilaMenu');
    upazilaMenu.innerHTML = '';
    upazilas.forEach(upazila => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#">${upazila}</a>`;
        li.onclick = () => selectUpazila(upazila);
        upazilaMenu.appendChild(li);
    });
}

function selectUpazila(upazila) {
    selectedUpazila = upazila;
    document.getElementById('upazilaDropdown').textContent = upazila;
    selectedUnion = null;
    document.getElementById('unionDropdown').textContent = 'Select Union';
    updateUnionDropdown();
    updateKilnTypeDropdown();
    updateHarmRangeDropdown();
    applyFilters();
}

function updateUnionDropdown() {
    if (!data || !data.kilnsData) return; // Guard against undefined data
    const unions = [...new Set(data.kilnsData.features
        .filter(f =>
            (!selectedDistrict || f.properties.District === selectedDistrict) &&
            (!selectedUpazila || f.properties.Upazila === selectedUpazila) &&
            (!selectedKilnType || f.properties.Type_correct === selectedKilnType) &&
            (!selectedHarmRange || f.properties.harm_range === selectedHarmRange)
        )
        .map(f => f.properties.Union))].sort();
    const unionMenu = document.getElementById('unionMenu');
    unionMenu.innerHTML = '';
    unions.forEach(union => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#">${union}</a>`;
        li.onclick = () => selectUnion(union);
        unionMenu.appendChild(li);
    });
}

function selectUnion(union) {
    selectedUnion = union;
    document.getElementById('unionDropdown').textContent = union;
    updateKilnTypeDropdown();
    updateHarmRangeDropdown();
    applyFilters();
}

function selectKilnType(type) {
    selectedKilnType = type;
    document.getElementById('kilnTypeDropdown').textContent = type;
    updateUpazilaDropdown();
    updateUnionDropdown();
    updateHarmRangeDropdown();
    applyFilters();
}

function updateKilnTypeDropdown() {
    if (!data || !data.kilnsData) return; // Guard against undefined data
    const kilnTypes = [...new Set(data.kilnsData.features
        .filter(f =>
            (!selectedDistrict || f.properties.District === selectedDistrict) &&
            (!selectedUpazila || f.properties.Upazila === selectedUpazila) &&
            (!selectedUnion || f.properties.Union === selectedUnion) &&
            (!selectedHarmRange || f.properties.harm_range === selectedHarmRange)
        )
        .map(f => f.properties.Type_correct))].sort();
    const kilnTypeMenu = document.getElementById('kilnTypeMenu');
    kilnTypeMenu.innerHTML = '';
    kilnTypes.forEach(type => {
        if (type) {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="#">${type}</a>`;
            li.onclick = () => selectKilnType(type);
            kilnTypeMenu.appendChild(li);
        }
    });
}

function selectHarmRange(range) {
    selectedHarmRange = range;
    document.getElementById('harmRangeDropdown').textContent = range;
    updateUpazilaDropdown();
    updateUnionDropdown();
    updateKilnTypeDropdown();
    applyFilters();
}

function updateHarmRangeDropdown() {
    if (!data || !data.kilnsData) return; // Guard niggas against undefined data 

    const harmRanges = [...new Set(data.kilnsData.features
        .filter(f =>
            (!selectedDistrict || f.properties.District === selectedDistrict) &&
            (!selectedUpazila || f.properties.Upazila === selectedUpazila) &&
            (!selectedUnion || f.properties.Union === selectedUnion) &&
            (!selectedKilnType || f.properties.Type_correct === selectedKilnType)
        )
        .map(f => f.properties.harm_range))].sort(); // getting all the drop down option still available after applying the filter important else initially it wont load

    const harmRangeMenu = document.getElementById('harmRangeMenu');
    harmRangeMenu.innerHTML = '';
    harmRanges.forEach(range => {
        if (range) {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="#">${range}</a>`;
            li.onclick = () => selectHarmRange(range);
            harmRangeMenu.appendChild(li);
        }
    });
}

// Main execution __constructor__ function (This is where the magic Begins)
map.on('load', async () => {
    data = await fetchData();

    setupMap(data);
    createTable(data.kilnsData.features);
    applyFilters();

    // the page is loaded for the first time, scroll to the bottom
    isInitialLoad_forScorll = false;

    // Populate district thingy dropdown -- copy this code everywhere Legit shit proud of you 
    const districts = [...new Set(data.kilnsData.features.map(f => f.properties.District))].sort();
    const districtMenu = document.getElementById('districtMenu');
    districts.forEach(district => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#">${district}</a>`;
        li.onclick = () => selectDistrict(district);
        districtMenu.appendChild(li);
    });

    // Initial population of other dropdowns
    updateUpazilaDropdown();
    updateUnionDropdown();
    updateKilnTypeDropdown();
    updateHarmRangeDropdown();

    // Fade out and hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);

    document.getElementById('resetZoom').addEventListener('click', resetZoom);
});


