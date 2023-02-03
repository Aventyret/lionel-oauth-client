<script setup>
import AppMenu from './components/AppMenu.vue'
import SignedInUser from './components/SignedInUser.vue'
</script>

<template>
  <AppMenu />
  <router-view></router-view>
  <SignedInUser />
</template>

<style scoped></style>
