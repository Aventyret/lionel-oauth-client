<script setup>
import { computed } from 'vue'
import jsonMarkup from 'json-markup'
import { useOidcClient } from 'lionel-oauth-client-vue'

import oidcConfig from '../constants/oidc-config'

console.log(useOidcClient(oidcConfig))

const { user, accessToken, accessTokenExpires, test, oidcClient } =
  useOidcClient(oidcConfig)

// const userDisplay = computed(() => jsonMarkup(user))

const userDisplay = ''

console.log({ accessToken, accessTokenExpires, user })
</script>

<template>
  <div v-if="accessToken">
    <p>You are signed in as:</p>
    <div
      style="
        width: 100%;
        max-width: 640px;
        height: 200px;
        margin: 0 auto;
        font-family: monospace;
      "
      v-html="userDisplay"
    ></div>
    <p>Access token</p>
    <p>expires {{ new Date(accessTokenExpires).toISOString() }}</p>
    <textarea
      readonly
      style="
        width: 100%;
        max-width: 640px;
        height: 200px;
        margin: 0 auto;
        font-family: monospace;
      "
      v-model="accessToken"
    ></textarea>

    <p>
      <button @click="oidcClient.signInSilently">
        Reauthenticate silently
      </button>
    </p>
  </div>
</template>

<style scoped>
.json-markup {
  color: transparent;
}
.json-markup span {
  color: black;
  float: left;
}
.json-markup .json-markup-key {
  clear: left;
}
</style>
