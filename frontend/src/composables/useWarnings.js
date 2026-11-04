import { ref } from 'vue'
import { api } from '@/services/api'

const warnings = ref([])
let loaded = false

async function loadWarnings() {
  if (loaded) return
  loaded = true
  try {
    const data = await api.warnings()
    warnings.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.warn('[warnings] konnten nicht geladen werden:', e)
    warnings.value = []
  }
}

export function useWarnings() {
  return { warnings, loadWarnings }
}
