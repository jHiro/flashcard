import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

export interface Word {
  id: string
  categoryId: string
  term: string
  definition: string
  examples: string[]
  order: number
  createdBy: string
  createdAt: any
}

export interface Category {
  id: string
  name: string
  subject: string
  level: string
  description: string
  createdBy: string
  createdAt: any
  wordCount: number
}

export interface Progress {
  categoryName: string
  totalWords: number
  correctCount: number
  wrongCount: number
  completionRate: number
  lastReviewedAt: any
  answers: Record<string, AnswerRecord>
}

export interface AnswerRecord {
  isCorrect: boolean
  answeredAt: any
  userAnswer?: string
}

export const useFlashcardStore = defineStore('flashcard', () => {
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const currentWords = ref<Word[]>([])
  const currentWordIndex = ref(0)
  const userProgress = ref<Record<string, Progress>>({})
  const isLoading = ref(false)

  // すべてのカテゴリを取得
  const loadCategories = async () => {
    isLoading.value = true
    try {
      console.log('📚 カテゴリ読み込み開始')
      console.log('🔗 Firestore インスタンス:', db)
      
      const q = query(collection(db, 'categories'))
      console.log('🔍 クエリ作成完了:', q)
      
      const snapshot = await getDocs(q)
      console.log('✅ Firestore クエリ成功')
      console.log('📊 取得したドキュメント数:', snapshot.docs.length)
      console.log('📋 ドキュメント一覧:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))
      
      categories.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Category))
      
      console.log('✨ カテゴリ読み込み完了:', categories.value)
    } catch (error: any) {
      console.error('❌ カテゴリの取得エラー:', error)
      console.error('📍 エラーコード:', error.code)
      console.error('📍 エラーメッセージ:', error.message)
      console.error('📍 スタックトレース:', error.stack)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // カテゴリを選択して問題を読込
  const selectCategory = async (categoryId: string) => {
    isLoading.value = true
    try {
      // カテゴリを検索
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId))
      if (!categoryDoc.exists()) {
        throw new Error('カテゴリが見つかりません')
      }

      currentCategory.value = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as Category

      // そのカテゴリの問題を取得
      const q = query(
        collection(db, 'words'),
        where('categoryId', '==', categoryId)
      )
      const snapshot = await getDocs(q)
      currentWords.value = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Word))
        .sort((a, b) => a.order - b.order)

      currentWordIndex.value = 0
    } catch (error) {
      console.error('カテゴリ選択エラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 次の問題に進む
  const nextWord = () => {
    if (currentWordIndex.value < currentWords.value.length - 1) {
      currentWordIndex.value++
    }
  }

  // 前の問題に戻る
  const previousWord = () => {
    if (currentWordIndex.value > 0) {
      currentWordIndex.value--
    }
  }

  // 現在の問題を取得
  const getCurrentWord = () => {
    return currentWords.value[currentWordIndex.value] || null
  }

  // 回答を記録
  const recordAnswer = async (
    userId: string,
    categoryId: string,
    wordId: string,
    isCorrect: boolean,
    userAnswer?: string
  ) => {
    try {
      const progressRef = doc(db, `progress/${userId}/${categoryId}`)

      // 現在のカテゴリと問題数を取得
      const category = categories.value.find((c) => c.id === categoryId)
      if (!category) {
        throw new Error('カテゴリが見つかりません')
      }

      // 既存の進捗を取得
      let currentProgress = userProgress.value[categoryId]
      if (!currentProgress) {
        currentProgress = {
          categoryName: category.name,
          totalWords: category.wordCount,
          correctCount: 0,
          wrongCount: 0,
          completionRate: 0,
          lastReviewedAt: null,
          answers: {},
        }
      }

      // 新しい回答を追加
      const newAnswer: AnswerRecord = {
        isCorrect,
        answeredAt: serverTimestamp(),
      }
      if (userAnswer !== undefined) {
        newAnswer.userAnswer = userAnswer
      }

      currentProgress.answers[wordId] = newAnswer

      // 正解数・不正解数を更新
      const answeredWords = Object.values(currentProgress.answers)
      currentProgress.correctCount = answeredWords.filter(
        (a) => a.isCorrect
      ).length
      currentProgress.wrongCount = answeredWords.filter(
        (a) => !a.isCorrect
      ).length
      currentProgress.completionRate = Math.round(
        (answeredWords.length / currentProgress.totalWords) * 100
      )
      currentProgress.lastReviewedAt = serverTimestamp()

      // Firestoreに保存
      await updateDoc(progressRef, currentProgress)

      // ローカルストアを更新
      userProgress.value[categoryId] = currentProgress
    } catch (error) {
      console.error('回答記録エラー:', error)
      throw error
    }
  }

  // ユーザーの進捗を読込
  const loadUserProgress = async (userId: string) => {
    try {
      const progressRef = collection(db, `progress/${userId}`)
      const snapshot = await getDocs(progressRef)
      snapshot.docs.forEach((doc) => {
        userProgress.value[doc.id] = doc.data() as Progress
      })
    } catch (error) {
      console.error('進捗の取得エラー:', error)
      throw error
    }
  }

  return {
    categories,
    currentCategory,
    currentWords,
    currentWordIndex,
    userProgress,
    isLoading,
    loadCategories,
    selectCategory,
    nextWord,
    previousWord,
    getCurrentWord,
    recordAnswer,
    loadUserProgress,
  }
})
