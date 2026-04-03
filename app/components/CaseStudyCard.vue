<script setup lang="ts">
import type { CaseStudy } from "~~/shared/data/case-studies";

defineProps<{
  caseStudy: CaseStudy;
}>();
</script>

<template>
  <NuxtLink :to="caseStudy.url" target="_blank" class="block">
    <Card
      class="border-marsfinder/50 h-full hover:bg-marsfinder/5 hover:border-marsfinder transition-colors duration-200 rounded-2xl"
    >
      <CardHeader class="gap-2 pb-3">
        <div class="flex items-center gap-2">
          <Icon :name="caseStudy.iconName" class="size-5 text-marsfinder" />
          <Badge
            variant="marsFinder"
            class="text-[10px] h-auto py-0.5 px-2 font-medium rounded-full"
          >
            {{ caseStudy.industry }}
          </Badge>
        </div>
        <CardTitle class="text-base font-semibold leading-snug">
          {{ caseStudy.companyDescription }}
        </CardTitle>
      </CardHeader>
      <CardContent class="pt-0 pb-4">
        <p class="text-xs text-muted-foreground leading-relaxed">
          {{ caseStudy.summary }}
        </p>
        <span
          class="inline-block mt-3 text-xs font-medium text-marsfinder bg-marsfinder/10 rounded-full py-1 px-3"
        >
          {{ caseStudy.highlight }}
        </span>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
