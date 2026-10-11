import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isSignInCallback, completeSignIn } from '@widgetgrid/auth-web';

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

const [{ default: App }, { router }] = await Promise.all([import('./App.vue'), import('./router')]);
createApp(App).use(createPinia()).use(router).mount('#app');
