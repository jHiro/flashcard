<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const navigateTo = (name: string) => {
  router.push({ name })
}
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Flashcard - 学習用語チェック</v-app-bar-title>
      
      <v-spacer></v-spacer>

      <v-btn
        v-if="isAuthenticated && route.name !== 'home'"
        text
        @click="navigateTo('home')"
        class="mr-2"
      >
        セット一覧
      </v-btn>

      <v-btn
        v-if="isAuthenticated"
        text
        @click="navigateTo('progress')"
        class="mr-2"
      >
        進度確認
      </v-btn>

      <v-menu v-if="isAuthenticated">
        <template v-slot:activator="{ props }">
          <v-btn text v-bind="props">
            {{ authStore.currentUser?.email || 'ユーザー' }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style scoped>
/* グローバルスタイルは style.css で管理 */
</style>
