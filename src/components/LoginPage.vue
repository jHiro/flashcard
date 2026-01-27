<template>
  <v-app>
    <div class="login-wrapper">
      <v-card class="login-card" elevation="12">
        <div class="login-header">
          <h1 class="app-title">📚 Flashcard</h1>
          <p class="app-subtitle">学習用語チェックアプリ</p>
        </div>

        <div class="login-body">
          <v-form @submit.prevent="handleAuth">
                <!-- エラーメッセージ -->
                <v-alert
                  v-if="authStore.error"
                  type="error"
                  dismissible
                  class="mb-6"
                  variant="tonal"
                >
                  {{ authStore.error }}
                </v-alert>

                <!-- メールアドレス -->
                <v-text-field
                  v-model="email"
                  label="メールアドレス"
                  type="email"
                  placeholder="example@email.com"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  class="mb-4"
                  :disabled="isLoading"
                  required
                  density="comfortable"
                ></v-text-field>

                <!-- パスワード -->
                <v-text-field
                  v-model="password"
                  label="パスワード"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  class="mb-2"
                  :disabled="isLoading"
                  required
                  density="comfortable"
                ></v-text-field>

                <!-- パスワード確認（サインアップ時） -->
                <v-text-field
                  v-if="isSignup"
                  v-model="passwordConfirm"
                  label="パスワード（確認）"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                  variant="outlined"
                  class="mb-6"
                  :disabled="isLoading"
                  required
                  density="comfortable"
                ></v-text-field>

                <!-- 送信ボタン -->
                <v-btn
                  block
                  color="primary"
                  size="x-large"
                  type="submit"
                  :loading="isLoading"
                  :disabled="!isFormValid || isLoading"
                  class="mb-4 auth-button"
                >
                  {{ isSignup ? 'サインアップ' : 'ログイン' }}
                </v-btn>

                <!-- ゲストログインボタン -->
                <v-btn
                  v-if="!isSignup"
                  block
                  color="success"
                  variant="outlined"
                  size="large"
                  @click="handleGuestLogin"
                  :loading="isLoading"
                  :disabled="isLoading"
                  class="mb-4"
                >
                  ゲストでログイン
                </v-btn>

                <!-- トグル -->
                <div class="text-center">
                  <v-btn
                    variant="text"
                    size="default"
                    @click="toggleAuthMode"
                    :disabled="isLoading"
                    class="toggle-button"
                  >
                    {{ isSignup ? 'ログインはこちら' : 'サインアップはこちら' }}
                  </v-btn>
                </div>
              </v-form>
            </div>
          </v-card>
        </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isSignup = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isLoading = ref(false)

const isFormValid = computed(() => {
  if (isSignup.value) {
    return (
      email.value.trim() !== '' &&
      password.value.trim() !== '' &&
      passwordConfirm.value.trim() !== '' &&
      password.value === passwordConfirm.value
    )
  }
  return email.value.trim() !== '' && password.value.trim() !== ''
})

const handleAuth = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    if (isSignup.value) {
      await authStore.signupWithEmail(email.value, password.value)
    } else {
      await authStore.loginWithEmail(email.value, password.value)
    }

    // ログイン成功後、ホーム画面へ
    router.push({ name: 'home' })
  } catch (error) {
    console.error('認証エラー:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGuestLogin = async () => {
  isLoading.value = true
  try {
    // ゲストアカウントでログイン
    await authStore.loginWithEmail('guest@example.com', 'guest@example.com')
    // ログイン成功後、ホーム画面へ
    router.push({ name: 'home' })
  } catch (error) {
    console.error('ゲストログインエラー:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleAuthMode = () => {
  isSignup.value = !isSignup.value
  authStore.error = null
  password.value = ''
  passwordConfirm.value = ''
}

// ログイン済みならホームへリダイレクト
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'home' })
  }
})
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.login-card {
  width: 100%;
  max-width: 450px;
  border-radius: 20px !important;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
}

.app-title {
  font-size: 1.85rem;
  font-weight: bold;
  margin: 0 0 6px 0;
}

.app-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.95;
}

.login-body {
  padding: 28px 24px;
}

.auth-button {
  font-size: 1.1rem;
  font-weight: bold;
  height: 56px !important;
}

.toggle-button {
  text-transform: none;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .login-wrapper {
    padding: 0;
  }

  .login-card {
    max-width: 100%;
    border-radius: 0 !important;
    min-height: 100vh;
  }

  .login-header {
    padding: 24px 20px;
  }

  .app-title {
    font-size: 1.65rem;
  }

  .app-subtitle {
    font-size: 0.85rem;
  }

  .login-body {
    padding: 24px 20px;
  }
}

@media (max-width: 400px) {
  .login-header {
    padding: 20px 16px;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .app-subtitle {
    font-size: 0.8rem;
  }

  .login-body {
    padding: 20px 16px;
  }
}
</style>
