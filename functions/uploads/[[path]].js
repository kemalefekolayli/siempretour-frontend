// Cloudflare Pages Function: /uploads/* isteklerini Railway backend'ine proxy'ler
// ve Cloudflare edge'inde cache'ler (B = admin-yuklenen gorseller icin CDN).
// Mevcut tur katalogu (images/tour-photos/*) zaten statik olarak Pages'ten gelir;
// bu sadece admin panelinden YENI yuklenen gorseller (/uploads/tours/*) icindir.
const ORIGIN = "https://backend-production-56c81.up.railway.app";

export async function onRequest(context) {
  const { request } = context;
  // Sadece GET/HEAD cache'lenir; digerlerini oldugu gibi gecir.
  const url = new URL(request.url);
  const target = ORIGIN + url.pathname + url.search;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetch(target, request);
  }

  const resp = await fetch(target, {
    method: request.method,
    headers: { "Accept": request.headers.get("Accept") || "*/*" },
    cf: { cacheEverything: true, cacheTtl: 86400 },
  });

  const out = new Response(resp.body, resp);
  // Tarayici + edge cache (1 gun). Gorseller immutable (UUID dosya adlari).
  out.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return out;
}
