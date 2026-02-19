// ======================================================
// TEMPLATE TOUR MAP - DISTANCE BASED CURVE VERSION
// ======================================================

let tourMapInstance = null;

// --------------------
// Haversine distance (km)
// --------------------
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// --------------------
// Quadratic Bezier Curve
// --------------------
function createCurve(start, end) {

    const latlngs = [];
    const offset = 0.3; // curve strength

    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;

    const dx = end[1] - start[1];
    const dy = end[0] - start[0];

    const controlLat = midLat - dx * offset;
    const controlLng = midLng + dy * offset;

    const steps = 40;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        const lat =
            (1 - t) * (1 - t) * start[0] +
            2 * (1 - t) * t * controlLat +
            t * t * end[0];

        const lng =
            (1 - t) * (1 - t) * start[1] +
            2 * (1 - t) * t * controlLng +
            t * t * end[1];

        latlngs.push([lat, lng]);
    }

    return latlngs;
}

// --------------------
// Main Render
// --------------------
function renderRouteMap(routeCoordinates) {

    const mapContainer = document.getElementById('mappp');
    if (!mapContainer) return;

    if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0) {
        mapContainer.innerHTML = "";
        return;
    }

    if (tourMapInstance) {
        tourMapInstance.remove();
        tourMapInstance = null;
    }

    mapContainer.innerHTML = "";

    tourMapInstance = L.map('mappp', {
        zoomControl: true,
        scrollWheelZoom: false
    });

    // Minimal premium tile
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '&copy; OpenStreetMap &copy; CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
        }
    ).addTo(tourMapInstance);

    const latlngs = [];

    routeCoordinates.forEach((point, index) => {

        if (!point.lat || !point.lng) return;

        const latlng = [point.lat, point.lng];
        latlngs.push(latlng);

        const markerIcon = L.divIcon({
            className: "map-route-marker",
            html: `<span>${index + 1}</span>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        L.marker(latlng, { icon: markerIcon })
            .addTo(tourMapInstance)
            .bindPopup(`
                <div style="font-weight:600">
                    ${index + 1}. ${point.name}
                </div>
                <div style="font-size:13px">
                    ${point.country || ""}
                </div>
            `);
    });

    if (latlngs.length === 0) return;

    // --------------------
    // Draw segments one by one
    // --------------------
    for (let i = 0; i < latlngs.length - 1; i++) {

        const start = latlngs[i];
        const end = latlngs[i + 1];

        const distance = getDistance(
            start[0], start[1],
            end[0], end[1]
        );

        let segment;

        // 🔥 Threshold: 800 km
        if (distance > 800) {
            segment = createCurve(start, end);
        } else {
            segment = [start, end];
        }

        L.polyline(segment, {
            color: "#000000",
            weight: 3,
            opacity: 0.9,
            dashArray: "8,8"
        }).addTo(tourMapInstance);
    }

    tourMapInstance.fitBounds(L.latLngBounds(latlngs), {
        padding: [60, 60]
    });
}
