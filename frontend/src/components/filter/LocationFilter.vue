<script setup>
import { computed, ref, watch } from 'vue'
import FilterSheet from '@/components/filter/FilterSheet.vue'
import FilterPills from '@/components/filter/FilterPills.vue'
import FilterChecks from '@/components/filter/FilterChecks.vue'
import {
  POI_NEARBY_RADIUS,
  distanceBuckets,
  markedOptions,
  poiOptions,
  quartettOptions,
} from '@/data/filterOptions'
import { countActiveFilters, emptyLocationFilter } from '@/lib/listQuery'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: Object, default: emptyLocationFilter },
  audiences: { type: Array, default: () => [] }, // [{ key, name }]
})
const emit = defineEmits(['update:modelValue', 'close'])

// Änderungen greifen erst beim Speichern, Schließen verwirft sie.
const draft = ref(emptyLocationFilter())

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = { ...emptyLocationFilter(), ...props.modelValue }
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
    @reset="draft = emptyLocationFilter()"
    @save="save"
  >
    <section class="section">
      <h2>Markiert</h2>
      <FilterPills v-model="draft.marked" name="loc-marked" :options="markedOptions" />
    </section>

    <section v-if="audienceOptions.length" class="section">
      <h2>Zielgruppen</h2>
      <FilterChecks v-model="draft.audiences" :options="audienceOptions" />
    </section>

    <section class="section">
      <h2>POIs in der Nähe (&lt; {{ POI_NEARBY_RADIUS }} m)</h2>
      <FilterChecks v-model="draft.pois" :options="poiOptions" />
    </section>

    <section class="section">
      <h2>Entfernung nächster Standort</h2>
      <FilterPills
        v-model="draft.distance"
        name="loc-distance"
        :options="distanceBuckets"
        clearable
      />
    </section>

    <section class="section">
      <h2>Standorte aus dem Klima-Quartett</h2>
      <FilterPills v-model="draft.quartett" name="loc-quartett" :options="quartettOptions" />
    </section>
  </FilterSheet>
</template>
