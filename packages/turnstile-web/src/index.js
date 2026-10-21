// Cloudflare Turnstile, the captcha on forms anyone can submit
// (widgets/subscribe, widgets/account's registration). The server checks
// the token it produces -- packages/server/src/turnstile.js.

// Public site key (the secret half is widgetgrid-server's
// TURNSTILE_SECRET_KEY). Defaults to Cloudflare's always-passes test key,
// so the widget behaves for real in local dev; production builds get the
// real key via VITE_TURNSTILE_SITE_KEY (see infra/eks/deploy.sh). Read
// here, in a package bundled into each widget, so every widget build sees
// the same build-time value.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading = null;
function loadTurnstile() {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      loading = null;
      reject(new Error('captcha failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Renders the captcha into `element`; onToken gets each fresh token, or ''
// when one expires or errors. Resolves to { reset, remove } -- reset() after
// a failed submit (tokens are single-use), remove() on unmount. Rejects if
// the script can't load (offline, blocked).
export async function renderTurnstile(element, onToken) {
  const turnstile = await loadTurnstile();
  const id = turnstile.render(element, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token) => onToken(token),
    'expired-callback': () => onToken(''),
    'error-callback': () => onToken(''),
  });
  return {
    reset: () => turnstile.reset(id),
    remove: () => turnstile.remove(id),
  };
}
