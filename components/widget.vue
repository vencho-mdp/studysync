<script setup>
const props = defineProps({
  title: String,
  add: {
    default: true,
    type: Boolean,
  },
});
const emit = defineEmits(["onCreation"]);
</script>
<template>
  <div
    class="col shadow-sm block w-96 p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <span class="mb-2 flex justify-between">
      <h5
        class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        {{ title }}
      </h5>
      <button
        type="button"
        v-if="add"
        @click="emit('onCreation')"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <svg
          fill="none"
          class="w-4 h-4"
          stroke="white"
          stroke-width="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6v12m6-6H6"
          ></path>
        </svg>
        <span class="sr-only">Icon description</span>
      </button>
    </span>

    <slot name="content" />
  </div>
</template>
