import { getCurrentScope, onScopeDispose, ref } from 'vue'
import { offFresh } from '@/services/api'

export function useApi(fetcher) {
  const data = ref(null)
  const error = ref(null)

  const onFresh = (fresh) => (data.value = fresh)
  if (getCurrentScope()) onScopeDispose(() => offFresh(onFresh))

  async function load(...args) {
    error.value = null
    try {
      data.value = await fetcher(...args, onFresh)
      return data.value
    } catch (e) {
      error.value = e
      console.warn('[useApi]', e)
      return null
    }
  }

  return { data, error, load }
}
