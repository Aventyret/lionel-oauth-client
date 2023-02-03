<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOidcClient } from 'lionel-oauth-client-vue'

import oidcConfig from '../constants/oidc-config'

const route = useRoute()
const { user, signIn, oidcClient } = useOidcClient(oidcConfig)

console.log(JSON.stringify(user))

const hasAccess = computed(() => route.meta?.isPublic || !!user)

console.log(user)
</script>

<template>
  <nav v-if="hasAccess" id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/public">A public page</router-link> |
    <router-link to="/protected">A protected page</router-link> |
    <a v-if="user" href @click.prevent="oidcClient.signOut">Sign out</a>
    <a v-else href @click.prevent="signIn(route.path)">Sign in</a>
  </nav>
</template>

<style scoped></style>
