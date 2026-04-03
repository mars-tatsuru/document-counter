<script setup lang="ts">
const router = useRouter();

const pageOrder = ["/", "/results"] as const;
const direction = ref<"forward" | "back">("forward");

router.beforeEach((to, from) => {
  const toIndex = pageOrder.indexOf(to.path as (typeof pageOrder)[number]);
  const fromIndex = pageOrder.indexOf(from.path as (typeof pageOrder)[number]);
  direction.value = toIndex >= fromIndex ? "forward" : "back";
});

const transitionName = computed(() =>
  direction.value === "forward" ? "slide-left" : "slide-right",
);
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage :transition="{ name: transitionName, mode: 'out-in' }" />
  </NuxtLayout>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s ease;
}

/* 進む: 左にスライド */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20%);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20%);
}

/* 戻る: 右にスライド */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20%);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20%);
}
</style>
