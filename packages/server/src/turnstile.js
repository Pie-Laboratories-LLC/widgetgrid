// Server-side check of a Cloudflare Turnstile token (the captcha on
// /site/subscribe, and account registration later). The browser widget
// produces the token; only this call, with the secret key, says whether
// it's genuine.
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Without a secret key (local dev) every token passes, with a warning on
// first use -- the same "works locally without the real service" stance
// as emailSender.js/smsSender.js. Cloudflare's published test keys
// (sitekey 1x00000000000000000000AA / secret
// 1x0000000000000000000000000000000AA) exercise the real call if wanted.
export function createTurnstileVerifier({ secretKey, fetchImpl = fetch }) {
  let warned = false;
  return {
    async verify(token) {
      if (!secretKey) {
        if (!warned) console.warn('[turnstile] TURNSTILE_SECRET_KEY unset -- captcha checks are skipped');
        warned = true;
        return true;
      }
      if (!token) return false;
      try {
        const response = await fetchImpl(SITEVERIFY_URL, {
          method: 'POST',
          body: new URLSearchParams({ secret: secretKey, response: token }),
        });
        return (await response.json()).success === true;
      } catch (err) {
        console.error('[turnstile] siteverify failed:', err);
        return false;
      }
    },
  };
}
