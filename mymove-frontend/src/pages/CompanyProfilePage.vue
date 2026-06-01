<script setup lang="ts">
import { ref, computed, onMounted, h, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '@/stores/company'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import CompanyLayout from '@/components/company/CompanyLayout.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const companyStore = useCompanyStore()
const authStore = useAuthStore()
const { t } = useI18n()

// ─── Tabs ───
const activeTab = ref<'profile' | 'services' | 'pricing' | 'area' | 'verification'>('profile')

// ─── State ───
const form = ref<Record<string, any>>({})
const pricingForm = ref<Record<string, any>>({})
const editedServices = ref<string[]>([])
const newCity = ref('')
const saveStatus = ref<Record<string, 'idle' | 'success' | 'error'>>({
  profile: 'idle', area: 'idle', services: 'idle', pricing: 'idle',
})
const logoInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)
const isUploading = ref<'logo' | 'banner' | null>(null)
const showSaveSuccess = ref(false)
const showBannerPicker = ref(false)
const presetBanners = [
  { id: 'ocean', name: 'Ocean', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjM0I4MkY2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMUU0MEFGIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
  { id: 'sunset', name: 'Sunset', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRUY0NDQ0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQjkxQzFDIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
  { id: 'forest', name: 'Forest', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjJDNTVFIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTU4MDNEIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
  { id: 'warm', name: 'Warm', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRjk3MzE2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQzI0MTBDIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
  { id: 'royal', name: 'Royal', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjOEI1Q0Y2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNkQyOEQ5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
  { id: 'slate', name: 'Slate', url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjQ3NDhCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzM0MTU1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+' },
]

async function selectPresetBanner(url: string) {
  showBannerPicker.value = false
  try {
    await companyStore.updateCompany({ bannerUrl: url })
    if (companyStore.company) {
      companyStore.company.bannerUrl = url
    }
  } catch {
    alert('Banner-Auswahl fehlgeschlagen.')
  }
}
const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: L.Map | null = null
let mapCircle: L.Circle | null = null
let mapMarker: L.Marker | null = null

// ─── Services Definition ───
const serviceList = [
  { key: 'private_move', icon: HomeIcon, label: 'Privatumzug' },
  { key: 'business_move', icon: BriefcaseIcon, label: 'Firmenumzug' },
  { key: 'long_distance', icon: TruckIcon, label: 'Fernumzug' },
  { key: 'international', icon: GlobeIcon, label: 'Internationale Umzüge' },
  { key: 'assembly', icon: WrenchIcon, label: 'Montage & Demontage' },
  { key: 'packing', icon: PackageIcon, label: 'Packservice' },
  { key: 'storage', icon: WarehouseIcon, label: 'Einlagerung' },
  { key: 'disposal', icon: TrashIcon, label: 'Entsorgung' },
  { key: 'piano', icon: MusicIcon, label: 'Klaviertransport' },
  { key: 'heavy_transport', icon: WeightIcon, label: 'Schwertransport' },
  { key: 'cleaning', icon: SparklesIcon, label: 'Reinigung' },
  { key: 'no_parking_zone', icon: CircleSlashIcon, label: 'Halteverbotszone' },
]

// ─── Pricing Sections ───
const pricingSections = [
  {
    key: 'base', label: 'Basispreise',
    fields: [
      { key: 'baseFee', label: 'Grundgebühr', unit: '€' },
      { key: 'pricePerHour', label: 'Stundensatz', unit: '€/h' },
      { key: 'pricePerWorker', label: 'Preis pro Arbeiter', unit: '€/h' },
      { key: 'additionalWorkerPrice', label: 'Zusätzlicher Arbeiter', unit: '€/h' },
      { key: 'pricePerKm', label: 'Kilometerpauschale', unit: '€/km' },
      { key: 'travelFee', label: 'Anfahrtskosten', unit: '€' },
      { key: 'minimumHours', label: 'Mindeststunden', unit: 'h' },
      { key: 'teamSize', label: 'Standard-Teamgröße', unit: '' },
    ],
  },
  {
    key: 'materials', label: 'Materialien',
    fields: [
      { key: 'boxRentalPrice', label: 'Kartonmiete', unit: '€' },
      { key: 'wardrobeBoxPrice', label: 'Kleiderboxen', unit: '€' },
      { key: 'stretchFilmPrice', label: 'Stretchfolie', unit: '€' },
      { key: 'tapePrice', label: 'Klebeband', unit: '€' },
      { key: 'mattressCoverPrice', label: 'Matratzenhüllen', unit: '€' },
      { key: 'furnitureBlanketPrice', label: 'Schutzdecken', unit: '€' },
    ],
  },
  {
    key: 'extras', label: 'Zusatzleistungen',
    fields: [
      { key: 'packingServiceHourlyRate', label: 'Packservice (Stundensatz)', unit: '€/h' },
      { key: 'noParkingZonePrice', label: 'Halteverbot', unit: '€' },
      { key: 'storagePricePerSqm', label: 'Einlagerung', unit: '€/m²' },
      { key: 'disposalServicePrice', label: 'Entsorgung', unit: '€' },
    ],
  },
  {
    key: 'surcharges', label: 'Aufschläge',
    fields: [
      { key: 'weekendSurcharge', label: 'Wochenendaufschlag', unit: '%' },
      { key: 'holidaySurcharge', label: 'Feiertagsaufschlag', unit: '%' },
      { key: 'eveningSurcharge', label: 'Abendaufschlag', unit: '%' },
      { key: 'urgentBookingSurcharge', label: 'Express-Aufschlag', unit: '%' },
    ],
  },
]
const activePricingTab = ref('base')

// ─── Init ───
function loadForm() {
  const c = companyStore.company
  if (!c) return
  form.value = {
    companyName: c.companyName || '',
    description: c.description || '',
    contactPerson: c.contactPerson || '',
    phone: c.phone || '',
    email: c.email || '',
    supportEmail: c.supportEmail || '',
    website: c.website || '',
    taxId: c.taxId || '',
    foundingYear: c.foundingYear || null,
    employeeCount: c.employeeCount || null,
    mainLocation: c.mainLocation || '',
    operatingRadiusKm: c.operatingRadiusKm || null,
    supportedCitiesJson: c.supportedCitiesJson || '[]',
    internationalMoves: c.internationalMoves || false,
  }
  try {
    editedServices.value = c.servicesJson ? JSON.parse(c.servicesJson) : []
  } catch { editedServices.value = [] }
}

function loadPricingForm() {
  const p = companyStore.pricing
  if (!p) return
  pricingForm.value = { ...p }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  await companyStore.fetchProfile()
  await companyStore.fetchPricing()
  loadForm()
  loadPricingForm()
  await nextTick()
  initMap()
})

watch(() => form.value.operatingRadiusKm, () => updateMapRadius())
watch(() => form.value.mainLocation, () => updateMapCenter())

// ─── Map ───
function initMap() {
  if (!mapContainer.value) return
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
  mapInstance = L.map(mapContainer.value, { zoomControl: false }).setView([48.2082, 16.3738], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  }).addTo(mapInstance)
  updateMapCenter()
}

async function updateMapCenter() {
  if (!mapInstance) return
  const location = form.value.mainLocation || 'Wien'
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`)
    const data = await res.json()
    if (data && data[0]) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      mapInstance.setView([lat, lon], 10)
      if (mapMarker) mapInstance.removeLayer(mapMarker)
      mapMarker = L.marker([lat, lon]).addTo(mapInstance)
      updateMapRadius(lat, lon)
    }
  } catch { /* ignore */ }
}

function updateMapRadius(lat?: number, lon?: number) {
  if (!mapInstance) return
  const center = mapMarker?.getLatLng() || mapInstance.getCenter()
  const radiusKm = form.value.operatingRadiusKm || 50
  if (mapCircle) mapInstance.removeLayer(mapCircle)
  mapCircle = L.circle([lat || center.lat, lon || center.lng], {
    radius: radiusKm * 1000,
    color: '#3B82F6',
    fillColor: '#3B82F6',
    fillOpacity: 0.12,
    weight: 2,
  }).addTo(mapInstance)
}

// ─── Upload ───
function openLogoPicker() { logoInput.value?.click() }
function openBannerPicker() { bannerInput.value?.click() }

async function handleImageUpload(event: Event, type: 'logo' | 'banner') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Das Bild darf maximal 2 MB groß sein.')
    target.value = ''
    return
  }
  isUploading.value = type
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    await companyStore.updateCompany({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: base64 })
    if (companyStore.company) {
      companyStore.company[type === 'logo' ? 'logoUrl' : 'bannerUrl'] = base64
    }
  } catch {
    alert('Upload fehlgeschlagen.')
  } finally {
    isUploading.value = null
    target.value = ''
  }
}

// ─── Save Handlers ───
async function saveProfile() {
  saveStatus.value.profile = 'idle'
  try {
    await companyStore.updateCompany({
      companyName: form.value.companyName,
      description: form.value.description,
      contactPerson: form.value.contactPerson,
      phone: form.value.phone,
      email: form.value.email,
      supportEmail: form.value.supportEmail,
      website: form.value.website,
      taxId: form.value.taxId,
      foundingYear: form.value.foundingYear ? Number(form.value.foundingYear) : null,
      employeeCount: form.value.employeeCount ? Number(form.value.employeeCount) : null,
    })
    saveStatus.value.profile = 'success'
    showSaveSuccess.value = true
    setTimeout(() => { saveStatus.value.profile = 'idle'; showSaveSuccess.value = false }, 2500)
  } catch {
    saveStatus.value.profile = 'error'
    setTimeout(() => (saveStatus.value.profile = 'idle'), 2500)
  }
}

async function saveArea() {
  saveStatus.value.area = 'idle'
  try {
    await companyStore.updateCompany({
      mainLocation: form.value.mainLocation,
      operatingRadiusKm: form.value.operatingRadiusKm ? Number(form.value.operatingRadiusKm) : null,
      supportedCitiesJson: form.value.supportedCitiesJson,
      internationalMoves: form.value.internationalMoves,
    })
    saveStatus.value.area = 'success'
    showSaveSuccess.value = true
    setTimeout(() => { saveStatus.value.area = 'idle'; showSaveSuccess.value = false }, 2500)
  } catch {
    saveStatus.value.area = 'error'
    setTimeout(() => (saveStatus.value.area = 'idle'), 2500)
  }
}

async function saveServices() {
  saveStatus.value.services = 'idle'
  try {
    await companyStore.updateCompany({ servicesJson: JSON.stringify(editedServices.value) })
    saveStatus.value.services = 'success'
    showSaveSuccess.value = true
    setTimeout(() => { saveStatus.value.services = 'idle'; showSaveSuccess.value = false }, 2500)
  } catch {
    saveStatus.value.services = 'error'
    setTimeout(() => (saveStatus.value.services = 'idle'), 2500)
  }
}

async function savePricing() {
  saveStatus.value.pricing = 'idle'
  try {
    const payload: Record<string, any> = {}
    for (const section of pricingSections) {
      for (const field of section.fields) {
        const val = pricingForm.value[field.key]
        payload[field.key] = val !== '' && val !== null && val !== undefined ? Number(val) : null
      }
    }
    await companyStore.savePricing(payload)
    saveStatus.value.pricing = 'success'
    showSaveSuccess.value = true
    setTimeout(() => { saveStatus.value.pricing = 'idle'; showSaveSuccess.value = false }, 2500)
  } catch {
    saveStatus.value.pricing = 'error'
    setTimeout(() => (saveStatus.value.pricing = 'idle'), 2500)
  }
}

// ─── Helpers ───
const supportedCities = computed(() => {
  try { return JSON.parse(form.value.supportedCitiesJson || '[]') as string[] } catch { return [] }
})

function addCity() {
  const city = newCity.value.trim()
  if (!city) return
  const list = supportedCities.value
  if (!list.includes(city)) { list.push(city); form.value.supportedCitiesJson = JSON.stringify(list) }
  newCity.value = ''
}

function removeCity(city: string) {
  const list = supportedCities.value.filter((c: string) => c !== city)
  form.value.supportedCitiesJson = JSON.stringify(list)
}

function toggleService(key: string) {
  const idx = editedServices.value.indexOf(key)
  if (idx > -1) editedServices.value.splice(idx, 1)
  else editedServices.value.push(key)
}

const companyInitials = computed(() => (companyStore.company?.companyName || '').slice(0, 2).toUpperCase())

const completenessItems = computed(() => {
  const c = companyStore.company
  if (!c) return []
  return [
    { key: 'logo', label: 'Logo hochladen', done: !!c.logoUrl },
    { key: 'banner', label: 'Bannerbild', done: !!c.bannerUrl },
    { key: 'location', label: 'Hauptstandort', done: !!c.mainLocation },
    { key: 'services', label: 'Leistungen auswählen', done: !!c.servicesJson && c.servicesJson !== '[]' },
    { key: 'pricing', label: 'Preise hinterlegen', done: !!companyStore.pricing?.baseFee },
    { key: 'verification', label: 'Verifizierung abschließen', done: c.isVerified },
  ]
})

const profilePercentage = computed(() => companyStore.profileCompleteness?.percentage ?? 0)

const circumference = 2 * Math.PI * 36
const progressOffset = computed(() => circumference - (profilePercentage.value / 100) * circumference)

const displayedServices = computed(() => {
  return serviceList.filter(s => editedServices.value.includes(s.key)).slice(0, 3)
})

const moreServicesCount = computed(() => Math.max(0, editedServices.value.length - 3))

// ─── Icons ───
function HomeIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }), h('polyline', { points: '9 22 9 12 15 12 15 22' }),
  ])
}
function BriefcaseIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('rect', { x: '2', y: '7', width: '20', height: '14', rx: '2' }), h('path', { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }),
  ])
}
function TruckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M10 17h4V5H2v12h3' }), h('path', { d: 'M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1' }), h('circle', { cx: '7.5', cy: '17.5', r: '2.5' }), h('circle', { cx: '17.5', cy: '17.5', r: '2.5' }),
  ])
}
function GlobeIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '12', r: '10' }), h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }), h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }),
  ])
}
function WrenchIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' }),
  ])
}
function PackageIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm7.5 4.27 9 5.15' }), h('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }), h('path', { d: 'm3.3 7 8.7 5 8.7-5' }), h('path', { d: 'M12 22V12' }),
  ])
}
function WarehouseIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.6l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z' }), h('path', { d: 'M6 18h12' }), h('path', { d: 'M6 14h12' }), h('path', { d: 'M6 10h12' }),
  ])
}
function TrashIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M3 6h18' }), h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }), h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
  ])
}
function MusicIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M9 18V5l12-2v13' }), h('circle', { cx: '6', cy: '18', r: '3' }), h('circle', { cx: '18', cy: '16', r: '3' }),
  ])
}
function WeightIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '5', r: '3' }), h('path', { d: 'M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4.033 21h15.934a2 2 0 0 0 1.933-2.5l-2.495-9.04A2 2 0 0 0 17.5 8z' }),
  ])
}
function SparklesIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }), h('path', { d: 'M5 3v4' }), h('path', { d: 'M19 17v4' }), h('path', { d: 'M3 5h4' }), h('path', { d: 'M17 19h4' }),
  ])
}
function CircleSlashIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '12', r: '10' }), h('line', { x1: '5', y1: '5', x2: '19', y2: '19' }),
  ])
}
function CheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '20 6 9 17 4 12' }),
  ])
}
function XIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
  ])
}
function StarIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
  ])
}
function CameraIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' }), h('circle', { cx: '12', cy: '13', r: '3' }),
  ])
}
function EyeIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }), h('circle', { cx: '12', cy: '12', r: '3' }),
  ])
}
function SaveIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), h('polyline', { points: '17 21 17 13 7 13 7 21' }), h('polyline', { points: '7 3 7 8 15 8' }),
  ])
}
function UploadIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), h('polyline', { points: '17 8 12 3 7 8' }), h('line', { x1: '12', y1: '3', x2: '12', y2: '15' }),
  ])
}
function ShieldCheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }), h('path', { d: 'm9 12 2 2 4-4' }),
  ])
}
function UsersIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }), h('circle', { cx: '9', cy: '7', r: '4' }), h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
  ])
}
function TruckSmallIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M10 17h4V5H2v12h3' }), h('path', { d: 'M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1' }), h('circle', { cx: '7.5', cy: '17.5', r: '2.5' }), h('circle', { cx: '17.5', cy: '17.5', r: '2.5' }),
  ])
}
function ClockIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' }),
  ])
}
function CheckCircleIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), h('polyline', { points: '22 4 12 14.01 9 11.01' }),
  ])
}
function ChevronRightIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '9 18 15 12 9 6' }),
  ])
}
</script>

<template>
  <CompanyLayout>
    <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">{{ t('companyProfile.title') }}</h1>
          <p class="text-gray-500 mt-1">{{ t('companyProfile.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <EyeIcon class="w-4 h-4" />
            Vorschau ansehen
          </button>
          <button
            @click="activeTab === 'profile' ? saveProfile() : activeTab === 'area' ? saveArea() : activeTab === 'services' ? saveServices() : savePricing()"
            :disabled="companyStore.isSaving || showSaveSuccess"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm',
              showSaveSuccess
                ? 'bg-green-600 text-white'
                : 'text-white bg-primary-900 hover:bg-primary-800 disabled:opacity-50',
            ]"
          >
            <svg v-if="showSaveSuccess" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <SaveIcon v-else class="w-4 h-4" />
            {{ showSaveSuccess ? 'Gespeichert' : companyStore.isSaving ? 'Speichern...' : 'Speichern' }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex overflow-x-auto border-b border-gray-200 mb-8 gap-8">
        <button
          v-for="tab in [{key:'profile',label:'Profil'},{key:'services',label:'Leistungen'},{key:'pricing',label:'Preise'},{key:'area',label:'Einsatzgebiet'},{key:'verification',label:'Verifizierung'}]"
          :key="tab.key"
          @click="activeTab = tab.key as any"
          :class="[
            'pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'text-primary-700 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT COLUMN -->
        <div class="lg:col-span-2 space-y-6">

          <!-- ─── UNTERNEHMENSPROFIL ─── -->
          <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Unternehmensprofil</h2>
              <p class="text-sm text-gray-500 mt-0.5">Deine wichtigsten Unternehmensinformationen</p>
            </div>
            <div class="p-6 space-y-6">
              <!-- Logo + Banner -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <!-- Logo -->
                <div class="sm:col-span-1">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Logo</label>
                  <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="(e) => handleImageUpload(e, 'logo')" />
                  <div class="relative w-full h-48 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer group" @click="openLogoPicker">
                    <img v-if="companyStore.company?.logoUrl" :src="companyStore.company.logoUrl" class="w-full h-full object-contain p-4" />
                    <div v-else class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                      <span class="text-2xl font-bold text-gray-300">{{ companyInitials }}</span>
                    </div>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <CameraIcon class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                    <div v-if="isUploading === 'logo'" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                      <svg class="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    </div>
                  </div>
                  <button @click="openLogoPicker" class="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <UploadIcon class="w-4 h-4" />
                    Logo ändern
                  </button>
                </div>
                <!-- Banner -->
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bannerbild</label>
                  <input ref="bannerInput" type="file" accept="image/*" class="hidden" @change="(e) => handleImageUpload(e, 'banner')" />
                  <div class="relative w-full h-48 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer group" @click="showBannerPicker = true">
                    <img v-if="companyStore.company?.bannerUrl" :src="companyStore.company.bannerUrl" class="w-full h-full object-cover" />
                    <div v-else class="text-gray-300 flex flex-col items-center justify-center gap-1">
                      <CameraIcon class="w-8 h-8" />
                      <span class="text-xs text-gray-400">Banner</span>
                    </div>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <CameraIcon class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                    <div v-if="isUploading === 'banner'" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                      <svg class="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    </div>
                  </div>
                  <button @click="showBannerPicker = true" class="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <UploadIcon class="w-4 h-4" />
                    Banner wählen
                  </button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Firmenname</label>
                  <input v-model="form.companyName" type="text" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ansprechpartner</label>
                  <input v-model="form.contactPerson" type="text" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Beschreibung</label>
                  <textarea v-model="form.description" rows="4" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300 resize-none" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telefon</label>
                  <input v-model="form.phone" type="tel" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">E-Mail</label>
                  <input v-model="form.email" type="email" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support-E-Mail</label>
                  <input v-model="form.supportEmail" type="email" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Webseite</label>
                  <input v-model="form.website" type="url" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Steuernummer</label>
                  <input v-model="form.taxId" type="text" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gründungsjahr</label>
                  <select v-model.number="form.foundingYear" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300">
                    <option :value="null">Bitte wählen</option>
                    <option v-for="year in Array.from({length: 130}, (_, i) => 2100 - i)" :key="year" :value="year">{{ year }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mitarbeiteranzahl</label>
                  <select v-model.number="form.employeeCount" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300">
                    <option :value="null">Bitte wählen</option>
                    <option v-for="n in [1,2,3,4,5,6,7,8,9,10,15,20,30,40,50,100]" :key="n" :value="n">{{ n }}</option>
                    <option :value="101">100+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── EINSATZGEBIET ─── -->
          <div v-if="activeTab === 'area'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Einsatzgebiet</h2>
              <p class="text-sm text-gray-500 mt-0.5">Definiere, in welchen Regionen du aktiv bist</p>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hauptstandort</label>
                  <input v-model="form.mainLocation" type="text" placeholder="z.B. Wien, Österreich" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Aktionsradius</label>
                  <div class="relative">
                    <input v-model.number="form.operatingRadiusKm" type="number" min="1" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300 pr-10" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
                  </div>
                </div>
              </div>

              <!-- Cities + Map -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Abgedeckte Städte & Regionen</label>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="city in supportedCities"
                      :key="city"
                      class="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg"
                    >
                      {{ city }}
                      <button @click="removeCity(city)" class="hover:text-red-500 transition-colors"><XIcon class="w-3 h-3" /></button>
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="newCity"
                      type="text"
                      placeholder="Stadt / Region hinzufügen"
                      class="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300"
                      @keydown.enter.prevent="addCity"
                    />
                    <button @click="addCity" class="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">+</button>
                  </div>

                  <div class="flex items-center gap-3 mt-5">
                    <button
                      @click="form.internationalMoves = !form.internationalMoves"
                      :class="[
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                        form.internationalMoves ? 'bg-primary-600' : 'bg-gray-200',
                      ]"
                    >
                      <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition', form.internationalMoves ? 'translate-x-5' : 'translate-x-0']" />
                    </button>
                    <span class="text-sm text-gray-700 font-medium">Internationale Umzüge anbieten</span>
                  </div>
                </div>

                <!-- Map -->
                <div class="rounded-xl border border-gray-200 overflow-hidden" style="min-height: 280px;">
                  <div ref="mapContainer" class="w-full h-full" style="min-height: 280px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── LEISTUNGEN ─── -->
          <div v-if="activeTab === 'services'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Leistungen & Services</h2>
              <p class="text-sm text-gray-500 mt-0.5">Wähle die Leistungen, die dein Unternehmen anbietet</p>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                <div
                  v-for="svc in serviceList"
                  :key="svc.key"
                  class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors gap-3 h-full"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                      <component :is="svc.icon" />
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ svc.label }}</span>
                  </div>
                  <button
                    @click="toggleService(svc.key)"
                    :class="[
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors shrink-0',
                      editedServices.includes(svc.key) ? 'bg-primary-600' : 'bg-gray-200',
                    ]"
                  >
                    <span :class="['pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition', editedServices.includes(svc.key) ? 'translate-x-4' : 'translate-x-0']" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── PREISE ─── -->
          <div v-if="activeTab === 'pricing'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Preise & Konditionen</h2>
              <p class="text-sm text-gray-500 mt-0.5">Konfiguriere deine Preismodelle und Aufschläge</p>
            </div>
            <div class="p-6 space-y-6">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="section in pricingSections"
                  :key="section.key"
                  @click="activePricingTab = section.key"
                  :class="[
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    activePricingTab === section.key ? 'bg-primary-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                  ]"
                >
                  {{ section.label }}
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="field in pricingSections.find(s => s.key === activePricingTab)?.fields" :key="field.key">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ field.label }}</label>
                  <div class="relative">
                    <input v-model.number="pricingForm[field.key]" type="number" step="0.01" min="0" class="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none hover:border-gray-300 pr-10" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{{ field.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── VERIFIZIERUNG ─── -->
          <div v-if="activeTab === 'verification'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Verifizierung & Vertrauen</h2>
              <p class="text-sm text-gray-500 mt-0.5">Zeige Kunden deine Zuverlässigkeit und Qualität</p>
            </div>
            <div class="p-6 space-y-6">
              <div class="space-y-3">
                <div v-for="item in [
                  { label: 'Gewerbe geprüft', done: companyStore.company?.status === 'APPROVED' },
                  { label: 'Versicherung geprüft', done: false },
                  { label: 'Identität bestätigt', done: companyStore.company?.isVerified },
                  { label: 'Premium Partner', done: companyStore.company?.averageRating && companyStore.company.averageRating >= 4.5 },
                  { label: 'Top bewertet', done: companyStore.company?.averageRating && companyStore.company.averageRating >= 4.0 },
                ]" :key="item.label" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div class="flex items-center gap-3">
                    <ShieldCheckIcon class="w-5 h-5 text-gray-400" />
                    <span class="text-sm text-gray-700">{{ item.label }}</span>
                  </div>
                  <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', item.done ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500']">
                    {{ item.done ? 'Verifiziert' : 'Nicht aktiv' }}
                  </span>
                </div>
              </div>
              <div v-if="companyStore.company?.documents?.length" class="space-y-3">
                <h3 class="text-sm font-semibold text-gray-900">Dokumente</h3>
                <div v-for="doc in companyStore.company.documents" :key="doc.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <ShieldCheckIcon class="w-5 h-5 text-primary-600" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ doc.documentType }}</p>
                    <p class="text-xs text-gray-500">{{ doc.fileName }}</p>
                  </div>
                  <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700']">{{ doc.status }}</span>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <p class="text-sm text-gray-500">Noch keine Dokumente hochgeladen.</p>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="space-y-6">

          <!-- Profil-Vollständigkeit -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-5">Profil-Vollständigkeit</h3>
            <div class="flex flex-col items-center mb-5">
              <div class="relative w-24 h-24">
                <svg class="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" stroke="#E5E7EB" stroke-width="6" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#3B82F6" stroke-width="6" fill="none"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    stroke-linecap="round"
                    class="transition-all duration-700"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xl font-bold text-gray-900">{{ profilePercentage }}%</span>
                </div>
              </div>
              <p class="text-sm font-medium text-gray-700 mt-3">
                {{ profilePercentage >= 80 ? 'Sehr gut! Fast geschafft.' : profilePercentage >= 50 ? 'Gut auf dem Weg.' : 'Noch ein paar Schritte.' }}
              </p>
            </div>
            <div class="space-y-2.5">
              <div v-for="item in completenessItems" :key="item.key" class="flex items-center gap-2.5">
                <div :class="['w-5 h-5 rounded-full flex items-center justify-center shrink-0', item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400']">
                  <CheckIcon v-if="item.done" class="w-3 h-3" />
                  <div v-else class="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
                <span :class="['text-sm', item.done ? 'text-gray-900 font-medium' : 'text-gray-500']">{{ item.label }}</span>
              </div>
            </div>
            <div v-if="profilePercentage < 100" class="mt-4 p-3 bg-gray-50 rounded-xl">
              <p class="text-xs text-gray-500 leading-relaxed">
                <span class="font-medium text-gray-700">Tipp:</span> Füge noch deine Preise hinzu, um mehr Anfragen zu erhalten.
              </p>
            </div>
          </div>

          <!-- Öffentliche Vorschau -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Öffentliche Vorschau</h3>
            <div class="rounded-xl border border-gray-100 overflow-hidden">
              <div class="h-24 bg-gray-100 relative">
                <img v-if="companyStore.company?.bannerUrl" :src="companyStore.company.bannerUrl" class="w-full h-full object-cover" />
                <div class="absolute -bottom-7 left-4 z-10">
                  <div class="w-14 h-14 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden">
                    <img v-if="companyStore.company?.logoUrl" :src="companyStore.company.logoUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-lg font-bold text-gray-300">{{ companyInitials }}</span>
                  </div>
                </div>
              </div>
              <div class="p-4 pt-10">
                <h4 class="font-semibold text-gray-900">{{ companyStore.company?.companyName }}</h4>
                <div class="flex items-center gap-1.5 mt-1">
                  <StarIcon class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span class="text-sm text-gray-600">{{ Number(companyStore.company?.averageRating || 0).toFixed(1) }} ({{ companyStore.company?.totalReviews || 0 }} Bewertungen)</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ companyStore.company?.mainLocation || 'Standort nicht angegeben' }}</p>
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span v-for="svc in displayedServices" :key="svc.key" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{{ svc.label }}</span>
                  <span v-if="moreServicesCount > 0" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">+{{ moreServicesCount }} weitere</span>
                </div>
                <button class="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors">
                  Vorschau öffnen
                  <ChevronRightIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Verifizierung & Vertrauen -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Verifizierung & Vertrauen</h3>
            <div class="space-y-3">
              <div v-for="item in [
                { label: 'Gewerbe geprüft', done: companyStore.company?.status === 'APPROVED' },
                { label: 'Versicherung geprüft', done: false },
                { label: 'Identität bestätigt', done: companyStore.company?.isVerified },
                { label: 'Premium Partner', done: companyStore.company?.averageRating && companyStore.company.averageRating >= 4.5 },
                { label: 'Top bewertet', done: companyStore.company?.averageRating && companyStore.company.averageRating >= 4.0 },
              ]" :key="item.label" class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-700">{{ item.label }}</span>
                </div>
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', item.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
                  {{ item.done ? 'Verifiziert' : 'Nicht aktiv' }}
                </span>
              </div>
            </div>
            <button class="mt-4 w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Dokumente verwalten
            </button>
          </div>

          <!-- Kapazität & Statistiken -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Kapazität & Statistiken</h3>
            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <UsersIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Aktive Teams</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">3</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <TruckSmallIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Fahrzeuge</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">4</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <BriefcaseIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Max. parallele Aufträge</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ companyStore.company?.maxParallelJobs || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Durchschn. Antwortzeit</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ companyStore.company?.avgResponseTimeHours ? companyStore.company.avgResponseTimeHours + 'h' : '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <CheckCircleIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Abgeschlossene Umzüge</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ companyStore.company?.completedMovesCount || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <StarIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">Durchschnittsbewertung</span>
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ companyStore.company?.averageRating ? Number(companyStore.company.averageRating).toFixed(1) + ' ★' : '-' }}</span>
              </div>
            </div>
            <button class="mt-5 text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 transition-colors">
              Alle Statistiken anzeigen
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Banner Picker Modal -->
    <div v-if="showBannerPicker" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showBannerPicker = false"></div>
      <div class="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Banner auswählen</h3>
          <button @click="showBannerPicker = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <button
            v-for="banner in presetBanners"
            :key="banner.id"
            @click="selectPresetBanner(banner.url)"
            class="relative aspect-[3/1] rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors focus:outline-none focus:border-primary-500"
          >
            <img :src="banner.url" class="w-full h-full object-cover" />
            <span class="absolute bottom-1 left-2 text-xs font-medium text-white drop-shadow">{{ banner.name }}</span>
          </button>
        </div>
        <div class="border-t border-gray-100 pt-4">
          <button @click="showBannerPicker = false; openBannerPicker()" class="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2">
            <UploadIcon class="w-4 h-4" />
            Eigenes Bild hochladen
          </button>
        </div>
      </div>
    </div>
  </CompanyLayout>
</template>
