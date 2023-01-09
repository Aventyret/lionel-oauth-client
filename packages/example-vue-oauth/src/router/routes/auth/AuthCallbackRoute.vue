<script setup>
import { useRouter } from 'vue-router'
import { useOidcClient } from 'lionel-oauth-client-vue'

import oidcConfig from '../constants/oidc-config'

const router = useRouter()
const { handleCallback } = useOidcClient(oidcConfig)

onMounted(async () => {
  try {
    await handleCallback(router)
  } catch (error) {
    router.push('/auth/error')
  }
})
</script>

<template>
  <p>Signing in...</p>
</template>

<style scoped></style>
