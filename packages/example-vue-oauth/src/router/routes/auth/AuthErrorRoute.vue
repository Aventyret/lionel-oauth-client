<script setup>
import { useOidcClient } from 'lionel-oauth-client-vue'

import oidcConfig from '../../../constants/oidc-config'

const { signIn } = useOidcClient(oidcConfig)
</script>

<template>
  <h1>You could not be signed in</h1>
  <p>
    <a @click.prevent="signIn({}, '/')">Try again</a>
  </p>
</template>

<style scoped></style>
