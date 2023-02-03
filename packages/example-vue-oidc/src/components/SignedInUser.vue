<script setup>
import { computed } from 'vue'
import jsonMarkup from 'json-markup'
import { useOidcClient } from 'lionel-oauth-client-vue'

import oidcConfig from '../constants/oidc-config'

const { accessToken, accessTokenExpires, user, oidcClient } =
  useOidcClient(oidcConfig)
</script>

<template>
  <div v-if="user">
    <p>You are signed in as:</p>
    <div
      style="
        width: 100%;
        max-width: 640px;
        height: 200px;
        margin: 0 auto;
        font-family: monospace;
      "
    >
      {{ user }}
    </div>
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
