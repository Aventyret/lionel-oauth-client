<script setup>
import { useOidcClient } from 'lionel-oauth-client-vue'

const { signIn } = useOidcClient(oidcConfig)
</script>

<template>
  <h1>You have signed out</h1>
  <p>
    <a @click.prevent="signIn({}, '/')">Sign in again</a>
  </p>
</template>

<style scoped></style>
