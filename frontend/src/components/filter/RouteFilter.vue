<script setup>
import { computed, ref, watch } from 'vue'
import FilterSheet from '@/components/filter/FilterSheet.vue'
import FilterPills from '@/components/filter/FilterPills.vue'
import FilterChecks from '@/components/filter/FilterChecks.vue'
import {
  difficultyOptions,
  distanceBuckets,
  lengthBuckets,
  markedOptions,
  poiOptions,
} from '@/data/filterOptions'
import { countActiveFilters, emptyRouteFilter } from '@/lib/listQuery'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: Object, default: emptyRouteFilter },
  audiences: { type: Array, default: () => [] }, // [{ key, name }]
})
const emit = defineEmits(['update:modelValue', 'close'])

// Änderungen greifen erst beim Speichern, Schließen verwirft sie.
const draft = ref(emptyRouteFilter())

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = { ...emptyRouteFilter(), ...props.modelValue }
  },
  { immediate: true },
)

const audienceOptions = computed(() =>
  props.audiences.map((a) => ({ value: a.key, label: a.name })),
)

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
    @reset="draft = emptyRouteFilter()"
    @save="save"
  >
    <section class="section">
      <h2>Markiert</h2>
      <FilterPills v-model="draft.marked" name="route-marked" :options="markedOptions" />
    </section>

    <section v-if="audienceOptions.length" class="section">
      <h2>Zielgruppen</h2>
      <FilterChecks v-model="draft.audiences" :options="audienceOptions" />
    </section>

    <section class="section">
      <h2>POIs entlang der Route</h2>
      <FilterChecks v-model="draft.pois" :options="poiOptions" />
    </section>

    <section class="section">
      <h2>Schwierigkeit</h2>
      <FilterChecks v-model="draft.difficulty" :options="difficultyOptions" />
    </section>

    <section class="section">
      <h2>Länge</h2>
      <FilterPills v-model="draft.length" name="route-length" :options="lengthBuckets" clearable />
    </section>

    <section class="section">
      <h2>Entfernung nächster Standort</h2>
      <FilterPills
        v-model="draft.distance"
        name="route-distance"
        :options="distanceBuckets"
        clearable
      />
    </section>
  </FilterSheet>
</template>
