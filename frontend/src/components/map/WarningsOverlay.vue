<script setup>
import { ref, computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useWarnings } from '@/composables/useWarnings'

const { warnings } = useWarnings()

defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const TIPS_PER_PAGE = 3

const active = ref(null)
const page = ref(0)

const pages = computed(() => {
  const tips = active.value?.text ?? []
  const chunks = []
  for (let i = 0; i < tips.length; i += TIPS_PER_PAGE) {
    chunks.push(tips.slice(i, i + TIPS_PER_PAGE))
  }
  return chunks.length ? chunks : [[]]
})
const isLastPage = computed(() => page.value >= pages.value.length - 1)

function openWarning(w) {
  active.value = w
  page.value = 0
}
function backToList() {
  active.value = null
  page.value = 0
}
function close() {
  backToList()
  emit('close')
}
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="slide-up">
      <div v-if="open" class="warnings-sheet">
        <header class="head">
          <button v-if="active" class="back" aria-label="Zurück" @click="backToList">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1>{{ active ? active.title : 'Warnungen' }}</h1>
          <button class="close-x" aria-label="Schließen" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <!-- Liste aller Warnungen -->
        <div v-if="!active">
          <ul class="list">
            <li v-for="w in warnings" :key="w.id">
              <button class="warning-card" :class="`sev-${w.severity}`" @click="openWarning(w)">
                <span class="material-symbols-outlined sev-icon">warning</span>
                <span class="warning-text">
                  <strong>{{ w.title }}</strong>
                  <span>{{ w.description }}</span>
                  <span v-if="w.action" class="action">{{ w.action.text }}</span>
                </span>
              </button>
            </li>
            <li v-if="!warnings.length" class="none">Aktuell keine Warnungen.</li>
          </ul>
          <AppButton @click="close" class="back-btn">Schließen</AppButton>
        </div>

        <!-- Detail: Tipp-Karten, geblättert zu je 3 -->
        <div v-else class="detail">
          <p class="description">{{ active.description }}</p>

          <ul class="tips">
            <li v-for="tip in pages[page]" :key="tip.id" class="tip">
              <span class="material-symbols-outlined tip-icon">{{ tip.icon }}</span>
              <div>
                <h2>{{ tip.heading }}</h2>
                <p>{{ tip.text }}</p>
              </div>
            </li>
          </ul>

          <!-- Hilfe-Block (z.B. Hitzetelefon) auf der letzten Seite -->
          <div v-if="isLastPage && active.help" class="help">
            <h2>{{ active.help.heading }}</h2>
            <a :href="`tel:${active.help.tel}`">{{ active.help.tel }}</a>
            <p>{{ active.help.text }}</p>
          </div>

          <nav v-if="pages.length > 1" class="pager">
            <button :disabled="page === 0" aria-label="Vorherige Seite" @click="page--">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <span class="page-num">{{ page + 1 }} / {{ pages.length }}</span>
            <button :disabled="isLastPage" aria-label="Nächste Seite" @click="page++">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.warnings-sheet {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--safe-top) + var(--sp-lg)) var(--sp-lg) var(--sp-md);
  border-bottom: 1px solid var(--c-primary);

  h1 {
    color: var(--c-accent);
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
  }
}
.back,
.close-x {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--c-primary);
  cursor: pointer;
}
.back {
  left: var(--sp-md);
}
.close-x {
  right: var(--sp-md);
}

/* Liste */
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  overflow-y: auto;
}
.warning-card {
  width: 100%;
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
  text-align: left;
  padding: var(--sp-md);
  background: var(--c-bg);
  border-radius: var(--r-md);
  cursor: pointer;
  font-family: var(--ff-base);
  font-size: var(--fs-sm);
}
.warning-card.sev-high {
  border: 2px solid var(--c-accent);
}
.warning-card.sev-high .sev-icon,
.warning-card.sev-high strong {
  color: var(--c-accent);
}
.warning-card.sev-medium {
  border: 2px solid var(--c-warning);
}
.warning-card.sev-medium .sev-icon,
.warning-card.sev-medium strong {
  color: var(--c-warning);
}
.warning-text {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}
.warning-text .action {
  color: var(--c-accent);
  font-weight: var(--fw-semibold);
  text-decoration: underline;
}
.none {
  text-align: center;
  color: var(--c-text-muted);
  padding: var(--sp-xl);
}

/* Detail ("4@2x") */
.detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
  padding: var(--sp-xl);
  overflow-y: auto;
}
.description {
  font-weight: var(--fw-semibold);
  color: var(--c-accent);
}
.tips {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
}
.tip {
  display: flex;
  gap: var(--sp-lg);
  align-items: flex-start;
}
.tip-icon {
  font-size: 44px;
  color: var(--c-accent);
  flex-shrink: 0;
}
.tip h2 {
  color: var(--c-accent);
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  margin-bottom: var(--sp-xs);
}
.tip p {
  line-height: 1.4;
}

.help {
  border: 2px solid var(--c-accent);
  border-radius: var(--r-md);
  padding: var(--sp-lg);

  h2 {
    color: var(--c-accent);
    font-size: var(--fs-md);
    font-weight: var(--fw-bold);
    margin-bottom: var(--sp-xs);
  }
  a {
    display: inline-block;
    color: var(--c-primary);
    font-weight: var(--fw-bold);
    margin-bottom: var(--sp-xs);
  }
  p {
    font-size: var(--fs-sm);
    line-height: 1.4;
  }
}

/* Pager */
.pager {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--sp-md);

  button {
    border: none;
    background: none;
    color: var(--c-text-muted);
    cursor: pointer;
  }
  button:not(:disabled) {
    color: var(--c-accent);
  }
  button:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .page-num {
    color: var(--c-text-muted);
    font-weight: var(--fw-semibold);
  }
}

.back-btn {
  position: absolute;
  bottom: var(--sp-lg);
  margin: var(--sp-lg);
  width: calc(100% - var(--sp-lg) * 2);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
