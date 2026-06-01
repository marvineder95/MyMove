<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRequestStore } from '@/stores/request'
import { requestsApi } from '@/api/requests'
import { autocompleteAddresses, calculateRoute, type GeoapifyAddress } from '@/api/geocoding'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'

const { t } = useI18n()
const router = useRouter()
const requestStore = useRequestStore()

// ─── Wizard State ───
const step = ref(1)
const moveId = ref<number | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const totalSteps = 6

const steps = [
  { num: 1, title: t('wizard.steps.basics.title'), subtitle: t('wizard.steps.basics.subtitle') },
  { num: 2, title: t('wizard.steps.video.title'), subtitle: t('wizard.steps.video.subtitle') },
  { num: 3, title: t('wizard.steps.inventory.title'), subtitle: t('wizard.steps.inventory.subtitle') },
  { num: 4, title: t('wizard.steps.details.title'), subtitle: t('wizard.steps.details.subtitle') },
  { num: 5, title: t('wizard.steps.companies.title'), subtitle: t('wizard.steps.companies.subtitle') },
  { num: 6, title: t('wizard.steps.summary.title'), subtitle: t('wizard.steps.summary.subtitle') },
]

// ─── Step 1: Basics ───
const basics = reactive({
  originStreet: '',
  originHouseNumber: '',
  originZip: '',
  originCity: '',
  originLat: null as number | null,
  originLng: null as number | null,
  destinationStreet: '',
  destinationHouseNumber: '',
  destinationZip: '',
  destinationCity: '',
  destinationLat: null as number | null,
  destinationLng: null as number | null,
  moveDate: '',
  isFlexibleDate: false,
  stops: [] as string[],
})

function addStop() {
  basics.stops.push('')
}
function removeStop(index: number) {
  basics.stops.splice(index, 1)
}

// ─── Date Picker ───
const calendarMonth = ref(new Date())
const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

function formatDateISO(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

  const days: { day: number | null; date: string | null; isCurrentMonth: boolean; isToday?: boolean; isSelected?: boolean; isPast?: boolean }[] = []
  // Empty days before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: null, date: null, isCurrentMonth: false })
  }
  // Days of month
  const todayStr = formatDateISO(new Date())
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = formatDateISO(date)
    days.push({
      day: i,
      date: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: basics.moveDate === dateStr,
      isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
    })
  }
  return days
})

function prevMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1, 1)
}
function nextMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1, 1)
}
function selectCalendarDate(dateStr: string) {
  basics.moveDate = dateStr
}

