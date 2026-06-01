<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('inventory.title') }}</h1>
      <RouterLink :to="`/moves/${requestId}/estimate`" class="btn-primary">
        {{ t('common.next') }}
      </RouterLink>
    </div>

    <div v-if="requestStore.isLoading" class="text-center py-8">{{ t('common.loading') }}</div>

    <div v-else class="space-y-6">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-4">
        <div class="card text-center">
          <p class="text-2xl font-bold text-blue-600">{{ summary.totalItems }}</p>
          <p class="text-sm text-gray-500">{{ t('inventory.totalItems') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-2xl font-bold text-blue-600">{{ summary.totalVolume }} m³</p>
          <p class="text-sm text-gray-500">{{ t('inventory.totalVolume') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-2xl font-bold text-blue-600">{{ summary.totalWeight }} kg</p>
          <p class="text-sm text-gray-500">{{ t('inventory.totalWeight') }}</p>
        </div>
      </div>

      <!-- Add Item -->
      <div class="card">
        <h3 class="font-medium mb-4">{{ t('inventory.addItem') }}</h3>
        <form @submit.prevent="addItem" class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div class="md:col-span-2">
            <input v-model="newItem.name" :placeholder="t('inventory.name')" required class="w-full" />
          </div>
          <div>
            <input v-model.number="newItem.quantity" :placeholder="t('inventory.quantity')" type="number" min="1" required class="w-full" />
          </div>
          <div>
            <input v-model.number="newItem.volume" :placeholder="t('inventory.volume')" type="number" min="0" step="0.1" class="w-full" />
          </div>
          <div>
            <input v-model.number="newItem.weight" :placeholder="t('inventory.weight')" type="number" min="0" step="0.1" class="w-full" />
          </div>
          <button type="submit" class="btn-primary md:col-span-5">
            {{ t('inventory.addItem') }}
          </button>
        </form>
      </div>

      <!-- Items Table -->
      <div class="card overflow-x-auto">
        <table v-if="requestStore.items.length > 0" class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="pb-2 text-sm font-medium text-gray-600">{{ t('inventory.name') }}</th>
              <th class="pb-2 text-sm font-medium text-gray-600">{{ t('inventory.quantity') }}</th>
              <th class="pb-2 text-sm font-medium text-gray-600">{{ t('inventory.volume') }}</th>
              <th class="pb-2 text-sm font-medium text-gray-600">{{ t('inventory.weight') }}</th>
              <th class="pb-2 text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in requestStore.items" :key="item.id" class="border-b border-gray-100">
              <td class="py-3">
                <input
                  v-if="editingId === item.id"
                  v-model="editForm.name"
                  class="w-full text-sm"
                />
                <span v-else>{{ item.name }}</span>
              </td>
              <td class="py-3">
                <input
                  v-if="editingId === item.id"
                  v-model.number="editForm.quantity"
                  type="number"
                  min="1"
                  class="w-20 text-sm"
                />
                <span v-else>{{ item.quantity }}</span>
              </td>
              <td class="py-3 text-sm text-gray-600">{{ item.volume ?? '-' }}</td>
              <td class="py-3 text-sm text-gray-600">{{ item.weight ?? '-' }}</td>
              <td class="py-3">
                <div class="flex gap-2">
                  <button
                    v-if="editingId === item.id"
                    @click="saveEdit(item.id)"
                    class="text-sm text-green-600 hover:underline"
                  >
                    {{ t('common.save') }}
                  </button>
                  <button
                    v-else
                    @click="startEdit(item)"
                    class="text-sm text-blue-600 hover:underline"
                  >
                    {{ t('common.edit') }}
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="text-sm text-red-600 hover:underline"
                  >
                    {{ t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-center text-gray-500 py-8">{{ t('inventory.noItems') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRequestStore } from '@/stores/request'
import type { InventoryItem } from '@/types'

const { t } = useI18n()
const route = useRoute()
const requestStore = useRequestStore()
const requestId = Number(route.params.id)

const newItem = reactive({
  name: '',
  quantity: 1,
  volume: undefined as number | undefined,
  weight: undefined as number | undefined,
})

const editingId = ref<number | null>(null)
const editForm = reactive({
  name: '',
  quantity: 1,
})

const summary = computed(() => {
  const items = requestStore.items
  const totalItems = items.length
  const totalVolume = items.reduce((sum, i) => sum + (i.volume ?? 0) * i.quantity, 0)
  const totalWeight = items.reduce((sum, i) => sum + (i.weight ?? 0) * i.quantity, 0)
  return {
    totalItems,
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalWeight: Math.round(totalWeight * 100) / 100,
  }
})

onMounted(() => {
  requestStore.fetchItems(requestId)
})

async function addItem() {
  await requestStore.addItem(requestId, {
    name: newItem.name,
    quantity: newItem.quantity,
    volume: newItem.volume,
    weight: newItem.weight,
  })
  newItem.name = ''
  newItem.quantity = 1
  newItem.volume = undefined
  newItem.weight = undefined
}

function startEdit(item: InventoryItem) {
  editingId.value = item.id
  editForm.name = item.name
  editForm.quantity = item.quantity
}

async function saveEdit(itemId: number) {
  await requestStore.updateItem(requestId, itemId, {
    name: editForm.name,
    quantity: editForm.quantity,
  })
  editingId.value = null
}

async function deleteItem(itemId: number) {
  if (!confirm(t('common.delete') + '?')) return
  await requestStore.deleteItem(requestId, itemId)
}
</script>
