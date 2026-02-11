<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import {
  ShieldCheckIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  BoltIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'
import PublicOfferForm from "@/components/Forms/PublicOfferForm.vue";

const { t } = useI18n()

// Features als Timeline/Process Steps wie im Screenshot
const processSteps = ref([
  {
    id: 'verified',
    icon: UserCircleIcon,
    title: t('home.features.verified.title'),
    description: t('home.features.verified.description')
  },
  {
    id: 'fairPrices',
    icon: ClipboardDocumentListIcon,
    title: t('home.features.fairPrices.title'),
    description: t('home.features.fairPrices.description')
  },
  {
    id: 'stressFree',
    icon: AcademicCapIcon,
    title: t('home.features.stressFree.title'),
    description: t('home.features.stressFree.description')
  },
  {
    id: 'fastResponse',
    icon: ChartBarIcon,
    title: t('home.features.fastResponse.title'),
    description: t('home.features.fastResponse.description')
  }
])

// Quick features für die Vorteile unter dem Hero
const quickFeatures = ref([
  {
    icon: ShieldCheckIcon,
    title: t('home.features.verified.title'),
    description: t('home.features.verified.description')
  },
  {
    icon: CurrencyEuroIcon,
    title: t('home.features.fairPrices.title'),
    description: t('home.features.fairPrices.description')
  },
  {
    icon: SparklesIcon,
    title: t('home.features.stressFree.title'),
    description: t('home.features.stressFree.description')
  },
  {
    icon: BoltIcon,
    title: t('home.features.fastResponse.title'),
    description: t('home.features.fastResponse.description')
  }
])

const scrollToOffer = () => {
  const offerSection = document.getElementById('offer')
  if (offerSection) {
    offerSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section - Im Stil des Screenshots mit dunklem Gradienten -->
    <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <!-- Dunkler mysteriöser Gradient wie im Screenshot -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-teal-800">
        <!-- Verschwommene Lichtflecken wie im Screenshot -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-[80px]"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
        <!-- Kleiner Tag über der Überschrift -->
        <div class="mb-8">
          <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-sm font-medium tracking-wide uppercase">
            {{ t('home.hero.badge') || 'Dein Umzugspartner' }}
          </span>
        </div>

        <!-- Hauptüberschrift wie im Screenshot -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          {{ t('home.hero.title') }}
        </h1>

        <!-- Unterüberschrift -->
        <p class="text-lg sm:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          {{ t('home.hero.subtitle') }}
        </p>

        <!-- CTA Button im Stil des Screenshots -->
        <div class="flex flex-col items-center gap-4">
          <button
              @click="scrollToOffer"
              class="inline-flex items-center px-8 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            {{ t('home.hero.cta.offer') || 'Test the Program' }}
          </button>

          <span class="text-white/50 text-sm mt-4">
            {{ t('home.hero.subtext') || 'Kostenlos & unverbindlich testen' }}
          </span>
        </div>

        <!-- Stats im unteren Bereich des Heroes -->
        <div class="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-white/10 pt-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-white">500+</div>
            <div class="text-white/50 text-sm mt-1">{{ t('home.hero.stats.companies') }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white">10k+</div>
            <div class="text-white/50 text-sm mt-1">{{ t('home.hero.stats.moves') }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white">4.8</div>
            <div class="text-white/50 text-sm mt-1">{{ t('home.hero.stats.rating') }}</div>
          </div>
        </div>
      </div>

      <!-- Wellenförmiger Übergang zum weißen Bereich -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>

    <!-- Wie es funktioniert - Timeline Section wie im Screenshot -->
    <section class="py-20 lg:py-28 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
            How The <span class="text-purple-600">Training</span> Works
          </h2>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">
            {{ t('home.features.subtitle') }}
          </p>
        </div>

        <!-- Timeline Grid wie im Screenshot -->
        <div class="relative">
          <!-- Verbindungslinie für Desktop -->
          <div class="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-purple-200 via-teal-200 to-purple-200"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div
                v-for="(step, index) in processSteps"
                :key="step.id"
                class="relative flex flex-col items-center text-center group"
            >
              <!-- Icon Circle mit Verbindung -->
              <div class="relative mb-6">
                <div class="w-20 h-20 rounded-full bg-white shadow-lg border-2 border-slate-100 flex items-center justify-center relative z-10 group-hover:border-purple-300 transition-colors duration-300">
                  <component :is="step.icon" class="w-8 h-8 text-slate-700" />
                </div>
                <!-- Schritt Nummer -->
                <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                  {{ index + 1 }}
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-lg font-bold text-slate-800 mb-3 uppercase tracking-wide">
                {{ step.title }}
              </h3>
              <p class="text-slate-500 text-sm leading-relaxed max-w-xs">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid - Die klassischen 4 Features als Karten -->
    <section class="py-16 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
              v-for="feature in quickFeatures"
              :key="feature.title"
              class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 text-center"
          >
            <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <component :is="feature.icon" class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="font-semibold text-slate-800 mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-slate-500">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Public Offer Section - Clean Zweispaltig -->
    <section id="offer" class="py-20 lg:py-28 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Left: Info -->
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 tracking-tight">
              {{ t('home.offer.title') }}
            </h2>
            <p class="text-lg text-slate-500 mb-8 leading-relaxed">
              {{ t('home.offer.description') }}
            </p>

            <!-- Benefits List mit besserem Styling -->
            <ul class="space-y-4">
              <li class="flex items-start group">
                <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-4 mt-0.5 group-hover:bg-purple-200 transition-colors">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-slate-600">{{ t('home.offer.benefits.multiple') }}</span>
              </li>
              <li class="flex items-start group">
                <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-4 mt-0.5 group-hover:bg-purple-200 transition-colors">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-slate-600">{{ t('home.offer.benefits.compare') }}</span>
              </li>
              <li class="flex items-start group">
                <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-4 mt-0.5 group-hover:bg-purple-200 transition-colors">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-slate-600">{{ t('home.offer.benefits.free') }}</span>
              </li>
              <li class="flex items-start group">
                <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-4 mt-0.5 group-hover:bg-purple-200 transition-colors">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-slate-600">{{ t('home.offer.benefits.noObligation') }}</span>
              </li>
            </ul>

            <!-- Zusätzliche CTA -->
            <div class="mt-10">
              <RouterLink
                  to="/register"
                  class="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                {{ t('home.hero.cta.register') }}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </RouterLink>
            </div>
          </div>

          <!-- Right: Form mit eleganter Card -->
          <div class="bg-slate-50 rounded-2xl p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <!-- Dekorativer Hintergrund im Formular -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div class="relative z-10">
              <h3 class="text-xl font-bold text-slate-800 mb-6">
                Jetzt Angebot anfordern
              </h3>
              <PublicOfferForm />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section - Minimalistisch -->
    <section class="py-12 bg-slate-50 border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          <div class="flex items-center space-x-2 text-slate-400">
            <ShieldCheckIcon class="w-6 h-6" />
            <span class="text-sm font-medium">TÜV Zertifiziert</span>
          </div>
          <div class="flex items-center space-x-2 text-slate-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span class="text-sm font-medium">SSL Verschlüsselt</span>
          </div>
          <div class="flex items-center space-x-2 text-slate-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span class="text-sm font-medium">DSGVO Konform</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>