// ─── Address Autocomplete (Geoapify) ───
const originSuggestions = ref<GeoapifyAddress[]>([])
const destinationSuggestions = ref<GeoapifyAddress[]>([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
let originDebounceTimer: ReturnType<typeof setTimeout> | null = null
let destinationDebounceTimer: ReturnType<typeof setTimeout> | null = null

async function filterOriginAddresses(query: string) {
  if (originDebounceTimer) clearTimeout(originDebounceTimer)
  if (!query || query.length < 2) {
    originSuggestions.value = []
    return
  }
  originDebounceTimer = setTimeout(async () => {
    originSuggestions.value = await autocompleteAddresses(query)
  }, 200)
}

async function filterDestinationAddresses(query: string) {
  if (destinationDebounceTimer) clearTimeout(destinationDebounceTimer)
  if (!query || query.length < 2) {
    destinationSuggestions.value = []
    return
  }
  destinationDebounceTimer = setTimeout(async () => {
    destinationSuggestions.value = await autocompleteAddresses(query)
  }, 200)
}

function selectOriginAddress(suggestion: GeoapifyAddress) {
  basics.originStreet = suggestion.street
  basics.originHouseNumber = suggestion.housenumber || ''
  basics.originZip = suggestion.postcode
  basics.originCity = suggestion.city
  basics.originLat = suggestion.lat
  basics.originLng = suggestion.lon
  showOriginSuggestions.value = false
  originSuggestions.value = []
  autoCalculateDistance()
}

function selectDestinationAddress(suggestion: GeoapifyAddress) {
  basics.destinationStreet = suggestion.street
  basics.destinationHouseNumber = suggestion.housenumber || ''
  basics.destinationZip = suggestion.postcode
  basics.destinationCity = suggestion.city
  basics.destinationLat = suggestion.lat
  basics.destinationLng = suggestion.lon
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  autoCalculateDistance()
}

// ─── Step 2: Video (Simulated) ───
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const detectedItems = ref<string[]>([])
const videoError = ref('')
const analysisComplete = ref(false)

async function runAiAnalysis() {
  if (!moveId.value) return
  isAnalyzing.value = true
  analysisComplete.value = false
  analysisProgress.value = 0
  detectedItems.value = []
  videoError.value = ''

  const items = [
    { name: 'Sofa', quantity: 1, volume: 2.5, weight: 80 },
    { name: 'Doppelbett', quantity: 1, volume: 3.0, weight: 120 },
    { name: 'Kleiderschrank', quantity: 1, volume: 2.8, weight: 110 },
    { name: 'Esstisch', quantity: 1, volume: 1.2, weight: 45 },
    { name: 'Fernseher 55"', quantity: 1, volume: 0.3, weight: 18 },
    { name: 'Bücherregal', quantity: 1, volume: 1.0, weight: 35 },
    { name: 'Waschmaschine', quantity: 1, volume: 0.6, weight: 70 },
    { name: 'Kühlschrank', quantity: 1, volume: 1.5, weight: 85 },
    { name: 'Kommode', quantity: 1, volume: 0.8, weight: 40 },
    { name: 'Schreibtisch', quantity: 1, volume: 0.9, weight: 30 },
  ]

  for (let i = 0; i < items.length; i++) {
    await new Promise((r) => setTimeout(r, 500))
    analysisProgress.value = Math.round(((i + 1) / items.length) * 100)
    detectedItems.value.push(items[i].name)
    if (moveId.value) {
      await requestsApi.addItem(moveId.value, { ...items[i], isAiDetected: true, confidenceScore: 0.85 + Math.random() * 0.14 })
    }
  }

  isAnalyzing.value = false
  analysisComplete.value = true
  if (moveId.value) {
    await requestStore.fetchItems(moveId.value)
  }
}

function skipVideoStep() {
  step.value = 3
}

// ─── Step 3: Inventory ───
const newItem = reactive({ name: '', quantity: 1, volume: undefined as number | undefined, weight: undefined as number | undefined })
const editingItemId = ref<number | null>(null)
const editForm = reactive({ name: '', quantity: 1 })
const itemError = ref('')
const addButtonState = ref<'idle' | 'success' | 'error'>('idle')
let addButtonTimer: ReturnType<typeof setTimeout> | null = null

const inventorySummary = computed(() => {
  const items = requestStore.items
  return {
    totalItems: items.length,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
    totalVolume: Math.round(items.reduce((s, i) => s + (i.volume ?? 0) * i.quantity, 0) * 100) / 100,
    totalWeight: Math.round(items.reduce((s, i) => s + (i.weight ?? 0) * i.quantity, 0) * 100) / 100,
  }
})

async function addItem() {
  if (addButtonTimer) clearTimeout(addButtonTimer)
  itemError.value = ''
  if (!newItem.name.trim()) {
    itemError.value = t('wizard.inventory.nameRequired')
    addButtonState.value = 'error'
    addButtonTimer = setTimeout(() => { addButtonState.value = 'idle' }, 1500)
    return
  }
  if (!newItem.quantity || newItem.quantity < 1 || !Number.isFinite(newItem.quantity)) {
    itemError.value = t('wizard.inventory.quantityRequired')
    addButtonState.value = 'error'
    addButtonTimer = setTimeout(() => { addButtonState.value = 'idle' }, 1500)
    return
  }
  if (!moveId.value) return
  const result = await requestStore.addItem(moveId.value, {
    name: newItem.name.trim(),
    quantity: Number(newItem.quantity),
    volume: newItem.volume ? Number(newItem.volume) : undefined,
    weight: newItem.weight ? Number(newItem.weight) : undefined,
  })
  if (result) {
    addButtonState.value = 'success'
    addButtonTimer = setTimeout(() => { addButtonState.value = 'idle' }, 1500)
    newItem.name = ''
    newItem.quantity = 1
    newItem.volume = undefined
    newItem.weight = undefined
  } else {
    addButtonState.value = 'error'
    addButtonTimer = setTimeout(() => { addButtonState.value = 'idle' }, 1500)
  }
}

function startEdit(item: { id: number; name: string; quantity: number }) {
  editingItemId.value = item.id
  editForm.name = item.name
  editForm.quantity = item.quantity
}

async function saveEdit(itemId: number) {
  if (!moveId.value) return
  await requestStore.updateItem(moveId.value, itemId, { name: editForm.name, quantity: editForm.quantity })
  editingItemId.value = null
}

async function deleteItem(itemId: number) {
  if (!moveId.value) return
  await requestStore.deleteItem(moveId.value, itemId)
}

// ─── Step 4: Details ───
const details = reactive({
  floorsOrigin: 0,
  floorsDestination: 0,
  elevatorOrigin: false,
  elevatorDestination: false,
  apartmentSize: undefined as number | undefined,
  assemblyRequired: false,
  boxRental: false,
  boxCount: 20,
  parkingDistance: undefined as number | undefined,
  noParkingZoneRequired: false,
  additionalInsurance: false,
  materials: [
    { id: 'tape', quantity: 0, selected: false },
    { id: 'wrap', quantity: 0, selected: false },
    { id: 'mattressCover', quantity: 0, selected: false },
    { id: 'blanket', quantity: 0, selected: false },
    { id: 'wardrobeBox', quantity: 0, selected: false },
  ] as { id: string; quantity: number; selected: boolean }[],
})

const materialsExpanded = ref(false)
const showParkingTooltip = ref(false)

// Parking distance input (compact inline)

// Computed: recommended box count based on inventory
const recommendedBoxCount = computed(() => {
  const itemCount = requestStore.items.reduce((s, i) => s + i.quantity, 0)
  return Math.max(10, Math.round(itemCount * 2.5))
})

// Computed: selected materials list
const selectedMaterials = computed(() => {
  return details.materials.filter((m) => m.selected)
})

// Computed: total material price
function onMaterialToggle(mat: { id: string; quantity: number; selected: boolean }) {
  if (mat.selected && mat.quantity === 0) mat.quantity = 1
}

const materialPrices: Record<string, number> = { tape: 2.9, wrap: 7.9, mattressCover: 5.8, blanket: 12.9, wardrobeBox: 14.9 }
const selectedMaterialsTotal = computed(() => {
  return selectedMaterials.value.reduce((sum, m) => sum + (materialPrices[m.id] || 0) * m.quantity, 0)
})

// ─── Step 5: Companies ───
const distanceKm = ref(10)
const selectedCompanyId = ref<number | null>(null)

// Auto-calculate distance when both coordinates are known
async function autoCalculateDistance() {
  if (basics.originLat && basics.originLng && basics.destinationLat && basics.destinationLng) {
    const route = await calculateRoute(
      { lat: basics.originLat, lon: basics.originLng },
      { lat: basics.destinationLat, lon: basics.destinationLng },
    )
    if (route) {
      distanceKm.value = Math.round(route.distanceMeters / 1000)
    }
  }
}

const estimates = computed(() => requestStore.estimate?.estimates || [])

async function loadCompanies() {
  if (!moveId.value) return
  isLoading.value = true
  error.value = null
  hasSearched.value = true
  try {
    const result = await requestStore.fetchEstimate(moveId.value, distanceKm.value)
    if (!result) {
      throw new Error(requestStore.error || 'Failed to load companies')
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = e.response?.data?.message || e.message || 'Failed to load companies'
  } finally {
    isLoading.value = false
  }
}

// Track whether a search has been performed on step 5
const hasSearched = ref(false)

// Auto-load companies when entering step 5
watch(step, async (newStep) => {
  if (newStep === 5 && moveId.value && estimates.value.length === 0 && !isLoading.value && !hasSearched.value) {
    await loadCompanies()
  }
})

function selectCompany(companyId: number) {
  selectedCompanyId.value = companyId
}

// ─── Step 6: Summary ───
const selectedCompany = computed(() => {
  return estimates.value.find((e) => e.companyId === selectedCompanyId.value)
})

async function sendRequest() {
  if (!moveId.value) return
  isLoading.value = true
  error.value = null
  try {
    await requestsApi.updateStatus(moveId.value, 'SENT_TO_COMPANIES', selectedCompanyId.value || undefined)
    success.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 2500)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message || t('wizard.summary.sendError')
  } finally {
    isLoading.value = false
  }
}

// ─── Navigation ───
const canGoNext = computed(() => {
  switch (step.value) {
    case 1:
      return basics.originStreet.length >= 3 && basics.originZip.length >= 4 && basics.originCity.length >= 2 &&
             basics.destinationStreet.length >= 3 && basics.destinationZip.length >= 4 && basics.destinationCity.length >= 2 &&
             basics.moveDate
    case 2:
      return !isAnalyzing.value && (analysisComplete.value || requestStore.items.length > 0)
    case 3:
      return true
    case 4:
      return true
    case 5:
      return selectedCompanyId.value !== null
    case 6:
      return true
    default:
      return false
  }
})

async function nextStep() {
  error.value = null

  if (step.value === 1) {
    // Reset company selection for new move
    selectedCompanyId.value = null
    requestStore.clearEstimate()
    hasSearched.value = false
    isLoading.value = true
    const move = await requestStore.createRequest({
      originAddress: `${basics.originStreet} ${basics.originHouseNumber}, ${basics.originZip} ${basics.originCity}`,
      destinationAddress: `${basics.destinationStreet} ${basics.destinationHouseNumber}, ${basics.destinationZip} ${basics.destinationCity}`,
      moveDate: basics.moveDate,
      extras: {
        assemblyRequired: false,
        boxesNeeded: false,
        noParkingZoneRequired: false,
        isFlexibleDate: basics.isFlexibleDate,
      },
    })
    isLoading.value = false
    if (!move) {
      error.value = t('wizard.basics.createError')
      return
    }
    moveId.value = move.id
  }

  if (step.value === 4 && moveId.value) {
    isLoading.value = true
    try {
      await requestsApi.update(moveId.value, {
        floorsOrigin: details.floorsOrigin,
        floorsDestination: details.floorsDestination,
        parkingDistance: details.parkingDistance,
        extras: {
          assemblyRequired: details.assemblyRequired,
          boxesNeeded: details.boxRental,
          noParkingZoneRequired: details.noParkingZoneRequired,
          isFlexibleDate: basics.isFlexibleDate,
          elevatorOrigin: details.elevatorOrigin,
          elevatorDestination: details.elevatorDestination,
          apartmentSize: details.apartmentSize,
          boxCount: details.boxRental ? details.boxCount : undefined,
          additionalInsurance: details.additionalInsurance,
          materials: details.materials.filter((m) => m.selected).map((m) => ({ id: m.id, quantity: m.quantity, selected: m.selected })),
        },
      })
      await loadCompanies()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || t('wizard.details.saveError')
      isLoading.value = false
      return
    }
    isLoading.value = false
  }

  if (step.value < totalSteps) {
    step.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ─── Icons ───
function MapPinIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    h('circle', { cx: '12', cy: '10', r: '3' }),
  ])
}
function CalendarIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
  ])
}
function PlusIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
    h('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
  ])
}
function TrashIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M3 6h18' }),
    h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
    h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
  ])
}
function EditIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }),
  ])
}
function CheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '20 6 9 17 4 12' }),
  ])
}
function SparklesIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
    h('path', { d: 'M5 3v4' }),
    h('path', { d: 'M9 5H5' }),
    h('path', { d: 'M19 18v4' }),
    h('path', { d: 'M19 18h4' }),
  ])
}
function BuildingIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 10h.01' }),
    h('path', { d: 'M12 14h.01' }),
    h('path', { d: 'M12 6h.01' }),
    h('path', { d: 'M16 10h.01' }),
    h('path', { d: 'M16 14h.01' }),
    h('path', { d: 'M16 6h.01' }),
    h('path', { d: 'M8 10h.01' }),
    h('path', { d: 'M8 14h.01' }),
    h('path', { d: 'M8 6h.01' }),
    h('path', { d: 'M9 22v-3h6v3' }),
    h('path', { d: 'M8 22h8' }),
    h('rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2' }),
  ])
}
function ArrowRightIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M5 12h14' }),
    h('path', { d: 'm12 5 7 7-7 7' }),
  ])
}
function ArrowLeftIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm12 19-7-7 7-7' }),
    h('path', { d: 'M19 12H5' }),
  ])
}
function StarIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'none', class: props.class }, [
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
  ])
}
function InfoIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M12 16v-4' }),
    h('path', { d: 'M12 8h.01' }),
  ])
}
function SendIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm22 2-7 20-4-9-9-4 20-7z' }),
    h('path', { d: 'M22 2 11 13' }),
  ])
}
function PackageIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm7.5 4.27 9 5.15' }),
    h('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
    h('path', { d: 'm3.3 7 8.7 5 8.7-5' }),
    h('path', { d: 'M12 22V12' }),
  ])
}
function WrenchIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' }),
  ])
}
function ShieldIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  ])
}
function ChevronDownIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm6 9 6 6 6-6' }),
  ])
}
function ChevronUpIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm18 15-6-6-6 6' }),
  ])
}
function ScrollIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v14a2 2 0 0 0 2 2z' }),
  ])
}
function LayersIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' }),
    h('path', { d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' }),
    h('path', { d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' }),
  ])
}
function BedIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M2 4v16' }),
    h('path', { d: 'M2 8h18a2 2 0 0 1 2 2v10' }),
    h('path', { d: 'M2 17h20' }),
    h('path', { d: 'M6 8v9' }),
  ])
}
</script>

