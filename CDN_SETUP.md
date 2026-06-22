# Siempre Tour CDN setup

This project now supports two CDN modes.

## 1. Whole-site CDN

Put a CDN in front of the deployed frontend origin. Keep `DEFAULT_ASSET_CDN_BASE` empty in `js/cdn-config.js`.

Use this first if the whole static site is deployed from the Nginx container. The origin now sends:

- HTML: `Cache-Control: no-cache`
- CSS/JS: `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- images/fonts/video: `Cache-Control: public, max-age=2592000, stale-while-revalidate=604800`

This lets the CDN cache heavy static assets while pages can update quickly after deploys.

## 2. Asset CDN for large images

Use this when big folders are hosted outside the frontend container, for example on `https://cdn.siempretour.com`.

Upload the folders while preserving their paths:

- `avrupa-turlari/`
- `images/tour-photos/`
- `uploads/tours/`
- large media under `images/`, such as `images/siempre-video1.mp4`, if kept

Then set the base in one place:

```js
// js/cdn-config.js
var DEFAULT_ASSET_CDN_BASE = "https://cdn.siempretour.com";
```

Do not set this before the files exist on the CDN. The helper rewrites matching relative URLs only; absolute URLs and normal page links are left alone.

You can also override per page before app scripts load:

```html
<meta name="asset-cdn-base" content="https://cdn.siempretour.com">
```

## Cloudflare Path

1. Add the domain to Cloudflare and proxy the frontend DNS record.
2. Create a Cache Rule for static extensions or paths like `/css/*`, `/js/*`, `/images/*`, `/fonts/*`, `/avrupa-turlari/*`, and `/uploads/tours/*`.
3. Let HTML follow the origin `no-cache` header.
4. Purge changed URLs after deploys, or purge all after a major release.

Official docs:

- https://developers.cloudflare.com/cache/
- https://developers.cloudflare.com/cache/concepts/default-cache-behavior/
- https://developers.cloudflare.com/cache/how-to/cache-rules/
- https://developers.cloudflare.com/cache/how-to/purge-cache/

## Google Cloud CDN Path

If the frontend runs on Cloud Run, Google Cloud CDN normally sits behind an external Application Load Balancer that points to Cloud Run through a serverless NEG.

High-level flow:

1. Deploy the frontend Cloud Run service.
2. Create a serverless NEG for that Cloud Run service.
3. Create a backend service using the NEG and enable Cloud CDN.
4. Attach it to a URL map, HTTPS proxy/certificate, forwarding rule, and DNS record.

Official docs:

- https://docs.cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts
- https://docs.cloud.google.com/load-balancing/docs/https/setting-up-https-serverless

## Verify

After deploy, check headers:

```powershell
curl.exe -I https://www.siempretour.com/css/style.css
curl.exe -I https://www.siempretour.com/index.html
```

For Cloudflare, a cached static asset should eventually show `cf-cache-status: HIT`. HTML should stay fresh.
