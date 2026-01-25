<template>
  <div class="quiz-screen">
    <v-container class="pa-0">
      <v-row class="mb-1 align-center">
        <v-col cols="auto">
          <v-btn 
            color="secondary" 
            variant="tonal" 
            @click="goBack"
            icon="mdi-arrow-left"
          >
          </v-btn>
        </v-col>
        <v-col>
          <div class="header-text">
            <h1>{{ currentCategory?.name }}</h1>
            <p v-if="currentWord" class="subtitle">カード {{ currentWordIndex + 1 }} / {{ currentWords.length }}</p>
          </div>
        </v-col>
        <v-col cols="auto">
          <div style="width: 40px;"></div>
        </v-col>
      </v-row>

      <v-progress-linear
        :value="((currentWordIndex + 1) / currentWords.length) * 100"
        class="mb-1"
      ></v-progress-linear>

      <v-row v-if="currentWord">
        <v-col cols="12" class="pa-0">
          <v-card class="flashcard" :class="{ flipped: showAnswer }">
            <v-card-text>
              <div class="card-content">
                <!-- 問題文を常に表示 -->
                <div class="question-section">
                  <p class="question-label">問題</p>
                  <h2 class="question-term">{{ currentWord.question }}</h2>
                  
                  <!-- ヒントボタン -->
                  <div v-if="currentWord.hint" class="hint-button-area">
                    <v-btn
                      variant="text"
                      size="small"
                      color="white"
                      @click="showHint = !showHint"
                      prepend-icon="mdi-lightbulb-outline"
                    >
                      {{ showHint ? 'ヒントを隠す' : 'ヒントを表示' }}
                    </v-btn>
                    
                    <!-- ヒント内容 -->
                    <div v-if="showHint" class="hint-display">
                      <p class="hint-text-white">{{ currentWord.hint }}</p>
                    </div>
                  </div>
                </div>

                <v-divider class="my-6"></v-divider>

                <!-- 答えエリア（固定高さ） -->
                <div class="answer-area">
                  <!-- 答えを表示 -->
                  <div v-if="showAnswer" class="answer-content">
                    <p class="answer-label">答え</p>
                    <p class="definition">{{ currentWord.answer }}</p>

                    <!-- 例文・補足 -->
                    <div v-if="currentWord.examples && currentWord.examples.length > 0" class="mt-4">
                      <p class="example-label">補足:</p>
                      <ul>
                        <li v-for="(example, index) in currentWord.examples" :key="index">
                          {{ example }}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 答え表示前のメッセージ -->
                  <div v-else class="hint-content">
                    <p class="text-center hint-message">
                      💭 答えを考えてから「答えを表示」ボタンを押してください
                    </p>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="card-actions-fixed">
              <div class="button-container">
                <!-- 答え表示前 -->
                <v-btn
                  v-if="!showAnswer"
                  color="primary"
                  class="answer-button"
                  size="x-large"
                  @click="showAnswer = true"
                >
                  答えを表示
                </v-btn>

                <!-- 答え表示後 -->
                <template v-else>
                  <v-btn
                    color="error"
                    class="result-button"
                    size="x-large"
                    @click="handleAnswer(false)"
                  >
                    ❌ 不正解
                  </v-btn>
                  <v-btn
                    color="success"
                    class="result-button"
                    size="x-large"
                    @click="handleAnswer(true)"
                  >
                    ✅ 正解
                  </v-btn>
                </template>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else class="justify-center">
        <v-col cols="12" md="10" lg="8" class="pa-0">
          <v-card class="result-card" elevation="4">
            <v-card-title class="result-header">
              <h2>🎉 学習完了！</h2>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="result-content">
                <div class="result-stats">
                  <div class="stat-item">
                    <div class="stat-label">正解数</div>
                    <div class="stat-value">
                      <span class="correct-count">{{ currentProgress?.correctCount || 0 }}</span>
                      <span class="total-count"> / {{ currentWords.length }}</span>
                    </div>
                  </div>
                  
                  <v-divider class="my-2"></v-divider>
                  
                  <div class="stat-item">
                    <div class="stat-label">得点</div>
                    <div class="stat-score">{{ score }}</div>
                  </div>
                  
                  <v-progress-linear
                    :model-value="score"
                    :color="scoreColor"
                    height="16"
                    class="mt-2"
                  >
                    <strong>{{ score }}点</strong>
                  </v-progress-linear>
                  
                  <div class="result-message mt-3">
                    <p class="message-text">{{ resultMessage }}</p>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-btn 
                v-if="flashcardStore.wrongWords.length > 0"
                color="warning" 
                size="large" 
                block
                @click="retryWrong"
                prepend-icon="mdi-refresh"
                class="mb-2"
              >
                間違えた問題をやり直す ({{ flashcardStore.wrongWords.length }}問)
              </v-btn>
              <v-btn 
                color="primary" 
                size="large" 
                block
                @click="goBack"
                prepend-icon="mdi-view-list"
              >
                セット一覧に戻る
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashcardStore } from '@/stores/flashcard'
import { useAuthStore } from '@/stores/auth'

const flashcardStore = useFlashcardStore()
const authStore = useAuthStore()
const router = useRouter()

const showAnswer = ref(false)
const showHint = ref(false)

