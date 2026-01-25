<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row class="align-center justify-center" style="height: 100vh">
        <v-col cols="12" sm="8" md="5" lg="4">
          <v-card class="pa-8">
            <v-card-title class="text-center text-h4 mb-6">
              Flashcard
            </v-card-title>

            <v-card-text>
              <v-form @submit.prevent="handleAuth">
                <!-- エラーメッセージ -->
                <v-alert
                  v-if="authStore.error"
                  type="error"
                  dismissible
                  class="mb-4"
                >
                  {{ authStore.error }}
                </v-alert>

                <!-- メールアドレス -->
                <v-text-field
                  v-model="email"
                  label="メールアドレス"
                  type="email"
                  placeholder="example@email.com"
                  prepend-icon="mdi-email"
                  class="mb-4"
                  :disabled="isLoading"
                  required
                ></v-text-field>

                <!-- パスワード -->
                <v-text-field
                  v-model="password"
                  label="パスワード"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-icon="mdi-lock"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  class="mb-2"
                  :disabled="isLoading"
                  required
                ></v-text-field>

                <!-- パスワード確認（サインアップ時） -->
                <v-text-field
                  v-if="isSignup"
                  v-model="passwordConfirm"
                  label="パスワード（確認）"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  prepend-icon="mdi-lock"
                  :append-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPasswordConfirm = !showPasswordConfirm"
                  class="mb-6"
                  :disabled="isLoading"
                  required
                ></v-text-field>

                <!-- 送信ボタン -->
                <v-btn
                  block
                  color="primary"
                  size="large"
                  type="submit"
                  :loading="isLoading"
                  :disabled="!isFormValid || isLoading"
                  class="mb-4"
                >
                  {{ isSignup ? 'サインアップ' : 'ログイン' }}
                </v-btn>

                <!-- トグル -->
                <div style="text-align: center">
                  <v-btn
                    variant="text"
                    size="small"
                    @click="toggleAuthMode"
                    :disabled="isLoading"
                  >
                    {{ isSignup ? 'ログインはこちら' : 'サインアップはこちら' }}
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- テストアカウント情報 -->
          <v-card class="mt-6 pa-4" variant="tonal">
            <v-card-text>
              <p class="text-caption font-weight-bold">テストアカウント:</p>
              <p class="text-caption">メール: test@example.com</p>
              <p class="text-caption">パスワード: test@example.com</p>
              <v-btn
                variant="text"
                size="small"
                @click="autofillTestAccount"
                class="mt-2"
              >
                テストアカウントで試す
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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

const toggleAuthMode = () => {
  isSignup.value = !isSignup.value
  authStore.error = null
  password.value = ''
  passwordConfirm.value = ''
}

const autofillTestAccount = () => {
  email.value = 'test@example.com'
  password.value = 'test@example.com'
  passwordConfirm.value = 'test@example.com'
}

// ログイン済みならホームへリダイレクト
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'home' })
  }
})
</script>

<style scoped>
/* No additional styles needed */
</style>
