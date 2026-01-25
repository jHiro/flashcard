<template>
  <div class="quiz-screen">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12">
          <h1>{{ currentCategory?.name }}</h1>
          <p class="subtitle">問題 {{ currentWordIndex + 1 }} / {{ currentWords.length }}</p>
        </v-col>
      </v-row>

      <v-progress-linear
        :value="(currentWordIndex / currentWords.length) * 100"
        class="mb-6"
      ></v-progress-linear>

      <v-row v-if="currentWord">
        <v-col cols="12">
          <v-card>
            <v-card-title>{{ currentWord.term }}</v-card-title>
            <v-card-text>
              <div class="question-content">
                <p><strong>説明:</strong></p>
                <p class="definition">{{ currentWord.definition }}</p>

                <p v-if="currentWord.examples.length > 0"><strong>例:</strong></p>
                <ul v-if="currentWord.examples.length > 0">
                  <li v-for="(example, index) in currentWord.examples" :key="index">
                    {{ example }}
                  </li>
                </ul>
              </div>

              <div class="answer-section mt-6">
                <v-text-field
                  v-model="userAnswer"
                  label="回答を入力してください"
                  @keyup.enter="submitAnswer"
                ></v-text-field>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                @click="submitAnswer"
                :disabled="!userAnswer.trim()"
              >
                回答する
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="secondary" variant="tonal" @click="goBack">
                戻る
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else class="justify-center">
        <v-col cols="12" class="text-center">
          <h2>すべての問題が完了しました！</h2>
          <v-btn color="primary" class="mt-4" @click="goBack">
            セット一覧に戻る
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashcardStore } from '@/stores/flashcard'
import { useAuthStore } from '@/stores/auth'

const flashcardStore = useFlashcardStore()
const authStore = useAuthStore()
const router = useRouter()

const userAnswer = ref('')

const currentCategory = computed(() => flashcardStore.currentCategory)
const currentWords = computed(() => flashcardStore.currentWords)
const currentWordIndex = computed(() => flashcardStore.currentWordIndex)
const currentWord = computed(() => flashcardStore.getCurrentWord())

const submitAnswer = async () => {
  if (!authStore.currentUser || !currentCategory.value || !currentWord.value) {
    return
  }

  try {
    // 簡単な判定（実装例：回答が定義に含まれているかチェック）
    const isCorrect = currentWord.value.definition.includes(userAnswer.value)

    await flashcardStore.recordAnswer(
      authStore.currentUser.uid,
      currentCategory.value.id,
      currentWord.value.id,
      isCorrect,
      userAnswer.value
    )

    // 次の問題へ
    userAnswer.value = ''
    flashcardStore.nextWord()
  } catch (error) {
    console.error('回答送信エラー:', error)
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  if (!currentCategory.value) {
    router.push({ name: 'home' })
  }
})
</script>

<style scoped>
.quiz-screen {
  padding: 20px 0;
}

h1 {
  font-size: 2rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0;
}

.question-content {
  margin: 20px 0;
}

.definition {
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.answer-section {
  margin-top: 20px;
}
</style>
