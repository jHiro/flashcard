<template>
  <div class="progress-dashboard">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12">
          <h1>学習進度</h1>
        </v-col>
      </v-row>

      <v-row v-if="Object.keys(userProgress).length > 0">
        <v-col v-for="(progress, categoryId) in userProgress" :key="categoryId" cols="12" sm="6">
          <v-card>
            <v-card-title>{{ progress.categoryName }}</v-card-title>
            <v-card-text>
              <p><strong>完了率:</strong> {{ progress.completionRate }}%</p>
              <v-progress-linear :value="progress.completionRate" class="mb-4"></v-progress-linear>

              <p><strong>正解数:</strong> {{ progress.correctCount }} / {{ progress.totalWords }}</p>
              <p><strong>不正解数:</strong> {{ progress.wrongCount }}</p>

              <p v-if="progress.lastReviewedAt">
                <strong>最後に学習:</strong> {{ formatDate(progress.lastReviewedAt) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" class="text-center">
          <p>まだ学習を開始していません。セット一覧から問題を選択してください。</p>
          <v-btn color="primary" @click="goHome">セット一覧へ</v-btn>
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

const formatDate = (date: any) => {
  if (!date || !date.toDate) {
    return '未定義'
  }
  return date.toDate().toLocaleDateString('ja-JP')
}

const goHome = () => {
  router.push({ name: 'home' })
}

onMounted(async () => {
  if (authStore.currentUser) {
    await flashcardStore.loadUserProgress(authStore.currentUser.uid)
  }
})
</script>

<style scoped>
.progress-dashboard {
  padding: 20px 0;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}
</style>
