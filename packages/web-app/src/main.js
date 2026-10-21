import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isSignInCallback, completeSignIn } from '@widgetgrid/auth-web';
import { navigate } from '@widgetgrid/site-routes';

// Returning from the Cognito hosted UI lands on /auth/callback (see
// packages/auth-web). Finish that first: completeSignIn puts the address
// back to wherever sign-in started. The router is imported only AFTER
// that, on purpose -- createWebHistory() captures the current URL when the
// router module is evaluated, and a static import would evaluate it while
// the address is still /auth/callback, so the app would mount on a path
// no route matches (a blank page).
if (isSignInCallback()) {
  await completeSignIn({ grpcWebOrigin: import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '' });
}

// Service worker for Web Push notifications (public/sw.js). A tapped
// notification on an already-open page arrives here as a message and is
// relayed as the same navigate request the topbar icons send. A service
// worker from before paths existed still posts { view } -- the router
// turns ?view= into the right path.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('service worker registration failed:', err));
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type !== 'navigate') return;
    const path = event.data.path ?? (event.data.view && `/?view=${encodeURIComponent(event.data.view)}`);
    if (path) navigate(path);
  });
}

const [{ default: App }, { router }] = await Promise.all([import('./App.vue'), import('./router')]);
createApp(App).use(createPinia()).use(router).mount('#app');