const currentCategory = computed(() => flashcardStore.currentCategory)
const currentWords = computed(() => flashcardStore.currentWords)
const currentWordIndex = computed(() => flashcardStore.currentWordIndex)
const currentWord = computed(() => flashcardStore.getCurrentWord())

// 現在のカテゴリの進捗データを取得
const currentProgress = computed(() => {
  if (!currentCategory.value) return null
  return flashcardStore.userProgress[currentCategory.value.id]
})

// 得点計算（100点満点）
const score = computed(() => {
  if (!currentProgress.value || !currentWords.value.length) return 0
  return Math.round((currentProgress.value.correctCount / currentWords.value.length) * 100)
})

// 得点に応じた色
const scoreColor = computed(() => {
  const s = score.value
  if (s >= 80) return 'success'
  if (s >= 60) return 'primary'
  if (s >= 40) return 'warning'
  return 'error'
})

// 結果メッセージ
const resultMessage = computed(() => {
  const s = score.value
  if (s === 100) return '完璧です！すべて正解しました！🎊'
  if (s >= 80) return '素晴らしい！よくできました！👏'
  if (s >= 60) return '良い結果です！もう少しで完璧です！💪'
  if (s >= 40) return '惜しい！もう一度復習してみましょう！📚'
  return 'もう一度チャレンジしてみましょう！📝'
})

// カードが変わったら答えとヒントを非表示にする
watch(currentWordIndex, () => {
  showAnswer.value = false
  showHint.value = false
})

const handleAnswer = async (isCorrect: boolean) => {
  if (!authStore.currentUser || !currentCategory.value || !currentWord.value) {
    console.error('❌ 必要なデータが不足しています:', {
      user: authStore.currentUser?.uid,
      category: currentCategory.value?.id,
      word: currentWord.value?.id
    })
    return
  }

  try {
    console.log('📝 回答を記録中...', {
      userId: authStore.currentUser.uid,
      categoryId: currentCategory.value.id,
      wordId: currentWord.value.id,
      isCorrect
    })

    await flashcardStore.recordAnswer(
      authStore.currentUser.uid,
      currentCategory.value.id,
      currentWord.value.id,
      isCorrect
    )

    console.log('✅ 回答記録完了。次のカードへ移動します')

    // 次のカードへ
    showAnswer.value = false
    flashcardStore.nextWord()
    
    console.log('📍 現在のカードインデックス:', flashcardStore.currentWordIndex)
    
    // 最後の問題の場合は進捗データを再読み込み
    if (!flashcardStore.getCurrentWord()) {
      console.log('📊 最後の問題完了。進捗データを再読み込みします')
      await flashcardStore.loadUserProgress(authStore.currentUser.uid)
    }
  } catch (error) {
    console.error('❌ 回答記録エラー:', error)
    alert('回答の記録に失敗しました。もう一度お試しください。')
  }
}

const goBack = () => {
  router.back()
}

const retryWrong = () => {
  flashcardStore.retryWrongWords()
  showAnswer.value = false
  showHint.value = false
}

onMounted(() => {
  if (!currentCategory.value) {
    router.push({ name: 'home' })
  }
})
</script>

<style scoped>
.quiz-screen {
  padding: 0;
  padding-bottom: 100px;
  min-height: 100vh;
}

.header-text {
  text-align: center;
}

h1 {
  font-size: 1.4rem;
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 2px 0 0 0;
}

.flashcard {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.flashcard.flipped {
  background-color: #f8f9fa;
}

.card-content {
  padding: 16px;
}

.answer-area {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-section {
  text-align: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hint-button-area {
  margin-top: 12px;
  min-height: 60px;
}

.hint-display {
  margin-top: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.hint-text-white {
  color: white;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.question-label {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.question-term {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.hint-content {
  text-align: center;
  width: 100%;
}

.hint-message {
  font-size: 1.2rem;
  color: #999;
  margin: 0;
  padding: 40px 20px;
}

.answer-content {
  width: 100%;
  align-self: flex-start;
}

.answer-label {
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #667eea;
  margin-bottom: 12px;
}

.example-label {
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
}

.hint-text {
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 12px;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  margin: 0;
}

.definition {
  font-size: 1.2rem;
  line-height: 1.8;
  padding: 20px;
  background-color: #fff;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  margin: 0;
}

.card-actions-fixed {
  padding: 16px;
  background: white;
  position: fixed;
  bottom: 12px;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-container {
  width: 100%;
  height: 56px;
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
}

.answer-button {
  width: 100%;
  max-width: 500px;
  height: 56px !important;
  font-size: 1.1rem;
  font-weight: bold;
}

.result-button {
  flex: 1;
  max-width: 250px;
  height: 56px !important;
  font-size: 1.1rem;
  font-weight: bold;
}

ul {
  margin-top: 8px;
  padding-left: 24px;
}

li {
  margin-bottom: 8px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.text-muted {
  color: #999;
}

/* 結果画面のスタイル */
.result-card {
  border-radius: 16px !important;
}

.result-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.result-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.result-content {
  padding: 8px;
}

.result-stats {
  text-align: center;
}

.stat-item {
  margin: 12px 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.correct-count {
  color: #4caf50;
}

.total-count {
  color: #999;
  font-size: 1.6rem;
}

.stat-score {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin: 8px 0;
}

.stat-score::after {
  content: '点';
  font-size: 1.5rem;
  margin-left: 6px;
}

.result-message {
  padding: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 8px;
}

.message-text {
  font-size: 1.05rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}
</style>

