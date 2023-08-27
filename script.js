// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =  "pk.eyJ1IjoiaHptIiwiYSI6ImNsY3FjMTNhZDAyNWkzb3AzOGl3OGl4dWIifQ.YvRmfyUvojKRDf696nYhkg";

const map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-4.256, 55.863],
    zoom: 13.5
});

// Function to convert time slider value to actual time string
function sliderValueToTime(value) {
    let baseTime = 4.5 * 60; // 4:30 in minutes
    let timeInMinutes = baseTime + (value - 1) * 30; // Each step represents 30 minutes
    let hours = Math.floor(timeInMinutes / 60);
    let minutes = timeInMinutes % 60;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
}

// Function to format popup content
function formatPopupContent(properties) {
    let content = '';
    for (const [key, value] of Object.entries(properties)) {
        content += `${key}: ${value} <br>`;
    }
    return content;
}

map.on('load', () => {
    map.addLayer({
        id: 'crimes',
        type: 'circle',
        source: {
            type: 'geojson',
            data: "https://api.mapbox.com/datasets/v1/hzm/cllkj5iw549pz2cp352fiudp2/features?access_token=pk.eyJ1IjoiaHptIiwiYSI6ImNsY3FjMTNhZDAyNWkzb3AzOGl3OGl4dWIifQ.YvRmfyUvojKRDf696nYhkg"
        },
        paint: {
            'circle-radius': 10,
            'circle-color': '#eb4d4b',
            'circle-opacity': 0.9
        }
    });

    // Initialize with all features visible
    map.setFilter('crimes', null);

    // Months array
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Slider for month
    const slider = document.getElementById('slider');
    const activeMonthLabel = document.getElementById('active-month');

    slider.addEventListener('input', function () {
        const selectedMonth = parseInt(this.value);
        const selectedMonthText = months[selectedMonth - 1];
        activeMonthLabel.textContent = selectedMonthText;
        map.setFilter('crimes', ['==', ['get', 'month'], selectedMonthText]);
    });

    // Slider for time
    const timeSlider = document.getElementById('timeSlider');
    const activeTimeLabel = document.getElementById('active-time');

    timeSlider.addEventListener('input', function () {
        const selectedTime = sliderValueToTime(parseInt(this.value));
        activeTimeLabel.textContent = selectedTime;
        map.setFilter('crimes', ['==', ['get', 'time'], selectedTime]);
    });
    
    let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Mousemove event to display popup
    map.on('mousemove', 'crimes', function (e) {
        const feature = e.features[0];
        if (feature) {
            const coordinates = feature.geometry.coordinates.slice();
            const description = formatPopupContent(feature.properties);

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            
            popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        }
    });

    // Mouseleave event to remove popup
    map.on('mouseleave', 'crimes', function() {
        popup.remove();
    });
});