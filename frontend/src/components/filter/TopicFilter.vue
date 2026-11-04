<script setup>
import { computed, ref, watch } from 'vue'
import FilterSheet from '@/components/filter/FilterSheet.vue'
import FilterPills from '@/components/filter/FilterPills.vue'
import FilterChecks from '@/components/filter/FilterChecks.vue'
import { markedOptions } from '@/data/filterOptions'
import { countActiveFilters, emptyTopicFilter } from '@/lib/listQuery'
import { topicCategories } from '@/data/topicCategories'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: Object, default: emptyTopicFilter },
})
const emit = defineEmits(['update:modelValue', 'close'])

const draft = ref(emptyTopicFilter())

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = { ...emptyTopicFilter(), ...props.modelValue }
  },
  { immediate: true },
)

const categoryOptions = topicCategories.map((c) => ({ value: c.key, label: c.label }))

const resettable = computed(() => countActiveFilters(draft.value) > 0)

function save() {
  emit('update:modelValue', { ...draft.value })
  emit('close')
}
</script>

<template>
  <FilterSheet
    :open="open"
    :resettable="resettable"
    @close="emit('close')"
    @reset="draft = emptyTopicFilter()"
    @save="save"
  >
    <section class="section">
      <h2>Markiert</h2>
      <FilterPills v-model="draft.marked" name="topic-marked" :options="markedOptions" />
    </section>

    <section class="section">
      <h2>Themenbereiche</h2>
      <FilterChecks v-model="draft.categories" :options="categoryOptions" />
    </section>
  </FilterSheet>
</template>
