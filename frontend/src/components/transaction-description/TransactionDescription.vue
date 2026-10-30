<script setup lang="ts">
interface Props {
  noteLines: string[];
}

const { noteLines } = defineProps<Props>();
</script>

<template>
  <div
    class="border-accented bg-elevated w-full rounded-xl border px-3 py-2"
  >
    <p class="text-muted font-mono text-xs tracking-wide uppercase">
      Bank description
    </p>

    <p
      v-for="line in noteLines"
      :key="line"
      class="text-toned font-mono text-sm wrap-break-word"
    >
      {{ line }}
    </p>
  </div>
</template>
