<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
/*  
vid varje sidladdning - kollar om sparad token är giltig, 
annars rensas token och användaren skickas till loginsida
*/
onMounted(() => auth.restoreSession());
</script>
