<script setup>
defineProps({
  result: { type: Object, required: true },
})
</script>

<template>
  <li class="search-result">
    <RouterLink :to="`/standort/${result.id}`" class="card-link">
      <div class="card">
        <img
          :src="result.thumbnail_url"
          :alt="`Bild von ${result.name}`"
          referrerpolicy="no-referrer"
          class="card-image"
          v-img-fallback
        />
        <div class="card-text">
          <strong>{{ result.name }}</strong>
          <p class="label">Standort {{ result.id }}</p>
        </div>
      </div>
    </RouterLink>
  </li>
</template>

<style scoped>
.search-result {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-result .card-link {
  text-decoration: none;
}

.card {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  background: var(--c-bg-primary);
  border-radius: var(--r-lg);
  padding: var(--sp-sm) var(--sp-md);
  cursor: pointer;

  .card-image {
    width: 40px;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: var(--r-pill);
  }

  .card-text {
    font-weight: var(--fw-regular);
    line-height: 20px;
    font-size: var(--fs-sm);
    text-overflow: ellipsis;
    overflow: hidden;

    strong {
      font-size: var(--fs-md);
    }
  }
}
</style>
