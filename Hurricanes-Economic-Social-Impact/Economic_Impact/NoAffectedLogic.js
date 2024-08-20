// Initialize the map centered on the United States & Mexico (East Coast)
const map = L.map('map').setView([29.7749, -86.4194], 5.35);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Color Bins to be used for markers based on No. Affected
const bins = [
    { max: 50000, color: 'green', label: '50,000 or less' },
    { max: 250000, color: 'blue', label: '50,001 - 250,000' },
    { max: 500000, color: 'purple', label: '250,001 - 500,000' },
    { max: Infinity, color: 'red', label: 'More than 500,000' }
];

// Store Layers
const colorLayers = {};

// Function to get color based on No. Affected
function getColor(noAffected) {
    for (const bin of bins) {
        if (noAffected <= bin.max) {
            return bin.color;
        }
    }
    return 'gray';
}

// Function to format numbers with commas
function formatNumber(value) {
    return value.toLocaleString(); 
}

// Function to update markers based on filter
function updateMarkers() {
    if (Object.keys(colorLayers).length) {
        for (const color in colorLayers) {
            map.removeLayer(colorLayers[color]);
        }
    }

    // Select ranges with filter
    const selectedBins = Array.from(document.querySelectorAll('.affected-filter:checked')).map(el => parseFloat(el.getAttribute('data-max')));
    const colorsToShow = Array.from(document.querySelectorAll('.affected-filter:checked')).map(el => el.dataset.max);

    // Create new layer group for each color
    const layersByColor = bins.reduce((acc, bin) => {
        acc[bin.color] = L.layerGroup().addTo(map);
        return acc;
    }, {});

    // Fetch and add GeoJSON data to the map
    fetch('data.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const noAffected = feature.properties['No. Affected'];
                const color = getColor(noAffected);
                if (colorsToShow.includes(String(bins.find(bin => bin.color === color).max))) {
                    const locationName = feature.properties['Location'] || 'Unknown Location';
                    L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                        radius: 12.5, 
                        fillColor: color,
                        color: color,
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.25 
                    }).bindPopup(`
                        <strong>No. Affected:</strong> ${formatNumber(noAffected)}<br>
                        <strong>Location:</strong> ${locationName}<br>
                        <strong>Details:</strong> ${feature.properties.Name || 'N/A'}
                    `).addTo(layersByColor[color]);
                }
            });
            // Update color layers map
            Object.assign(colorLayers, layersByColor);
        })
        .catch(error => console.error('Error fetching GeoJSON:', error));
}

// Filter checkboxes & markers - associate with color/bin
document.querySelectorAll('.affected-filter').forEach(checkbox => {
    checkbox.addEventListener('change', updateMarkers);
});

// Initialize the map with all filters enabled
updateMarkers();

// Create and add legend
const legend = L.control({ position: 'bottomleft' });

legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white'; 
    div.style.border = '2px solid black';
    div.style.padding = '10px'; 
    div.style.borderRadius = '5px'; 

    div.innerHTML = '<h4>Number of People Affected</h4>';
    
    bins.forEach(bin => {
        div.innerHTML +=
            '<i style="background:' + bin.color + '; width: 20px; height: 20px; display: inline-block; border: 1px solid black;"></i> ' +
            bin.label + '<br>';
    });

    return div;
};

legend.addTo(map);