<template>
  <CustomerLayout>
    <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
      <!-- Progress Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-5xl mx-auto px-4 py-4">
          <!-- Step indicators -->
          <div class="hidden md:flex items-center justify-between">
            <div
              v-for="(s, idx) in steps"
              :key="s.num"
              class="flex items-center flex-1"
              :class="{ 'flex-1': idx < steps.length - 1 }"
            >
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    step > s.num ? 'bg-green-500 text-white' :
                    step === s.num ? 'bg-primary-600 text-white' :
                    'bg-gray-100 text-gray-400'
                  ]"
                >
                  <CheckIcon v-if="step > s.num" class="w-5 h-5" />
                  <span v-else>{{ s.num }}</span>
                </div>
                <span
                  :class="[
                    'text-xs mt-1.5 font-medium',
                    step >= s.num ? 'text-gray-900' : 'text-gray-400'
                  ]"
                >
                  {{ s.title }}
                </span>
              </div>
              <div
                v-if="idx < steps.length - 1"
                :class="[
                  'h-0.5 flex-1 mx-3 transition-colors',
                  step > s.num ? 'bg-green-500' : 'bg-gray-200'
                ]"
              />
            </div>
          </div>

          <!-- Mobile: current step only -->
          <div class="md:hidden flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
              {{ step }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ steps[step - 1].title }}</p>
              <p class="text-xs text-gray-500">{{ t('wizard.stepOf', { step, total: totalSteps }) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-3xl mx-auto px-4 py-8 pb-32">
        <!-- Error -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {{ error }}
        </div>

        <!-- Success Modal -->
        <div v-if="success" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in fade-in zoom-in duration-300">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon class="w-8 h-8 text-green-600" />
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('wizard.summary.successTitle') }}</h2>
            <p class="text-gray-500 mb-6">{{ t('wizard.summary.successMessage') }}</p>
            <div class="flex flex-col gap-3">
              <button
                @click="router.push('/dashboard')"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                {{ t('wizard.summary.toDashboard') }}
                <ArrowRightIcon class="w-4 h-4" />
              </button>
              <p class="text-xs text-gray-400">
                {{ t('wizard.summary.autoRedirect') }}
              </p>
            </div>
          </div>
        </div>

        <!-- ─── STEP 1: BASICS ─── -->
        <div v-if="step === 1" class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.basics.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.basics.subtitle') }}</p>
          </div>

          <!-- Origin -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPinIcon class="w-4 h-4 text-primary-600" />
              {{ t('wizard.basics.origin') }}
            </label>
            <div class="relative">
              <input
                v-model="basics.originStreet"
                type="text"
                :placeholder="t('wizard.basics.streetPlaceholder')"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
                @input="filterOriginAddresses(basics.originStreet); showOriginSuggestions = true"
                @focus="filterOriginAddresses(basics.originStreet); showOriginSuggestions = true"
                @keydown.esc="showOriginSuggestions = false"
              />
              <div
                v-if="showOriginSuggestions && originSuggestions.length > 0"
                class="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto"
              >
                <button
                  v-for="s in originSuggestions"
                  :key="s.formatted"
                  @mousedown.prevent="selectOriginAddress(s)"
                  class="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p class="text-sm font-medium text-gray-900">{{ s.formatted }}</p>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <input
                v-model="basics.originHouseNumber"
                type="text"
                :placeholder="t('wizard.basics.houseNumberPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
              <input
                v-model="basics.originZip"
                type="text"
                :placeholder="t('wizard.basics.zipPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
              <input
                v-model="basics.originCity"
                type="text"
                :placeholder="t('wizard.basics.cityPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
            </div>
          </div>

          <!-- Destination -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPinIcon class="w-4 h-4 text-green-600" />
              {{ t('wizard.basics.destination') }}
            </label>
            <div class="relative">
              <input
                v-model="basics.destinationStreet"
                type="text"
                :placeholder="t('wizard.basics.streetPlaceholder')"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
                @input="filterDestinationAddresses(basics.destinationStreet); showDestinationSuggestions = true"
                @focus="filterDestinationAddresses(basics.destinationStreet); showDestinationSuggestions = true"
                @keydown.esc="showDestinationSuggestions = false"
              />
              <div
                v-if="showDestinationSuggestions && destinationSuggestions.length > 0"
                class="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto"
              >
                <button
                  v-for="s in destinationSuggestions"
                  :key="s.formatted"
                  @mousedown.prevent="selectDestinationAddress(s)"
                  class="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p class="text-sm font-medium text-gray-900">{{ s.formatted }}</p>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <input
                v-model="basics.destinationHouseNumber"
                type="text"
                :placeholder="t('wizard.basics.houseNumberPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
              <input
                v-model="basics.destinationZip"
                type="text"
                :placeholder="t('wizard.basics.zipPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
              <input
                v-model="basics.destinationCity"
                type="text"
                :placeholder="t('wizard.basics.cityPlaceholder')"
                class="col-span-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
              />
            </div>
          </div>

          <!-- Stops -->
          <div v-for="(_stop, idx) in basics.stops" :key="idx" class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPinIcon class="w-4 h-4 text-amber-500" />
                {{ t('wizard.basics.stop') }} {{ idx + 1 }}
              </label>
              <button @click="removeStop(idx)" class="text-sm text-red-600 hover:text-red-700">
                {{ t('common.delete') }}
              </button>
            </div>
            <input
              v-model="basics.stops[idx]"
              type="text"
              :placeholder="t('wizard.basics.addressPlaceholder')"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-base"
            />
          </div>

          <button
            @click="addStop"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            <PlusIcon class="w-4 h-4" />
            {{ t('wizard.basics.addStop') }}
          </button>

          <!-- Move Date -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CalendarIcon class="w-4 h-4 text-primary-600" />
              {{ t('wizard.basics.moveDate') }}
            </label>

            <!-- Custom Calendar -->
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <button @click="prevMonth" class="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeftIcon class="w-4 h-4" />
                </button>
                <span class="text-sm font-semibold text-gray-900">
                  {{ monthNames[calendarMonth.getMonth()] }} {{ calendarMonth.getFullYear() }}
                </span>
                <button @click="nextMonth" class="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowRightIcon class="w-4 h-4" />
                </button>
              </div>

              <!-- Weekdays -->
              <div class="grid grid-cols-7 border-b border-gray-100">
                <div v-for="wd in weekDays" :key="wd" class="py-2 text-center text-xs font-medium text-gray-500">
                  {{ wd }}
                </div>
              </div>

              <!-- Days -->
              <div class="grid grid-cols-7">
                <button
                  v-for="(cell, idx) in calendarDays"
                  :key="idx"
                  @click="cell.date && !cell.isPast && selectCalendarDate(cell.date)"
                  :disabled="!cell.isCurrentMonth || cell.isPast"
                  :class="[
                    'h-10 text-sm flex items-center justify-center transition-colors rounded-full mx-auto my-0.5 w-10',
                    !cell.isCurrentMonth ? 'invisible' : '',
                    cell.isPast ? 'text-gray-300 cursor-not-allowed' : '',
                    cell.isSelected ? 'bg-primary-600 text-white font-semibold' :
                    cell.isToday ? 'bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-200' :
                    cell.isCurrentMonth && !cell.isPast ? 'text-gray-700 hover:bg-gray-100' : ''
                  ]"
                >
                  {{ cell.day }}
                </button>
              </div>
            </div>

            <!-- Selected date + flexible checkbox -->
            <div class="flex items-center justify-between gap-4">
              <div v-if="basics.moveDate" class="flex items-center gap-2 text-sm">
                <CalendarIcon class="w-4 h-4 text-primary-600" />
                <span class="font-medium text-gray-900">{{ new Date(basics.moveDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) }}</span>
              </div>
              <div v-else class="text-sm text-gray-400">{{ t('wizard.basics.moveDate') }} auswählen</div>

              <label class="flex items-center gap-2 cursor-pointer select-none shrink-0">
                <input
                  v-model="basics.isFlexibleDate"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-gray-600">{{ t('wizard.basics.flexibleDate') }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- ─── STEP 2: VIDEO (Simulated) ─── -->
        <div v-if="step === 2" class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.video.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.video.subtitle') }}</p>
          </div>

          <!-- Demo Video Preview -->
          <div v-if="!isAnalyzing && !analysisComplete" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="aspect-video bg-gray-900 relative flex items-center justify-center">
              <!-- Simulated video frame -->
              <div class="absolute inset-0 opacity-20" style="background: repeating-linear-gradient(45deg, #374151, #374151 10px, #4b5563 10px, #4b5563 20px);"></div>
              <div class="relative z-10 text-center">
                <div class="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <p class="text-white font-medium text-lg">{{ t('wizard.video.demoTitle') }}</p>
                <p class="text-white/60 text-sm mt-1">{{ t('wizard.video.demoSubtitle') }}</p>
              </div>
              <!-- Duration badge -->
              <div class="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                0:42
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                  <SparklesIcon class="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ t('wizard.video.aiInfoTitle') }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ t('wizard.video.aiInfoText') }}</p>
                </div>
              </div>
              <button
                @click="runAiAnalysis"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <SparklesIcon class="w-4 h-4" />
                {{ t('wizard.video.startAnalysis') }}
              </button>
              <button
                @click="skipVideoStep"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                {{ t('wizard.video.skip') }}
              </button>
            </div>
          </div>

          <!-- AI Analysis in progress -->
          <div v-if="isAnalyzing" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div class="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <SparklesIcon class="w-8 h-8 text-primary-600" />
            </div>
            <p class="text-lg font-semibold text-gray-900 mb-2">{{ t('wizard.video.analyzing') }}</p>
            <p class="text-sm text-gray-500 mb-6">{{ t('wizard.video.analyzingSubtitle') }}</p>

            <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div class="bg-primary-600 h-2 rounded-full transition-all" :style="{ width: analysisProgress + '%' }" />
            </div>

            <div class="flex flex-wrap justify-center gap-2">
              <span
                v-for="item in detectedItems"
                :key="item"
                class="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full animate-[fadeIn_0.3s_ease-out]"
              >
                <CheckIcon class="w-3.5 h-3.5" />
                {{ item }}
              </span>
            </div>
          </div>

          <!-- Analysis Complete -->
          <div v-if="analysisComplete" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <CheckIcon class="w-6 h-6 text-green-600" />
              </div>
              <p class="text-lg font-semibold text-gray-900">{{ t('wizard.video.analysisComplete') }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ t('wizard.video.detectedCount', { count: detectedItems.length }) }}</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div
                v-for="item in detectedItems"
                :key="item"
                class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
              >
                <CheckIcon class="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span class="text-sm text-gray-700">{{ item }}</span>
              </div>
            </div>

            <div class="bg-primary-50 rounded-lg p-4 text-sm text-primary-800">
              <p class="font-medium">{{ t('wizard.video.nextStepHint') }}</p>
              <p class="text-primary-600 text-xs mt-1">{{ t('wizard.video.nextStepSubHint') }}</p>
            </div>
          </div>

          <p v-if="videoError" class="text-sm text-red-600">{{ videoError }}</p>
        </div>

        <!-- ─── STEP 3: INVENTORY ─── -->
        <div v-if="step === 3" class="space-y-5">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.inventory.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.inventory.subtitle') }}</p>
          </div>

          <!-- Summary Bar -->
          <div class="flex items-center justify-center gap-8 text-sm text-gray-500 py-2">
            <span class="flex items-center gap-1.5">
              <span class="font-semibold text-gray-700">{{ inventorySummary.totalQuantity }}</span>
              {{ t('wizard.inventory.itemsLabel') }}
            </span>
            <span class="w-px h-4 bg-gray-200"></span>
            <span v-if="inventorySummary.totalVolume" class="flex items-center gap-1">
              <span class="font-semibold text-gray-700">{{ inventorySummary.totalVolume }}</span>
              m³
            </span>
            <span v-if="inventorySummary.totalVolume && inventorySummary.totalWeight" class="w-px h-4 bg-gray-200"></span>
            <span v-if="inventorySummary.totalWeight" class="flex items-center gap-1">
              <span class="font-semibold text-gray-700">{{ inventorySummary.totalWeight }}</span>
              kg
            </span>
          </div>

          <!-- Add Item Form (compact, modern) -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm font-semibold text-gray-900 mb-3">{{ t('wizard.inventory.addItem') }}</p>
            <!-- Row 1: Item + Quantity + Add button -->
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="newItem.name"
                :placeholder="t('wizard.inventory.itemPlaceholder')"
                class="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-gray-50/50"
                @keydown.enter="addItem"
              />
              <input
                v-model.number="newItem.quantity"
                type="number"
                min="1"
                inputmode="numeric"
                pattern="[0-9]*"
                :placeholder="t('wizard.inventory.quantityPlaceholder')"
                class="w-full sm:w-24 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-gray-50/50 no-spinner"
                @keydown.enter="addItem"
              />
              <button
                @click="addItem"
                :disabled="addButtonState !== 'idle'"
                :class="[
                  'shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200',
                  addButtonState === 'success'
                    ? 'bg-green-600'
                    : addButtonState === 'error'
                      ? 'bg-red-600'
                      : 'bg-primary-600 hover:bg-primary-700',
                ]"
              >
                <template v-if="addButtonState === 'success'">
                  <CheckIcon class="w-4 h-4" />
                  <span class="hidden sm:inline">{{ t('wizard.inventory.added') }}</span>
                </template>
                <template v-else-if="addButtonState === 'error'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  <span class="hidden sm:inline">{{ t('wizard.inventory.error') }}</span>
                </template>
                <template v-else>
                  <PlusIcon class="w-4 h-4" />
                  <span class="hidden sm:inline">{{ t('wizard.inventory.addShort') }}</span>
                  <span class="sm:hidden">{{ t('wizard.inventory.addItem') }}</span>
                </template>
              </button>
            </div>
            <!-- Row 2: Estimates -->
            <div class="flex flex-col sm:flex-row gap-2 mt-2">
              <div class="flex-1 relative">
                <input
                  v-model.number="newItem.volume"
                  type="number"
                  step="0.1"
                  inputmode="decimal"
                  :placeholder="t('wizard.inventory.volumeEstimate')"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-gray-50/50 no-spinner"
                  @keydown.enter="addItem"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 pointer-events-none">m³</span>
              </div>
              <div class="flex-1 relative">
                <input
                  v-model.number="newItem.weight"
                  type="number"
                  step="0.1"
                  inputmode="decimal"
                  :placeholder="t('wizard.inventory.weightEstimate')"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-gray-50/50 no-spinner"
                  @keydown.enter="addItem"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 pointer-events-none">kg</span>
              </div>
              <div class="hidden sm:block sm:w-[88px] shrink-0"></div>
            </div>
            <p v-if="itemError" class="mt-2 text-xs text-red-600">{{ itemError }}</p>
          </div>

          <!-- Items List -->
          <div v-if="requestStore.items.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="divide-y divide-gray-100">
              <div
                v-for="item in requestStore.items"
                :key="item.id"
                class="p-3.5 flex items-center gap-3"
              >
                <div class="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <PackageIcon class="w-4 h-4 text-gray-400" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <span v-if="item.isAiDetected" class="inline-flex items-center text-amber-500" title="KI-erkannt">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 18v4"/><path d="M19 18h4"/></svg>
                    </span>
                  </div>
                  <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{{ item.quantity }}x</span>
                    <span v-if="item.volume">{{ item.volume }} m³</span>
                    <span v-if="item.weight">{{ item.weight }} kg</span>
                  </div>
                </div>

                <div class="flex items-center gap-0.5">
                  <button
                    v-if="editingItemId === item.id"
                    @click="saveEdit(item.id)"
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-else
                    @click="startEdit(item)"
                    class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <EditIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p class="text-gray-500">{{ t('wizard.inventory.empty') }}</p>
          </div>
        </div>

        <!-- ─── STEP 4: DETAILS ─── -->
        <div v-if="step === 4">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.details.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.details.subtitle') }}</p>
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- LEFT COLUMN -->
            <div class="flex-1 space-y-5">

              <!-- Floors & Elevator (compact) -->
              <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 class="text-sm font-semibold text-gray-900">{{ t('wizard.details.floors') }}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-xs text-gray-500">{{ t('wizard.details.originFloor') }}</label>
                    <input v-model.number="details.floorsOrigin" type="number" min="0" max="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm no-spinner" />
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="details.elevatorOrigin" type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                      <span class="text-xs text-gray-600">{{ t('wizard.details.elevatorOrigin') }}</span>
                    </label>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-xs text-gray-500">{{ t('wizard.details.destinationFloor') }}</label>
                    <input v-model.number="details.floorsDestination" type="number" min="0" max="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm no-spinner" />
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="details.elevatorDestination" type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                      <span class="text-xs text-gray-600">{{ t('wizard.details.elevatorDestination') }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Important Services -->
              <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 class="text-sm font-semibold text-gray-900">{{ t('wizard.details.importantServices') }}</h3>

                <!-- Assembly -->
                <div class="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <WrenchIcon class="w-5 h-5 text-primary-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">{{ t('wizard.details.assemblyLabel') }}</p>
                    <p class="text-xs text-gray-500">{{ t('wizard.details.assemblySub') }}</p>
                  </div>
                  <button
                    @click="details.assemblyRequired = !details.assemblyRequired"
                    :class="[
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                      details.assemblyRequired ? 'bg-primary-600' : 'bg-gray-200',
                    ]"
                  >
                    <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition', details.assemblyRequired ? 'translate-x-5' : 'translate-x-0']" />
                  </button>
                </div>

                <!-- Boxes -->
                <div class="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden">
                  <div class="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors">
                    <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <PackageIcon class="w-5 h-5 text-primary-600" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900">{{ t('wizard.details.boxRentalLabel') }}</p>
                      <p class="text-xs text-gray-500">{{ t('wizard.details.boxRentalSub') }}</p>
                    </div>
                    <button
                      @click="details.boxRental = !details.boxRental"
                      :class="[
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                        details.boxRental ? 'bg-primary-600' : 'bg-gray-200',
                      ]"
                    >
                      <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition', details.boxRental ? 'translate-x-5' : 'translate-x-0']" />
                    </button>
                  </div>
                  <!-- Box count expanded -->
                  <div v-if="details.boxRental" class="px-3 pb-3 pt-1 border-t border-gray-100">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">{{ t('wizard.details.boxCountLabel') }}</span>
                        <button @click="details.boxCount = Math.max(1, details.boxCount - 1)" class="w-7 h-7 rounded-md border border-gray-300 text-gray-600 hover:bg-white flex items-center justify-center text-xs font-bold">−</button>
                        <input v-model.number="details.boxCount" type="number" min="1" class="w-14 px-1 py-1 border border-gray-300 rounded-md text-center text-sm outline-none no-spinner" />
                        <button @click="details.boxCount = details.boxCount + 1" class="w-7 h-7 rounded-md border border-gray-300 text-gray-600 hover:bg-white flex items-center justify-center text-xs font-bold">+</button>
                        <span class="text-xs text-gray-500">{{ t('wizard.details.boxCountUnit') }}</span>
                      </div>
                      <div class="flex-1 bg-primary-50 rounded-lg px-3 py-2 text-xs text-primary-800">
                        <p class="font-medium">{{ t('wizard.details.boxRecommendation', { count: recommendedBoxCount }) }}</p>
                        <p class="text-primary-600/70">{{ t('wizard.details.boxBasedOnInventory') }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Insurance -->
                <div class="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <ShieldIcon class="w-5 h-5 text-primary-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">{{ t('wizard.details.insuranceLabel') }}</p>
                    <p class="text-xs text-gray-500">{{ t('wizard.details.insuranceSub') }}</p>
                  </div>
                  <button
                    @click="details.additionalInsurance = !details.additionalInsurance"
                    :class="[
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                      details.additionalInsurance ? 'bg-primary-600' : 'bg-gray-200',
                    ]"
                  >
                    <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition', details.additionalInsurance ? 'translate-x-5' : 'translate-x-0']" />
                  </button>
                </div>
              </div>

              <!-- Parking distance (compact) -->
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-sm font-semibold text-gray-900">{{ t('wizard.details.parking') }}</h3>
                  <div class="relative">
                    <button @mouseenter="showParkingTooltip = true" @mouseleave="showParkingTooltip = false" class="text-gray-400 hover:text-gray-600">
                      <InfoIcon class="w-4 h-4" />
                    </button>
                    <div
                      v-if="showParkingTooltip"
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10"
                    >
                      {{ t('wizard.details.parkingTooltip') }}
                      <div class="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                </div>
                <input
                  v-model.number="details.parkingDistance"
                  type="number"
                  min="0"
                  :placeholder="t('wizard.details.parkingPlaceholder')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm no-spinner"
                />
              </div>

              <!-- Additional Materials (accordion) -->
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  @click="materialsExpanded = !materialsExpanded"
                  class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 class="text-sm font-semibold text-gray-900">{{ t('wizard.details.materials') }}</h3>
                  <div class="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>{{ materialsExpanded ? t('wizard.details.showLess') : t('wizard.details.showMore') }}</span>
                    <ChevronUpIcon v-if="materialsExpanded" class="w-4 h-4" />
                    <ChevronDownIcon v-else class="w-4 h-4" />
                  </div>
                </button>

                <div v-if="materialsExpanded" class="border-t border-gray-100">
                  <div
                    v-for="(mat, idx) in details.materials"
                    :key="mat.id"
                    class="flex items-center gap-3 px-5 py-3"
                    :class="idx < details.materials.length - 1 ? 'border-b border-gray-50' : ''"
                  >
                    <input
                      v-model="mat.selected"
                      type="checkbox"
                      class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 shrink-0"
                      @change="onMaterialToggle(mat)"
                    />
                    <div class="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <PackageIcon v-if="mat.id === 'tape'" class="w-4 h-4 text-gray-500" />
                      <ScrollIcon v-else-if="mat.id === 'wrap'" class="w-4 h-4 text-gray-500" />
                      <BedIcon v-else-if="mat.id === 'mattressCover'" class="w-4 h-4 text-gray-500" />
                      <LayersIcon v-else-if="mat.id === 'blanket'" class="w-4 h-4 text-gray-500" />
                      <PackageIcon v-else class="w-4 h-4 text-gray-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">{{ t(`wizard.details.materialItems.${mat.id}.name`) }}</p>
                      <p class="text-xs text-gray-500">{{ t(`wizard.details.materialItems.${mat.id}.unit`) }}</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button @click="mat.quantity = Math.max(0, mat.quantity - 1)" class="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-xs">−</button>
                      <span class="w-6 text-center text-sm">{{ mat.quantity }}</span>
                      <button @click="mat.quantity = mat.quantity + 1" class="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-xs">+</button>
                    </div>
                    <div class="w-16 text-right text-sm font-medium text-gray-900 shrink-0">
                      {{ t(`wizard.details.materialItems.${mat.id}.price`) }} €
                    </div>
                  </div>
                </div>
              </div>

              <!-- Price note -->
              <div class="flex items-start gap-2 text-xs text-gray-400 px-1">
                <InfoIcon class="w-4 h-4 shrink-0 mt-0.5" />
                <p>{{ t('wizard.details.priceNote') }}</p>
              </div>
            </div>

            <!-- RIGHT SIDEBAR -->
            <div class="w-full lg:w-80 shrink-0 space-y-4">
              <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                <h3 class="text-base font-bold text-gray-900">{{ t('wizard.details.sidebar.title') }}</h3>

                <!-- Addresses -->
                <div class="space-y-3">
                  <div class="flex items-start gap-2.5">
                    <div class="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                    <div>
                      <p class="text-xs text-gray-500">{{ t('wizard.details.sidebar.from') }}</p>
                      <p class="text-sm font-medium text-gray-900">{{ basics.originStreet }} {{ basics.originHouseNumber }}</p>
                      <p class="text-xs text-gray-500">{{ basics.originZip }} {{ basics.originCity }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <div class="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <div>
                      <p class="text-xs text-gray-500">{{ t('wizard.details.sidebar.to') }}</p>
                      <p class="text-sm font-medium text-gray-900">{{ basics.destinationStreet }} {{ basics.destinationHouseNumber }}</p>
                      <p class="text-xs text-gray-500">{{ basics.destinationZip }} {{ basics.destinationCity }}</p>
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-100 pt-4 space-y-3">
                  <!-- Move Date -->
                  <div class="flex items-start gap-2.5">
                    <CalendarIcon class="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p class="text-xs text-gray-500">{{ t('wizard.details.sidebar.moveDate') }}</p>
                      <p class="text-sm font-medium text-gray-900">{{ basics.moveDate }}</p>
                    </div>
                  </div>
                  <!-- Inventory -->
                  <div class="flex items-start gap-2.5">
                    <PackageIcon class="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p class="text-xs text-gray-500">{{ t('wizard.details.sidebar.inventory') }}</p>
                      <p class="text-sm font-medium text-gray-900">{{ t('wizard.details.sidebar.itemsCount', { count: inventorySummary.totalQuantity }) }}</p>
                      <p v-if="inventorySummary.totalVolume || inventorySummary.totalWeight" class="text-xs text-gray-500">
                        {{ t('wizard.details.sidebar.volumeWeight', { volume: inventorySummary.totalVolume, weight: inventorySummary.totalWeight }) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Selected Services -->
                <div class="border-t border-gray-100 pt-4">
                  <p class="text-xs font-semibold text-gray-900 mb-2">{{ t('wizard.details.sidebar.selectedServices') }}</p>
                  <div class="space-y-2">
                    <div v-if="details.assemblyRequired" class="flex items-center gap-2 text-sm text-gray-700">
                      <CheckIcon class="w-4 h-4 text-green-600 shrink-0" />
                      {{ t('wizard.details.sidebar.assembly') }}
                    </div>
                    <div v-if="details.boxRental" class="flex items-center gap-2 text-sm text-gray-700">
                      <CheckIcon class="w-4 h-4 text-green-600 shrink-0" />
                      {{ t('wizard.details.sidebar.boxesSelected', { count: details.boxCount }) }}
                    </div>
                    <div v-if="details.additionalInsurance" class="flex items-center gap-2 text-sm text-gray-700">
                      <CheckIcon class="w-4 h-4 text-green-600 shrink-0" />
                      {{ t('wizard.details.sidebar.additionalInsurance') }}
                    </div>
                    <div v-if="selectedMaterials.length > 0" class="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                      <span class="text-gray-500">{{ t('wizard.details.materials') }}</span>
                      <span class="font-medium text-gray-900">€{{ selectedMaterialsTotal.toFixed(2) }}</span>
                    </div>
                    <div v-if="!details.assemblyRequired && !details.boxRental && !details.additionalInsurance && selectedMaterials.length === 0" class="text-sm text-gray-400">
                      {{ t('wizard.details.sidebar.noMaterials') }}
                    </div>
                    <div v-for="mat in selectedMaterials" :key="mat.id" class="flex items-center gap-2 text-sm text-gray-700">
                      <CheckIcon class="w-4 h-4 text-green-600 shrink-0" />
                      {{ t(`wizard.details.materialItems.${mat.id}.name`) }} ({{ mat.quantity }}x)
                    </div>
                  </div>
                </div>

                <!-- Trust box -->
                <div class="bg-primary-50 rounded-xl border border-primary-100 p-4">
                  <div class="flex items-start gap-3">
                    <ShieldIcon class="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-primary-900">{{ t('wizard.details.sidebar.trust') }}</p>
                      <p class="text-xs text-primary-700 mt-0.5 leading-relaxed">{{ t('wizard.details.sidebar.trustText') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── STEP 5: COMPANIES ─── -->
        <div v-if="step === 5" class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.companies.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.companies.subtitle') }}</p>
          </div>

          <!-- Distance Input -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <label class="block text-sm font-semibold text-gray-900 mb-3">{{ t('wizard.companies.distance') }}</label>
            <div class="flex gap-3">
              <input
                v-model.number="distanceKm"
                type="number"
                min="1"
                step="0.1"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none no-spinner"
              />
              <button
                @click="loadCompanies"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {{ isLoading ? t('common.loading') : t('wizard.companies.search') }}
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p class="text-sm text-gray-500">{{ t('common.loading') }}</p>
          </div>

          <!-- Error -->
          <div v-else-if="error && hasSearched" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p class="text-red-500">{{ error }}</p>
            <button
              @click="loadCompanies"
              :disabled="isLoading"
              class="mt-3 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {{ t('common.retry') }}
            </button>
          </div>

          <!-- No Results -->
          <div v-else-if="estimates.length === 0 && hasSearched" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p class="text-gray-500">{{ t('wizard.companies.noResults') }}</p>
          </div>

          <!-- Company Cards -->
          <div v-else-if="estimates.length > 0" class="space-y-4">
            <div
              v-for="est in estimates"
              :key="est.companyId"
              :class="[
                'relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200',
                selectedCompanyId === est.companyId
                  ? 'bg-secondary-50 border-secondary-500 shadow-lg shadow-secondary-200/60 scale-[1.02]'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
              ]"
              @click="selectCompany(est.companyId)"
            >
              <!-- Selected Badge -->
              <div
                v-if="selectedCompanyId === est.companyId"
                class="absolute -top-3 right-4 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
              >
                <CheckIcon class="w-3.5 h-3.5" />
                Ausgewählt
              </div>

              <div class="flex items-start gap-4">
                <div
                  :class="[
                    'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    selectedCompanyId === est.companyId
                      ? 'bg-secondary-100'
                      : 'bg-gray-100',
                  ]"
                >
                  <BuildingIcon
                    :class="selectedCompanyId === est.companyId ? 'w-6 h-6 text-secondary-700' : 'w-6 h-6 text-gray-500'"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h3
                      :class="[
                        'text-base font-bold',
                        selectedCompanyId === est.companyId ? 'text-secondary-800' : 'text-gray-900',
                      ]"
                    >
                      {{ est.companyName }}
                    </h3>
                    <div
                      v-if="selectedCompanyId === est.companyId"
                      class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"
                    >
                      <CheckIcon class="w-5 h-5" />
                    </div>
                    <div
                      v-else
                      class="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center"
                    >
                      <CheckIcon class="w-5 h-5 text-gray-200" />
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center gap-0.5">
                      <StarIcon class="w-4 h-4 text-amber-400" />
                      <span class="text-sm font-medium text-gray-700">4.5</span>
                    </div>
                    <span class="text-xs text-gray-400">(128 Bewertungen)</span>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      :class="[
                        'px-2 py-1 text-xs rounded-md',
                        selectedCompanyId === est.companyId
                          ? 'bg-white text-secondary-700 border border-secondary-200'
                          : 'bg-gray-50 text-gray-600',
                      ]"
                    >{{ est.calculationDetails.teamSize }} Personen</span>
                    <span
                      :class="[
                        'px-2 py-1 text-xs rounded-md',
                        selectedCompanyId === est.companyId
                          ? 'bg-white text-secondary-700 border border-secondary-200'
                          : 'bg-gray-50 text-gray-600',
                      ]"
                    >ca. {{ est.calculationDetails.estimatedHours }}h</span>
                    <span
                      :class="[
                        'px-2 py-1 text-xs rounded-md',
                        selectedCompanyId === est.companyId
                          ? 'bg-white text-secondary-700 border border-secondary-200'
                          : 'bg-gray-50 text-gray-600',
                      ]"
                    >Min. {{ est.calculationDetails.minimumHours }}h</span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p
                    :class="[
                      'text-2xl font-bold',
                      selectedCompanyId === est.companyId ? 'text-secondary-700' : 'text-primary-600',
                    ]"
                  >
                    €{{ est.estimatedPrice.toFixed(0) }}
                  </p>
                  <p class="text-xs text-gray-400">{{ t('wizard.companies.estimated') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p class="text-gray-500 mb-2">{{ t('wizard.companies.enterDistance') }}</p>
            <p class="text-sm text-gray-400">{{ t('wizard.companies.distanceHint') }}</p>
          </div>
        </div>

        <!-- ─── STEP 6: SUMMARY ─── -->
        <div v-if="step === 6" class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('wizard.summary.headline') }}</h1>
            <p class="text-gray-500 mt-1">{{ t('wizard.summary.subtitle') }}</p>
          </div>

          <!-- Move Data -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('wizard.summary.moveData') }}</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <MapPinIcon class="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-gray-500">{{ t('wizard.summary.from') }}</p>
                  <p class="font-medium text-gray-900">{{ basics.originStreet }} {{ basics.originHouseNumber }}, {{ basics.originZip }} {{ basics.originCity }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MapPinIcon class="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-gray-500">{{ t('wizard.summary.to') }}</p>
                  <p class="font-medium text-gray-900">{{ basics.destinationStreet }} {{ basics.destinationHouseNumber }}, {{ basics.destinationZip }} {{ basics.destinationCity }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <CalendarIcon class="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-gray-500">{{ t('wizard.summary.date') }}</p>
                  <p class="font-medium text-gray-900">{{ basics.moveDate }}</p>
                  <p v-if="basics.isFlexibleDate" class="text-xs text-amber-600 mt-0.5">{{ t('wizard.basics.flexibleDate') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Details Summary -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('wizard.summary.details') }}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.originFloor') }}</span>
                <span class="font-medium text-gray-900">
                  {{ details.floorsOrigin }}.
                  <span class="text-gray-400">{{ details.elevatorOrigin ? t('wizard.summary.elevatorYes') : t('wizard.summary.elevatorNo') }}</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.destinationFloor') }}</span>
                <span class="font-medium text-gray-900">
                  {{ details.floorsDestination }}.
                  <span class="text-gray-400">{{ details.elevatorDestination ? t('wizard.summary.elevatorYes') : t('wizard.summary.elevatorNo') }}</span>
                </span>
              </div>
              <div v-if="details.apartmentSize" class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.apartmentSize') }}</span>
                <span class="font-medium text-gray-900">{{ details.apartmentSize }} m²</span>
              </div>
              <div v-if="details.boxRental" class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.boxRental') }}</span>
                <span class="font-medium text-gray-900">{{ details.boxCount }} {{ t('wizard.details.boxCountUnit') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.assembly') }}</span>
                <span class="font-medium text-gray-900">{{ details.assemblyRequired ? t('wizard.summary.yes') : t('wizard.summary.no') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.additionalInsurance') }}</span>
                <span class="font-medium text-gray-900">{{ details.additionalInsurance ? t('wizard.summary.yes') : t('wizard.summary.no') }}</span>
              </div>
              <!-- Materials with prices -->
              <div v-if="selectedMaterials.length > 0" class="pt-2 border-t border-gray-100">
                <p class="text-gray-500 text-xs mb-2">{{ t('wizard.details.materials') }}</p>
                <div class="space-y-1.5">
                  <div v-for="mat in selectedMaterials" :key="mat.id" class="flex justify-between text-sm">
                    <span class="text-gray-600">
                      {{ t(`wizard.details.materialItems.${mat.id}.name`) }} ({{ mat.quantity }}x)
                    </span>
                    <span class="font-medium text-gray-900">
                      €{{ (materialPrices[mat.id] * mat.quantity).toFixed(2) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm pt-1.5 border-t border-gray-100">
                    <span class="font-medium text-gray-700">{{ t('wizard.summary.materialsSubtotal') }}</span>
                    <span class="font-bold text-gray-900">€{{ selectedMaterialsTotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="details.parkingDistance" class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.parking') }}</span>
                <span class="font-medium text-gray-900">{{ details.parkingDistance }} m</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.noParkingZone') }}</span>
                <span class="font-medium text-gray-900">{{ details.noParkingZoneRequired ? t('wizard.summary.yes') : t('wizard.summary.no') }}</span>
              </div>
            </div>
          </div>

          <!-- Inventory Summary -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('wizard.summary.inventory') }} ({{ inventorySummary.totalQuantity }} {{ t('wizard.inventory.items') }})</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in requestStore.items.slice(0, 8)"
                :key="item.id"
                class="px-2.5 py-1 bg-gray-50 text-gray-700 text-sm rounded-md"
              >
                {{ item.name }} ({{ item.quantity }}x)
              </span>
              <span v-if="requestStore.items.length > 8" class="px-2.5 py-1 text-sm text-gray-400">
                +{{ requestStore.items.length - 8 }} weitere
              </span>
            </div>
          </div>

          <!-- Selected Company -->
          <div v-if="selectedCompany" class="bg-white rounded-xl border-2 border-primary-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('wizard.summary.selectedCompany') }}</h3>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <BuildingIcon class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p class="font-bold text-gray-900">{{ selectedCompany.companyName }}</p>
                  <div class="flex items-center gap-1">
                    <StarIcon class="w-3.5 h-3.5 text-amber-400" />
                    <span class="text-xs text-gray-500">4.5 (128)</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xl font-bold text-primary-600">€{{ selectedCompany.estimatedPrice.toFixed(0) }}</p>
                <p class="text-xs text-gray-400">{{ t('wizard.companies.estimated') }}</p>
              </div>
            </div>
          </div>

          <!-- Cost Overview -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('wizard.summary.costOverview') }}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.moveCost') }}</span>
                <span class="font-medium text-gray-900">€{{ selectedCompany?.estimatedPrice.toFixed(0) }}</span>
              </div>
              <div v-if="selectedMaterials.length > 0" class="flex justify-between">
                <span class="text-gray-500">{{ t('wizard.summary.materialsCost') }}</span>
                <span class="font-medium text-gray-900">€{{ selectedMaterialsTotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-100">
                <span class="font-semibold text-gray-900">{{ t('wizard.summary.totalCost') }}</span>
                <span class="text-xl font-bold text-primary-600">
                  €{{ ((selectedCompany?.estimatedPrice || 0) + selectedMaterialsTotal).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Next Steps Info -->
          <div class="bg-primary-50 rounded-xl border border-primary-100 p-6">
            <div class="flex items-start gap-3">
              <InfoIcon class="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p class="text-sm font-medium text-primary-900">{{ t('wizard.summary.nextStepsTitle') }}</p>
                <p class="text-sm text-primary-700 mt-1">{{ t('wizard.summary.nextStepsText') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Navigation -->
      <div class="fixed bottom-0 left-0 right-0 lg:left-60 bg-white border-t border-gray-200 z-30">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            v-if="step > 1 && !success"
            @click="prevStep"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            {{ t('common.back') }}
          </button>
          <div v-else class="w-24" />

          <button
            v-if="step < totalSteps && !success"
            @click="nextStep"
            :disabled="!canGoNext || isLoading"
            class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {{ t('common.next') }}
            <ArrowRightIcon class="w-4 h-4" />
          </button>

          <button
            v-else-if="step === totalSteps && !success"
            @click="sendRequest"
            :disabled="isLoading || !selectedCompanyId"
            class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SendIcon class="w-4 h-4" />
            {{ isLoading ? t('common.sending') : t('wizard.summary.send') }}
          </button>

          <button
            v-else-if="success"
            @click="router.push('/dashboard')"
            class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <CheckIcon class="w-4 h-4" />
            {{ t('wizard.summary.toDashboard') }}
          </button>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>
