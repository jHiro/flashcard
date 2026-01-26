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
  router.push({ name: 'login' })
}

const navigateTo = (name: string) => {
  router.push({ name })
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="isAuthenticated" app color="primary" elevation="2">
      <v-app-bar-title class="app-bar-title">
        <span class="title-icon">📚</span>
        <span class="title-text">Flashcard</span>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>

      <v-btn
        v-if="route.name !== 'home'"
        variant="text"
        @click="navigateTo('home')"
        prepend-icon="mdi-view-list"
      >
        セット一覧
      </v-btn>

      <v-btn
        variant="text"
        @click="navigateTo('progress')"
        prepend-icon="mdi-chart-line"
      >
        進度確認
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" prepend-icon="mdi-account-circle">
            {{ authStore.currentUser?.email || 'ユーザー' }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="logout" prepend-icon="mdi-logout">
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
.app-bar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.title-icon {
  font-size: 1.5rem;
}

.title-text {
  font-size: 1.25rem;
}
</style>
