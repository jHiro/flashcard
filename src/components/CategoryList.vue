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
        <v-col v-for="category in flashcardStore.categories" :key="category.id" cols="12" sm="6" md="4">
          <v-card
            @click="selectCategory(category.id)"
            class="category-card"
          >
            <v-card-title>{{ category.name }}</v-card-title>
            <v-card-text>
              <p><strong>科目:</strong> {{ category.subject }}</p>
              <p><strong>難易度:</strong> {{ category.level }}</p>
              <p><strong>問題数:</strong> {{ category.wordCount }}</p>
              <p v-if="userProgress[category.id]">
                <strong>正解率:</strong> {{ userProgress[category.id].completionRate }}%
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="tonal" @click="selectCategory(category.id)">
                学習する
              </v-btn>
            </v-card-actions>
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
  padding: 20px 0;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
