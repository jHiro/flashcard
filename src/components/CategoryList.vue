<template>
  <div class="category-list">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12">
          <h1>学習セット一覧</h1>
        </v-col>
      </v-row>

      <v-progress-circular
        v-if="flashcardStore.isLoading"
        indeterminate
      ></v-progress-circular>

      <v-row v-else>
        <v-col v-for="category in flashcardStore.categories" :key="category.id" cols="12">
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
                    <span class="info-value success-rate">{{ userProgress[category.id].completionRate }}%</span>
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
              </v-card-actions>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashcardStore } from '@/stores/flashcard'
import { useAuthStore } from '@/stores/auth'

const flashcardStore = useFlashcardStore()
const authStore = useAuthStore()
const router = useRouter()

const userProgress = computed(() => flashcardStore.userProgress)

const selectCategory = async (categoryId: string) => {
  await flashcardStore.selectCategory(categoryId)
  router.push({ name: 'quiz', params: { categoryId } })
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
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
  }

  .card-action .v-btn {
    width: 100%;
  }
}
</style>
