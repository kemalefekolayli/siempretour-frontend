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
// Base map: OpenFreeMap "positron" vector style (free, no API key, commercial use allowed),
// drawn through MapLibre GL so place names can be shown in Turkish/English instead of the
// local script (raster OSM tiles show e.g. Japanese or Khmer labels). CARTO, used before,
// now answers with "API KEY REQUIRED" tiles. If MapLibre isn't available, fall back to
// raster OpenStreetMap tiles.
const TOUR_MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

function tourMapLabelExpression() {
    const lang = typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
    const order = lang === 'en'
        ? ['name:en', 'name_en', 'name:latin', 'name']
        : ['name:tr', 'name:en', 'name_en', 'name:latin', 'name'];
    return ['coalesce'].concat(order.map(key => ['get', key]));
}

function addTourBaseMap(map) {
    if (typeof L.maplibreGL === 'function' && window.maplibregl) {
        try {
            const layer = L.maplibreGL({
                style: TOUR_MAP_STYLE,
                attributionControl: false,
                preserveDrawingBuffer: true // keeps the map visible when the page is printed
            }).addTo(map);
            map.attributionControl.addAttribution(
                '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
            );
            // The MapLibre map only exists once the Leaflet map has a view (set later by
            // fitBounds), so the label language is applied from whenReady.
            map.whenReady(() => {
                try {
                    const gl = layer.getMaplibreMap();
                    if (!gl) return;
                    const applyLabels = () => {
                        const style = gl.getStyle();
                        if (!style || !style.layers) return;
                        const expr = tourMapLabelExpression();
                        style.layers.forEach(l => {
                            if (l.type === 'symbol' && l.layout && l.layout['text-field']) {
                                gl.setLayoutProperty(l.id, 'text-field', expr);
                            }
                        });
                    };
                    if (gl.isStyleLoaded()) applyLabels(); else gl.once('load', applyLabels);
                } catch (e) {
                    console.warn('Harita etiket dili ayarlanamadı:', e);
                }
            });
            return;
        } catch (e) {
            console.warn('Vektör harita yüklenemedi, OpenStreetMap karolarına dönülüyor:', e);
        }
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        maxZoom: 19,
        className: 'tour-map-tiles'
    }).addTo(map);
}

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

    addTourBaseMap(tourMapInstance);

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

    const routeBounds = L.latLngBounds(latlngs);
    tourMapInstance.fitBounds(routeBounds, { padding: [60, 60] });

    // Yazdırma (PDF) için harita örneğini ve rota sınırlarını dışa aç.
    window.tourMapInstance = tourMapInstance;
    window.tourRouteBounds = routeBounds;
}
