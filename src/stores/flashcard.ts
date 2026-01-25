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
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

export interface Word {
  id: string
  categoryId: string
  question: string
  answer: string
  hint?: string
  examples?: string[]
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
  completionRate: number // 回答した問題の割合（0-100）
  correctRate: number // 正解率（0-100）
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
  const wrongWords = ref<Word[]>([])

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
      // wrongWordsをリセット（新しいセッションの開始）
      wrongWords.value = []
      
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
      
      // Fisher-Yatesシャッフルアルゴリズムでランダムに並べ替え
      const words = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Word))
      
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = words[i]!
        words[i] = words[j]!
        words[j] = temp
      }
      
      currentWords.value = words

      currentWordIndex.value = 0
      
      console.log('✅ カテゴリ選択完了。wrongWords リセット:', wrongWords.value.length)
    } catch (error) {
      console.error('カテゴリ選択エラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 次の問題に進む
  const nextWord = () => {
    if (currentWordIndex.value < currentWords.value.length) {
      currentWordIndex.value++
    }
  }

  // 前の問題に戻る
  const previousWord = () => {
    if (currentWordIndex.value > 0) {
      currentWordIndex.value--
    }
  }

  // 間違えた問題だけを再度学習
  const retryWrongWords = () => {
    if (wrongWords.value.length === 0) {
      return
    }
    
    // 間違えた問題をシャッフル
    const shuffled = [...wrongWords.value]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }
    
    currentWords.value = shuffled
    currentWordIndex.value = 0
    wrongWords.value = [] // リセット
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
      // progress/{userId}/categories/{categoryId} というパスに保存
      const progressRef = doc(db, `progress/${userId}/categories/${categoryId}`)

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
          correctRate: 0,
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

      // 間違えた場合はwrongWordsに追加
      if (!isCorrect) {
        const wrongWord = currentWords.value.find(w => w.id === wordId)
        if (wrongWord && !wrongWords.value.some(w => w.id === wordId)) {
          wrongWords.value.push(wrongWord)
          console.log('❌ 間違えた問題を追加:', wordId, '合計:', wrongWords.value.length)
        }
      }

      // 正解数・不正解数を更新
      const answeredWords = Object.values(currentProgress.answers)
      currentProgress.correctCount = answeredWords.filter(
        (a) => a.isCorrect
      ).length
      currentProgress.wrongCount = answeredWords.filter(
        (a) => !a.isCorrect
      ).length
      
      // 完了率（回答した問題の割合）
      currentProgress.completionRate = Math.round(
        (answeredWords.length / currentProgress.totalWords) * 100
      )
      
      // 正解率（回答した問題のうち正解した割合）
      if (answeredWords.length > 0) {
        currentProgress.correctRate = Math.round(
          (currentProgress.correctCount / answeredWords.length) * 100
        )
      } else {
        currentProgress.correctRate = 0
      }
      
      currentProgress.lastReviewedAt = serverTimestamp()

      // Firestoreに保存（存在しない場合は作成、存在する場合は更新）
      await setDoc(progressRef, currentProgress, { merge: true })

      // ローカルストアを更新
      userProgress.value[categoryId] = currentProgress
      
      console.log('✅ 回答を記録しました:', { wordId, isCorrect })
    } catch (error) {
      console.error('回答記録エラー:', error)
      throw error
    }
  }

  // ユーザーの進捗を読込
  const loadUserProgress = async (userId: string) => {
    try {
      // progress/{userId}/categories というサブコレクションを参照
      const progressRef = collection(db, `progress/${userId}/categories`)
      const snapshot = await getDocs(progressRef)
      snapshot.docs.forEach((doc) => {
        userProgress.value[doc.id] = doc.data() as Progress
      })
    } catch (error) {
      console.error('進捗の取得エラー:', error)
      throw error
    }
  }

  // 間違った問題をFirestoreに保存
  const saveWrongWords = async (userId: string, categoryId: string) => {
    try {
      if (wrongWords.value.length === 0) {
        console.log('保存する間違った問題がありません')
        return
      }

      const wrongWordsRef = doc(db, `wrongWords/${userId}/categories/${categoryId}`)
      const wrongWordIds = wrongWords.value.map(w => w.id)
      
      await setDoc(wrongWordsRef, {
        categoryId,
        wordIds: wrongWordIds,
        savedAt: serverTimestamp(),
      })

      console.log('✅ 間違った問題を保存しました:', wrongWordIds.length + '問')
    } catch (error) {
      console.error('間違った問題の保存エラー:', error)
      throw error
    }
  }

  // 保存された間違った問題を読み込んで復習モードで開始
  const loadWrongWordsForReview = async (userId: string, categoryId: string) => {
    isLoading.value = true
    try {
      // 保存された間違った問題IDリストを取得
      const wrongWordsRef = doc(db, `wrongWords/${userId}/categories/${categoryId}`)
      const wrongWordsDoc = await getDoc(wrongWordsRef)
      
      if (!wrongWordsDoc.exists()) {
        throw new Error('保存された間違った問題がありません')
      }

      const data = wrongWordsDoc.data()
      const wordIds = data.wordIds || []

      if (wordIds.length === 0) {
        throw new Error('保存された間違った問題がありません')
      }

      // カテゴリを取得
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId))
      if (!categoryDoc.exists()) {
        throw new Error('カテゴリが見つかりません')
      }

      currentCategory.value = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as Category

      // 問題IDから問題を取得
      const words: Word[] = []
      for (const wordId of wordIds) {
        const wordDoc = await getDoc(doc(db, 'words', wordId))
        if (wordDoc.exists()) {
          words.push({
            id: wordDoc.id,
            ...wordDoc.data(),
          } as Word)
        }
      }

      // Fisher-Yatesシャッフル
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = words[i]!
        words[i] = words[j]!
        words[j] = temp
      }
      
      currentWords.value = words
      currentWordIndex.value = 0
      wrongWords.value = [] // リセット

      console.log('✅ 間違った問題を読み込みました:', words.length + '問')
    } catch (error) {
      console.error('間違った問題の読み込みエラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 保存された間違った問題があるかチェック
  const hasWrongWords = async (userId: string, categoryId: string): Promise<boolean> => {
    try {
      const wrongWordsRef = doc(db, `wrongWords/${userId}/categories/${categoryId}`)
      const wrongWordsDoc = await getDoc(wrongWordsRef)
      
      if (!wrongWordsDoc.exists()) {
        return false
      }

      const data = wrongWordsDoc.data()
      const wordIds = data.wordIds || []
      return wordIds.length > 0
    } catch (error) {
      console.error('間違った問題チェックエラー:', error)
      return false
    }
  }

  return {
    categories,
    currentCategory,
    currentWords,
    currentWordIndex,
    userProgress,
    isLoading,
    wrongWords,
    loadCategories,
    selectCategory,
    nextWord,
    previousWord,
    retryWrongWords,
    getCurrentWord,
    recordAnswer,
    loadUserProgress,
    saveWrongWords,
    loadWrongWordsForReview,
    hasWrongWords,
  }
})
