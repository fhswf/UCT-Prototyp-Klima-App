<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/lib/login'
import uctLogo from '@/assets/images/UCT-Logo.png'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref(false)

async function submitLogin() {
  error.value = !(await login(username.value, password.value))
  if (!error.value) {
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/karte')
  }
}
</script>

<template>
    <div class="login-view">
    <img class="logo" :src="uctLogo" alt="UCT Logo" />
    <div class="login-card">
      <h1>Willkommen</h1>
      <p class="subtitle">Melde dich an, um fortzufahren</p>

      <form @submit.prevent="submitLogin">
        <div class="field">
          <label for="username">Benutzername</label>
          <input id="username" v-model="username" type="text" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="password">Passwort</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="error">
          <span class="material-symbols-outlined">error</span>
          Benutzername oder Passwort ist falsch.
        </p>

        <button class="submit-btn" type="submit">Anmelden</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: var(--sp-xl);
  background: var(--c-bg-primary);
}

.login-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-xl) var(--sp-xl) 1.75rem;
  background: var(--c-bg);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.logo {
  width: 265px;
  height: auto;
  object-fit: contain;
  margin-bottom: var(--sp-xl);
}

h1 {
  font-family: var(--ff-display);
  font-size: var(--fs-xl);
  color: var(--c-text);
}

.subtitle {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  margin-bottom: var(--sp-md);
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  text-align: left;
}

label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text-muted);
}

input {
  width: 100%;
  padding: var(--sp-md) var(--sp-lg);
  font-family: var(--ff-base);
  font-size: var(--fs-md);
  color: var(--c-text);
  background: var(--c-bg-subtle);
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
}

input:focus {
  outline: none;
  border-color: var(--c-primary);
  background: var(--c-bg);
}

.error {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--c-danger);
}

.error .material-symbols-outlined {
  font-size: var(--fs-md);
}

.submit-btn {
  width: 100%;
  padding: var(--sp-lg);
  font-family: var(--ff-base);
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  color: var(--c-text-on-primary);
  background: var(--c-primary);
  border: none;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background 0.15s ease;
}

.submit-btn:hover {
  background: var(--c-primary-hover);
}

.submit-btn:active {
  transform: translateY(1px);
}
</style>
