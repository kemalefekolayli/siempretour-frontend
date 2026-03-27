const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate JWT token for Admin (using RS256 or HS256? Spring Boot usually uses HS256 for simple symmetric keys)
// Wait, actually Spring Boot jwt uses io.jsonwebtoken which defaults to HS256.
// Let's create an HS256 JWT in node manually to avoid npm install if possible.
const secret = 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';
function generateAdminToken() {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: 'admin@siempretour.com',
        userId: 1,
        role: 'ADMIN', // The backend might expect 'ROLE_ADMIN' or 'ADMIN', JwtTokenProvider sets it as 'ADMIN' in my previous edits
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    };
    
    const encodeBase64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedHeader = encodeBase64Url(header);
    const encodedPayload = encodeBase64Url(payload);
    
    const signature = crypto.createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
        
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const token = generateAdminToken();

const baseDataDir = path.join(__dirname, 'data');

const foldersToProcess = [
    { dir: 'big_siempre_tour_tours', lang: 'en' },
    { dir: 'big_siempre_tour_tours_tr', lang: 'tr' },
    { dir: 'siempre_tour_ship_tours', lang: 'en', forceCategory: 'SHIP' },
    { dir: 'siempre_tour_safari_tours', lang: 'en', forceCategory: 'SAFARI' }
];

