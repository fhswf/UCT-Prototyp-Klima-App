<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import ArticleHero from '@/components/article/ArticleHero.vue'
import ArticleBody from '@/components/article/ArticleBody.vue'
import TopicAction from '@/components/article/TopicAction.vue'
import LogosFooter from '@/components/article/LogosFooter.vue'
import { useFavorites, FAV_TOPIC } from '@/composables/useFavorites'

const routeParams = useRoute()
const router = useRouter()
const topic = ref(null)
const { isFav, toggle } = useFavorites()

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'Wiki', query: { tab: 'topics' } })
}

watch(
  () => routeParams.params.id,
  async (id) => {
    topic.value = await api.topic(id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="deepdive" v-if="topic">
    <ArticleHero
      :title="topic.name"
      :image="topic.thumbnail_url"
      :fav="isFav(FAV_TOPIC, topic.id)"
      @update:fav="toggle(FAV_TOPIC, topic.id)"
      @back="goBack"
    />
    <p v-if="topic.summary" class="summary">{{ topic.summary }}</p>
    <ArticleBody :blocks="topic.body" />
    <TopicAction
      v-if="topic.action_title || topic.action_body?.length"
      :title="topic.action_title || 'Was kann ich tun?'"
      :body="topic.action_body ?? []"
    />
    <LogosFooter />
  </div>
</template>

<style scoped>
.summary {
  padding: var(--sp-lg);
  line-height: 1.5;
}
</style>
