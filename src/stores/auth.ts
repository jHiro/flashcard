import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/firebase'
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // 認証状態の監視
  const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
      console.log('🔐 認証状態変更:', user ? `ログイン (${user.email})` : 'ログアウト')
      console.log('👤 ユーザー情報:', user)
      currentUser.value = user
      isLoading.value = false
    })
  }

  // メール/パスワードでログイン
  const loginWithEmail = async (email: string, password: string) => {
    try {
      error.value = null
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = getErrorMessage(err.code)
      throw err
    }
  }

  // メール/パスワードでサインアップ
  const signupWithEmail = async (email: string, password: string) => {
    try {
      error.value = null
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = getErrorMessage(err.code)
      throw err
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth)
      currentUser.value = null
      error.value = null
    } catch (err) {
      console.error('ログアウトエラー:', err)
      throw err
    }
  }

  // エラーメッセージの日本語翻訳
  const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      'auth/invalid-email': '無効なメールアドレスです',
      'auth/user-disabled': 'このアカウントは無効化されています',
      'auth/user-not-found': 'メールアドレスが見つかりません',
      'auth/wrong-password': 'パスワードが正しくありません',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/weak-password': 'パスワードが短すぎます（6文字以上）',
      'auth/operation-not-allowed': 'この操作は許可されていません',
    }
    return messages[code] || 'エラーが発生しました'
  }

  // ユーザーがログインしているか確認
  const isAuthenticated = computed(() => currentUser.value !== null)

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    error,
    initAuth,
    loginWithEmail,
    signupWithEmail,
    logout,
  }
})
