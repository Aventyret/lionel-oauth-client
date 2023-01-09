import { createRouter, createWebHistory } from 'vue-router'
import { createRouterOauthMiddleware } from 'lionel-oauth-client-vue'

import oidcConfig from '../constants/oidc-config'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./routes/pages/HomeRoute.vue'),
      meta: {
        title: 'Home',
        isPublic: true
      }
    },
    {
      path: '/public',
      component: () => import('./routes/pages/PublicRoute.vue'),
      meta: {
        title: 'Home',
        isPublic: true
      }
    },
    {
      path: '/protected',
      component: () => import('./routes/pages/ProtectedRoute.vue'),
      meta: {
        title: 'A protected route'
      }
    },
    {
      path: '/auth/error',
      component: () => import('./routes/auth/AuthErrorRoute.vue'),
      meta: {
        title: 'Something went wrong',
        isPublic: true,
        signInSilently: false
      }
    },
    {
      path: '/auth',
      component: () => import('./routes/auth/AuthCallbackRoute.vue'),
      meta: {
        title: 'Signing in...',
        isPublic: true
      }
    },
    {
      path: '/signed-out',
      component: () => import('./routes/auth/AuthPostSignedOutRoute.vue'),
      meta: {
        title: 'You have signed out',
        isPublic: true,
        signInSilently: false
      }
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('./routes/error/FileNotFoundRoute.vue'),
      meta: {
        title: 'Page not found',
        isPublic: true,
        signInSilently: false
      }
    }
  ]
})

router.beforeEach(createRouterOauthMiddleware(oidcConfig))

export default router
