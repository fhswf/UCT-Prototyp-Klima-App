<script setup></script>

<template>
  <button class="app-btn" type="button"><slot /></button>
</template>

<style scoped>
.app-btn {
  width: 100%;
  padding: var(--sp-xl);
  font-family: var(--ff-base);
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  color: var(--c-text);
  background: var(--c-bg);
  border: none;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-btn);
  cursor: pointer;
}
.app-btn:hover {
  background: var(--c-bg-subtle);
}
.app-btn:active {
  background: var(--c-bg-primary);
}
</style>
