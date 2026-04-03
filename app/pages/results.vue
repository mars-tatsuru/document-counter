<script setup lang="ts">
import { CASE_STUDIES } from "~~/shared/data/case-studies";

const route = useRoute();
const domain = computed(() => {
  const d = route.query.domain;
  return typeof d === "string" ? d : "";
});
const totalResults = computed(() => {
  const tr = route.query.totalResults;
  return typeof tr === "string" ? parseInt(tr, 10) : null;
});
const searchedAt = computed(() => {
  const sa = route.query.searchedAt;
  return typeof sa === "string" ? new Date(sa) : null;
});

const isOverLimit = computed(
  () => totalResults.value !== null && totalResults.value > 500000,
);

const recommendedPlan = computed(() => {
  if (totalResults.value === null || isOverLimit.value) return null;
  return getRecommendedPlan(totalResults.value);
});

const caseStudies = CASE_STUDIES;
</script>

<template>
  <div
    class="flex flex-col gap-6 flex-1 size-full justify-center items-center py-8"
  >
    <!-- 上部：ドキュメント数表示 + おすすめプラン（控えめ） -->
    <Card class="w-full h-fit max-w-2xl border-none shadow-none">
      <CardHeader class="items-center gap-6">
        <CardTitle
          class="flex items-center gap-2 text-2xl font-bold text-marsfinder"
        >
          <NuxtImg
            src="/images/mars-icon.png"
            alt="Logo"
            width="32"
            height="32"
            class="size-8 w-auto object-contain"
          />
          MARS FINDER ドキュメントカウンター
          <NuxtImg
            src="/images/mars-icon.png"
            alt="Logo"
            width="32"
            height="32"
            class="size-8 w-auto object-contain"
          />
        </CardTitle>
      </CardHeader>

      <CardContent class="p-0">
        <div
          class="text-center flex flex-col items-center justify-center gap-4 py-4 px-8 pb-0 rounded-3xl"
        >
          <span class="text-sm text-marsfinder font-medium">
            「{{ domain }}」のドキュメント数
          </span>
          <div class="flex items-end gap-2 relative">
            <p class="text-base">約</p>
            <p class="text-6xl font-bold text-marsfinder">
              {{ totalResults?.toLocaleString("ja-JP") }}
            </p>
            <p class="text-base">件</p>
            <span class="text-xs text-marsfinder absolute bottom-5 -right-2">
              ※
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ searchedAt?.toLocaleString("ja-JP") }} 現在
          </p>
        </div>

        <!-- TODO: ここのおすすめプラン出すかどうか。 -->
        <!-- TODO: ターゲットによって出し分けをしてもいいのではないか？ -->
        <!-- 　TODO: プリセールスの場合はお問い合わせを促す -->
        <!-- <div class="flex items-center justify-center">
          <Icon
            name="ic-sharp-keyboard-double-arrow-down"
            class="size-10 text-marsfinder"
          />
        </div> -->

        <!-- おすすめプラン（控えめなインライン表示） -->
        <!-- <div v-if="totalResults !== null" class="py-3 px-6">
          <div
            v-if="isOverLimit"
            class="text-center text-sm text-muted-foreground"
          >
            <span class="text-marsfinder font-medium">
              ※
              ドキュメント数が500,000件を超えるため、個別にお見積もりいたします。
            </span>
          </div>
          <div
            v-else-if="recommendedPlan"
            class="flex flex-col items-center justify-center gap-1.5 flex-wrap"
          >
            <span class="text-xs text-muted-foreground">おすすめプラン</span>
            <div class="flex flex-col items-center justify-center gap-0.5">
              <p class="text-lg font-bold text-marsfinder">
                {{ recommendedPlan.name }}
              </p>
              <span class="text-sm font-medium text-marsfinder">
                （{{
                  recommendedPlan.plan_price.toLocaleString("ja-JP")
                }}円/月（税抜））
              </span>
            </div>
          </div>
          <div v-else class="text-center text-sm text-muted-foreground">
            該当するプランが見つかりませんでした。お問い合わせください。
          </div>
        </div> -->
      </CardContent>
    </Card>

    <!-- 事例紹介セクション -->
    <div class="w-full max-w-5xl px-4">
      <h2 class="text-center text-xl font-bold text-marsfinder mb-2">
        導入事例
      </h2>

      <!-- デスクトップ: 3カラムグリッド -->
      <div class="hidden md:grid grid-cols-3 gap-4">
        <CaseStudyCard
          v-for="cs in caseStudies"
          :key="cs.id"
          :case-study="cs"
        />
      </div>

      <!-- モバイル: カルーセル -->
      <div class="md:hidden">
        <Carousel class="w-full">
          <CarouselContent>
            <CarouselItem v-for="cs in caseStudies" :key="cs.id">
              <CaseStudyCard :case-study="cs" />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>

    <!-- お問い合わせCTA -->
    <div
      class="w-full max-w-2xl text-center flex flex-col items-center gap-3 px-4"
    >
      <p class="text-sm text-marsfinder font-medium">
        プランを知りたい方、導入までの手順やその他
        <br class="hidden sm:inline" />
        お困りごとがあればお気軽にお問い合わせください。
      </p>
      <Button
        variant="marsFinder"
        class="text-3xl h-auto py-4 px-12 rounded-2xl"
        as-child
      >
        <NuxtLink
          to="https://www.marsflag.com/price/marsfinder/"
          class="flex items-center gap-1"
          target="_blank"
        >
          <Icon name="mdi-form-select" class="size-8" />
          お問い合わせはこちら
        </NuxtLink>
      </Button>
    </div>

    <!-- フッターリンク -->
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center">
        <Button variant="link" class="font-normal text-xs h-auto" as-child>
          <NuxtLink to="/" class="flex items-center gap-1">
            <Icon name="mdi-arrow-left" class="size-4" />
            もう一度カウントする
          </NuxtLink>
        </Button>
        <!-- <Button variant="link" class="text-xs h-auto" as-child>
          <NuxtLink
            to="https://www.marsflag.com/price/marsfinder/"
            class="flex items-center gap-1"
            target="_blank"
          >
            別プランを見る
            <Icon name="mdi-open-in-new" class="size-3" />
          </NuxtLink>
        </Button> -->
      </div>

      <Separator class="my-2 w-full max-w-md" />

      <p class="text-xs text-muted-foreground text-center max-w-lg">
        MARS
        FINDERに関するご質問やご不明点がございましたら、お気軽にお問い合わせください。
        <br />
        専門のスタッフが丁寧に対応させていただきます。
      </p>

      <p class="text-xs text-muted-foreground">
        <span class="text-xs text-marsfinder"> ※ </span>
        実際のドキュメント数とは異なる場合がありますので、あくまで参考値としてご利用ください。
      </p>
    </div>
  </div>
</template>
