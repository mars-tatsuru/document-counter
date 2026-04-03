<script setup lang="ts">
// api: https://serpapi.com/
import { useForm, useFieldValue, useFieldError } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cleanDomain, domainRegex } from "~~/shared/utils/validation";
import type { DocumentCountResult } from "~~/shared/types/document-count";

const formSchema = toTypedSchema(
  z.object({
    targetDomain: z
      .string({ message: "対象ドメインは必須です" })
      .min(1, "対象ドメインは必須です")
      .refine(
        (val) => domainRegex.test(cleanDomain(val)),
        "有効なドメイン形式で入力してください（例: example.com）",
      ),
    companyName: z
      .string({
        message: "会社名は必須です",
      })
      .min(1, "会社名は必須です"),
    contactName: z
      .string({
        message: "担当者名は必須です",
      })
      .min(1, "担当者名は必須です"),
    department: z.string().optional(),
    email: z
      .email("有効なメールアドレスを入力してください")
      .min(1, "メールアドレスは必須です"),
    isReseller: z.boolean().optional(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    isReseller: false,
  },
});

const loading = ref(false);
const progress = ref(0);
const result = ref<DocumentCountResult | null>(null);
const error = ref<string | null>(null);

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true;
  progress.value = 0;
  result.value = null;
  error.value = null;

  const domain = cleanDomain(values.targetDomain);
  const url = `/api/document-count-crawlee?domain=${encodeURIComponent(domain)}`;

  return new Promise<void>((resolve) => {
    const es = new EventSource(url);

    es.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "progress") {
        progress.value = data.progress;
      } else if (data.type === "result") {
        es.close();
        result.value = {
          domain: data.domain,
          totalResults: data.totalResults,
          searchedAt: data.searchedAt,
        };

        setTimeout(async () => {
          loading.value = false;
          await navigateTo({
            name: "results",
            query: {
              domain: result.value?.domain,
              totalResults: result.value?.totalResults,
              searchedAt: result.value?.searchedAt,
            },
          });
          resolve();
        }, 1500);
      } else if (data.type === "error") {
        es.close();
        error.value = data.message;
        loading.value = false;
        resolve();
      }
    };

    es.onerror = () => {
      es.close();
      error.value = "接続エラーが発生しました。再度お試しください。";
      loading.value = false;
      resolve();
    };
  });
});

const targetDomain = useFieldValue<string>("targetDomain");
const targetDomainError = useFieldError("targetDomain");
const showDetails = computed(
  () =>
    !!targetDomain.value &&
    targetDomain.value.length > 0 &&
    !targetDomainError.value,
);
</script>

<template>
  <div class="flex flex-col flex-1 size-full justify-center items-center">
    <Card class="w-full max-w-2xl border-none shadow-none">
      <CardHeader class="items-center">
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
      <CardContent :class="{ 'pb-2': showDetails }">
        <form class="space-y-2" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="targetDomain">
            <FormItem>
              <FormLabel class="text-base text-center block w-full">
                対象ドメイン
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  :disabled="loading"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription class="text-center">
                例) 「https://www.marsflag.com」 → 「marsflag.com」
                と入力してください
              </FormDescription>
              <FormMessage class="text-center" />
            </FormItem>
          </FormField>

          <div
            class="grid transition-[grid-template-rows] duration-300 ease-in-out"
            :class="showDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <div class="flex flex-col gap-3 p-4">
                <div class="w-full h-fit relative !my-4">
                  <span
                    class="z-10 text-xs text-muted-foreground absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 w-fit whitespace-nowrap"
                  >
                    ↓ カウント結果を見るには下記情報を入力してください ↓
                  </span>
                  <Separator />
                </div>

                <FormField v-slot="{ componentField }" name="companyName">
                  <FormItem>
                    <FormLabel>
                      会社名
                      <span class="text-destructive">※</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="株式会社○○"
                        :disabled="loading"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="contactName">
                  <FormItem>
                    <FormLabel>
                      担当者名
                      <span class="text-destructive">※</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="山田太郎"
                        :disabled="loading"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="department">
                  <FormItem>
                    <FormLabel>部署名（任意）</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="営業部"
                        :disabled="loading"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="email">
                  <FormItem>
                    <FormLabel
                      >メールアドレス
                      <span class="text-destructive">※</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@example.com"
                        :disabled="loading"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ value, handleChange }"
                  name="isReseller"
                  type="checkbox"
                >
                  <FormItem
                    class="flex flex-col items-center justify-center gap-x-0 space-y-3 pt-4"
                  >
                    <div
                      class="space-y-1 leading-none flex flex-col items-center justify-center"
                    >
                      <div class="flex items-center gap-x-1">
                        <FormControl>
                          <Checkbox
                            :checked="value"
                            :disabled="loading"
                            @update:checked="handleChange"
                            class="data-[state=checked]:border-marsfinder data-[state=checked]:bg-marsfinder dark:data-[state=checked]:text-white"
                          />
                        </FormControl>
                        <FormLabel>自社サイト</FormLabel>
                      </div>
                      <FormDescription class="text-center">
                        自社サイトの場合はチェックしてください
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
        <Button
          variant="marsFinder"
          class="w-full h-auto py-3 text-base"
          :disabled="loading"
          @click="onSubmit"
        >
          ドキュメントカウント開始
        </Button>

        <div
          v-if="error"
          class="w-full text-center text-sm text-destructive mt-2"
        >
          {{ error }}
        </div>
      </CardFooter>
    </Card>

    <!-- ローディングモーダル -->
    <AlertDialog :open="loading">
      <AlertDialogContent class="max-w-md" @escapeKeyDown.prevent>
        <AlertDialogHeader>
          <AlertDialogTitle
            class="text-center text-marsfinder font-bold text-2xl flex items-center justify-center gap-2"
          >
            <div class="h-10 flex items-center justify-center">
              <Transition name="fade-up" mode="out-in">
                <Icon
                  v-if="progress >= 100"
                  key="done"
                  name="mdi:check-circle"
                  class="size-10 text-marsfinder"
                />
                <span v-else key="loading">カウント中...</span>
              </Transition>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div class="flex flex-col items-center justify-center gap-6">
          <div class="w-full flex flex-col items-center gap-2">
            <Progress
              :model-value="progress"
              class="w-full h-2 [&>*]:bg-marsfinder"
            />
            <span class="text-sm text-muted-foreground">{{ progress }}%</span>
          </div>
          <p class="text-center text-sm text-muted-foreground">
            ドキュメント数を取得しています。<br />
            終了次第、結果ページに遷移します。
          </p>
          <span class="text-xs text-destructive">
            ページをリロードしないでください！
          </span>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
