const ASSET_VERSION = "aurora-polish-20260528a";

function assetUrl(src = "") {
  if (!src || /^(?:https?:|data:|blob:)/.test(src) || src.includes("?")) return src;
  return `${src}?v=${ASSET_VERSION}`;
}

export function collectAssetUrls(data) {
  const urls = new Set([
    assetUrl("./assets/ui/logo.svg"),
    assetUrl("./assets/ui/logo-mark.svg")
  ]);

  // Large raster sprites and scene backgrounds are loaded only when their view opens.
  // Waiting for every route image during bootstrap made the web game appear frozen.
  return [...urls];
}

export function preloadImages(urls, onProgress = () => {}) {
  let loaded = 0;
  const total = urls.length || 1;

  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const image = new Image();
          const done = () => {
            loaded += 1;
            onProgress(Math.round((loaded / total) * 100), url);
            resolve({ url, ok: true });
          };
          image.onload = done;
          image.onerror = () => {
            loaded += 1;
            onProgress(Math.round((loaded / total) * 100), url);
            resolve({ url, ok: false });
          };
          image.src = url;
        })
    )
  );
}
