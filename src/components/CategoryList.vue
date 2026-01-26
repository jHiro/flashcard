<template>
  <div class="category-list">
    <v-container fluid>
      <v-row class="mb-6">
        <v-col cols="12">
          <h1>学習セット一覧</h1>
        </v-col>
      </v-row>

      <v-progress-circular
        v-if="flashcardStore.isLoading"
        indeterminate
      ></v-progress-circular>

      <div v-else>
        <!-- 親カテゴリごとにグループ化して表示 -->
        <div v-for="parentCat in flashcardStore.parentCategories" :key="parentCat.id" class="parent-category-group">
          <v-row>
            <v-col cols="12">
              <h2 class="parent-category-title">
                <v-icon class="mr-2">mdi-folder-open</v-icon>
                {{ parentCat.name }}
              </h2>
              <p class="parent-category-description">{{ parentCat.description }}</p>
            </v-col>
          </v-row>

          <!-- 子カテゴリ（学習セット）一覧 -->
          <v-row>
            <v-col 
              v-for="category in getChildCategories(parentCat.id)" 
              :key="category.id" 
              cols="12"
            >
              <v-card
                @click="selectCategory(category.id)"
                class="category-card"
                elevation="2"
              >
                <div class="card-content">
                  <div class="card-header">
                    <v-card-title class="card-title">{{ category.name }}</v-card-title>
                    <v-chip color="primary" variant="tonal" class="ml-2" size="small">
                      {{ category.subject }}
                    </v-chip>
                  </div>
                  <v-card-text class="card-info">
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">難易度:</span>
                        <span class="info-value">{{ category.level }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">問題数:</span>
                        <span class="info-value">{{ category.wordCount }}問</span>
                      </div>
                      <div v-if="userProgress[category.id]" class="info-item">
                        <span class="info-label">正解率:</span>
                        <span class="info-value success-rate">{{ userProgress[category.id]?.correctRate ?? 0 }}%</span>
                      </div>
                    </div>
                  </v-card-text>
                  <v-card-actions class="card-action">
                    <v-btn 
                      color="primary" 
                      size="large" 
                      variant="flat"
                      @click.stop="selectCategory(category.id)"
                    >
                      学習する
                    </v-btn>
                    <v-btn 
                      v-if="hasWrongWordsMap[category.id]"
                      color="error" 
                      size="large" 
                      variant="tonal"
                      @click.stop="startReview(category.id)"
                      class="ml-2"
                    >
                      復習
                    </v-btn>
                  </v-card-actions>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- 親カテゴリに属さない単独のカテゴリ（後方互換性のため） -->
        <div v-if="standAloneCategories.length > 0" class="parent-category-group">
          <v-row>
            <v-col cols="12">
              <h2 class="parent-category-title">
                <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                その他の学習セット
              </h2>
            </v-col>
          </v-row>

          <v-row>
            <v-col 
              v-for="category in standAloneCategories" 
              :key="category.id" 
              cols="12"
            >
              <v-card
                @click="selectCategory(category.id)"
                class="category-card"
                elevation="2"
              >
                <div class="card-content">
                  <div class="card-header">
                    <v-card-title class="card-title">{{ category.name }}</v-card-title>
                    <v-chip color="primary" variant="tonal" class="ml-2">
                      {{ category.subject }}
                    </v-chip>
                  </div>
                  <v-card-text class="card-info">
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">難易度:</span>
                        <span class="info-value">{{ category.level }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">問題数:</span>
                        <span class="info-value">{{ category.wordCount }}問</span>
                      </div>
                      <div v-if="userProgress[category.id]" class="info-item">
                        <span class="info-label">正解率:</span>
                        <span class="info-value success-rate">{{ userProgress[category.id]?.correctRate ?? 0 }}%</span>
                      </div>
                    </div>
                  </v-card-text>
                  <v-card-actions class="card-action">
                    <v-btn 
                      color="primary" 
                      size="large" 
                      variant="flat"
                      @click.stop="selectCategory(category.id)"
                    >
                      学習する
                    </v-btn>
                    <v-btn 
                      v-if="hasWrongWordsMap[category.id]"
                      color="error" 
                      size="large" 
                      variant="tonal"
                      @click.stop="startReview(category.id)"
                      class="ml-2"
                    >
                      復習
                    </v-btn>
                  </v-card-actions>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashcardStore } from '@/stores/flashcard'
import { useAuthStore } from '@/stores/auth'

const flashcardStore = useFlashcardStore()
const authStore = useAuthStore()
const router = useRouter()

const userProgress = computed(() => flashcardStore.userProgress)
const hasWrongWordsMap = ref<Record<string, boolean>>({})

// 親カテゴリに属さない単独のカテゴリを取得
const standAloneCategories = computed(() => {
  return flashcardStore.categories.filter(
    cat => !cat.isParent && !cat.parentCategoryId
  )
})

// 親カテゴリの子カテゴリを取得
const getChildCategories = (parentId: string) => {
  return flashcardStore.getChildCategories(parentId)
}

const selectCategory = async (categoryId: string) => {
  await flashcardStore.selectCategory(categoryId)
  router.push({ name: 'quiz', params: { categoryId } })
}

const startReview = async (categoryId: string) => {
  if (!authStore.currentUser) {
    console.error('ユーザーが認証されていません')
    return
  }

  try {
    await flashcardStore.loadWrongWordsForReview(authStore.currentUser.uid, categoryId)
    router.push({ name: 'quiz', params: { categoryId } })
  } catch (error) {
    console.error('復習開始エラー:', error)
    alert('保存された間違った問題がありません。\n先に学習を完了してから「間違った問題を保存」してください。')
  }
}

onMounted(async () => {
  // ユーザーが認証されていない場合はログイン画面にリダイレクト
  if (!authStore.isAuthenticated && !authStore.isLoading) {
    console.log('ユーザーが認証されていません')
    router.push({ name: 'login' })
    return
  }

  // 認証状態が確定するまで待つ
  if (authStore.isLoading) {
    setTimeout(() => {
      if (!authStore.isAuthenticated) {
        router.push({ name: 'login' })
      }
    }, 1000)
  }

  try {
    await flashcardStore.loadCategories()
    if (authStore.currentUser) {
      await flashcardStore.loadUserProgress(authStore.currentUser.uid)
      
      // 各カテゴリに保存された間違った問題があるかチェック
      for (const category of flashcardStore.categories) {
        hasWrongWordsMap.value[category.id] = await flashcardStore.hasWrongWords(
          authStore.currentUser.uid,
          category.id
        )
      }
    }
  } catch (error) {
    console.error('データ読み込みエラー:', error)
    // エラー時もログイン画面へ
    router.push({ name: 'login' })
  }
})
</script>

<style scoped>
.category-list {
  padding: 0;
  margin: 0;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.parent-category-group {
  margin-bottom: 48px;
}

.parent-category-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.parent-category-description {
  color: #666;
  margin-bottom: 16px;
  font-size: 1rem;
  margin-left: 36px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
  border-radius: 12px !important;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.card-header {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 200px;
}

.card-title {
  font-size: 1.5rem !important;
  font-weight: bold;
  padding: 0;
  margin: 0;
}

.card-info {
  flex: 1;
  padding: 0 16px;
}

.info-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.success-rate {
  color: #4caf50;
}

.card-action {
  padding: 0;
  margin-left: auto;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .card-header {
    min-width: auto;
  }

  .info-row {
    justify-content: space-between;
  }

  .card-action {
    margin-left: 0;
    display: flex;
    gap: 8px;
  }

  .card-action .v-btn {
    flex: 1;
  }
}
</style>