// Strip null bytes and other problematic characters from strings
function cleanStr(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/\x00/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function cleanObj(obj) {
    if (typeof obj === 'string') return cleanStr(obj);
    if (Array.isArray(obj)) return obj.map(cleanObj);
    if (obj && typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = cleanObj(v);
        return out;
    }
    return obj;
}

// Parse duration safely: "4-5" → 4, "8" → 8, "" → 0
function parseDuration(val) {
    if (!val) return 0;
    const s = String(val).trim();
    const match = s.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function mapCategory(cat) {
    if (!cat) return 'OTHER';
    const c = cat.toUpperCase().trim();
    if (c.includes('CULTUR')) return 'CULTURE';
    if (c.includes('FAMIL')) return 'FAMILY';
    if (c.includes('WALK')) return 'WALKING';
    if (c.includes('WILD')) return 'WILDLIFE';
    if (c.includes('ADVENTURE')) return 'ADVENTURE';
    if (c.includes('NATURE')) return 'NATURE';
    if (c.includes('HISTOR')) return 'HISTORICAL';
    if (c.includes('FOOD') || c.includes('WINE')) return 'FOOD_AND_WINE';
    if (c.includes('BEACH')) return 'BEACH';
    if (c.includes('CITY')) return 'CITY_TOUR';
    if (c.includes('SAFARI')) return 'SAFARI';
    if (c.includes('CRUISE')) return 'CRUISE';
    if (c.includes('SHIP')) return 'SHIP';
    if (c.includes('RELIGION') || c.includes('RELIGIOUS')) return 'RELIGIOUS';
    if (c.includes('SKI')) return 'SKIING';
    if (c.includes('EXPLORE')) return 'EXPLORER';
    if (c.includes('CYCLING') || c.includes('BIKE')) return 'CYCLING';
    if (c.includes('EXPEDITION')) return 'EXPEDITION';
    if (c.includes('LUXUR')) return 'LUXURY';
    if (c.includes('YOGA') || c.includes('WELLNESS')) return 'YOGA_WELLNESS';
    if (c.includes('HORSE') || c.includes('RIDING')) return 'HORSE_RIDING';
    if (c.includes('DIVING') || c.includes('DIVE')) return 'DIVING';
    if (c.includes('HONEYMOON')) return 'HONEYMOON';
    if (c.includes('RAIL') || c.includes('TRAIN')) return 'RAIL';
    if (c.includes('POLAR')) return 'POLAR';
    return 'OTHER';
}

async function runImport() {
    let allDTOs = [];
    
    for (const job of foldersToProcess) {
        const fullDirPath = path.join(baseDataDir, job.dir);
        if (!fs.existsSync(fullDirPath)) continue;
        
        // Find all subdirectories (each is a country/destination)
        const items = fs.readdirSync(fullDirPath, { withFileTypes: true });
        const destDirs = items.filter(item => item.isDirectory());
        
        for (const destDir of destDirs) {
            const toursJsonPath = path.join(fullDirPath, destDir.name, 'tours.json');
            if (fs.existsSync(toursJsonPath)) {
                try {
                    const fileContent = fs.readFileSync(toursJsonPath, 'utf8');
                    const toursArray = JSON.parse(fileContent);
                    
                    for (const rawTour of toursArray) {
                        const dto = {
                            language: job.lang,
                            destination: destDir.name,
                            name: rawTour.tourName,
                            slug: rawTour.id || null,
                            category: job.forceCategory || mapCategory(rawTour.category),
                            price: rawTour.price ? parseFloat(rawTour.price) : null,
                            duration: parseDuration(rawTour.durationDays),
                            generalInfo: rawTour.generalInfo || '',
                            placesVisited: rawTour.placesVisited || '',
                            whatExpect: rawTour.whatExpect || '',
                            mainPhoto: rawTour.mainPhoto || '',
                            image1: rawTour.image1 || '',
                            image2: rawTour.image2 || '',
                            image3: rawTour.image3 || '',
                            image4: rawTour.image4 || '',
                            image5: rawTour.image5 || '',
                            image6: rawTour.image6 || '',
                            imagealt: rawTour.imagealt || '',
                            personNumber: rawTour.personNumber || '',
                            dates: rawTour.dates || '',
                            minimumAge: String(rawTour.minimumAge || ''),
                            meet: rawTour.meet || '',
                            map: rawTour.map || '',
                            // Map children correctly
                            dayInfo: (rawTour.dayInfo || []).map(d => ({
                                dayNumber: typeof d.dayNumber === 'number' ? d.dayNumber : (parseInt(String(d.dayNumber).match(/\d+/)?.[0]) || 1),
                                title: d.title || '',
                                description: d.description || ''
                            })),
                            route: (rawTour.route || []).map(r => ({
                                name: r.name,
                                country: r.country
                            })),
                            routeCoordinates: (rawTour.routeCoordinates || []).map(r => ({
                                name: r.name,
                                country: r.country,
                                lat: r.lat,
                                lng: r.lng
                            }))
                        };
                        
                        // For the DTO validation rules:
                        if (!dto.name) dto.name = "Unnamed Tour";
                        dto.price = dto.price && dto.price > 0 ? dto.price : 1;
                        dto.duration = dto.duration && dto.duration > 0 ? dto.duration : 1;
                        dto.minParticipants = 1;
                        dto.maxParticipants = 30;
                        // Provide dummy destinations list (required by TourCreateDto)
                        dto.destinations = [dto.destination];
                        dto.departureCity = dto.route && dto.route.length > 0 ? dto.route[0].name : "Unknown";
                        
                        allDTOs.push(cleanObj(dto));
                    }
                } catch (e) {
                    console.error("Error reading " + toursJsonPath, e);
                }
            }
        }
    }
    
    console.log(`Prepared ${allDTOs.length} tours for import.`);
    
    // We send in chunks to avoid single massive requests Payload Too Large
    const chunkSize = 50;
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    let successCount = 0, failCount = 0;

    for (let i = 0; i < allDTOs.length; i += chunkSize) {
        const chunkNum = i / chunkSize + 1;
        const chunk = allDTOs.slice(i, i + chunkSize);

        let retries = 3;
        while (retries > 0) {
            try {
                const resp = await fetch('http://localhost:8080/api/tours/bulk-import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(chunk)
                });

                if (resp.ok) {
                    successCount += chunk.length;
                    if (chunkNum % 20 === 0) console.log(`Chunk ${chunkNum} OK (${successCount} tours imported)`);
                    break;
                } else if (resp.status === 429) {
                    retries--;
                    console.log(`Chunk ${chunkNum} rate-limited, waiting 3s... (${retries} retries left)`);
                    await delay(3000);
                } else {
                    const text = await resp.text();
                    console.error(`Chunk ${chunkNum} failed: ${resp.status} ${text.substring(0, 200)}`);
                    failCount += chunk.length;
                    break;
                }
            } catch (e) {
                console.error(`Chunk ${chunkNum} send error:`, e.message);
                failCount += chunk.length;
                break;
            }
        }
        if (retries === 0) {
            failCount += chunk.length;
            console.error(`Chunk ${chunkNum} exhausted retries`);
        }
        // Small delay between chunks to avoid rate limiting
        await delay(100);
    }
    console.log(`Import finished. Success: ${successCount}, Failed: ${failCount}, Total: ${allDTOs.length}`);
}

runImport();
