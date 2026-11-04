<script setup>
import { ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  visitedIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['save'])
const open = defineModel('open', { type: Boolean, default: false })

const draft = ref([])

watch(
  open,
  (isOpen) => {
    if (isOpen) draft.value = [...props.visitedIds]
  },
  { immediate: true },
)

function saveChanges() {
  emit('save', draft.value)
  open.value = false
}
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="slide-up">
      <div v-if="open" class="edit-sheet">
        <header class="head">
          <h1>Standorte</h1>
          <button class="close-x" aria-label="Schließen" @click="open = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <!-- Liste aller Routenstandorte -->
        <div class="body">
          <p>Möchtest du zu einem anderen Standort navigieren?</p>
          <ul class="list">
            <li v-for="stop in items" :key="stop.id">
              <input type="checkbox" :id="`stop-${stop.id}`" :value="stop.id" v-model="draft" />
              <label :for="`stop-${stop.id}`">
                <p>
                  Standort {{ stop.id }}:&nbsp;<strong>{{ stop.name }}</strong>
                </p>
              </label>
            </li>
          </ul>
          <AppButton @click="saveChanges" class="save-btn">Speichern</AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.edit-sheet {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  background: var(--c-bg-primary);
}

.head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--safe-top) + var(--sp-lg)) var(--sp-lg) var(--sp-md);
  border-bottom: 1px solid var(--c-primary);

  h1 {
    color: var(--c-primary);
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
  }

  .close-x {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    color: var(--c-primary);
    cursor: pointer;
  }
  .close-x {
    right: var(--sp-md);
  }
}

.body {
  margin: var(--sp-lg);

  p {
    font-size: var(--fs-md);
    margin-bottom: var(--sp-md);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: var(--sp-md);
      margin-bottom: var(--sp-sm);

      input[type='checkbox'] {
        width: 20px;
        height: 20px;
        accent-color: var(--c-primary);
      }

      label {
        cursor: pointer;
        flex: 1;
        strong {
          font-size: var(--fs-md);
        }

        p {
          margin: 0;
          font-size: var(--fs-sm);
          color: var(--c-text);
          padding: var(--sp-lg);
          background: var(--c-bg);
          border-radius: var(--r-md);
          display: flex;
          align-items: center;

          width: 100%;
        }
      }
    }
  }
}

.save-btn {
  position: absolute;
  bottom: 0;
  margin-bottom: var(--sp-lg);
  width: calc(100% - var(--sp-lg) * 2);
}
</style>
