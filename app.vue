<template>
  <div>
    <Title> Studysync </Title>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { initFlowbite } from "flowbite";

// initialize components based on data attribute selectors
onMounted(() => {
  initFlowbite();
});
</script>
<style>
#__nuxt > div {
  min-height: 100vh;
}
button {
  @apply transition-all delay-200;
}
button:disabled {
  @apply !bg-gray-600 !text-white hover:!bg-gray-600;
}
</style>
