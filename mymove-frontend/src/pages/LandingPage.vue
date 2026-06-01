<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-50 transition-all duration-300"
      :class="scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white/90 backdrop-blur-md border-b border-gray-100'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <RouterLink to="/" class="flex items-center">
              <img
                src="/assets/img/MyMoveLogoSchrift.png"
                alt="MyMove"
                class="h-14 w-auto object-contain"
              />
            </RouterLink>
            <div class="hidden md:flex items-center gap-6">
              <a href="#how-it-works" class="text-sm font-medium text-gray-500 hover:text-primary-900 transition-colors">
                {{ t('landing.nav.howItWorks') }}
              </a>
              <a href="#solutions" class="text-sm font-medium text-gray-500 hover:text-primary-900 transition-colors">
                {{ t('landing.nav.solutions') }}
              </a>
              <a href="#faq" class="text-sm font-medium text-gray-500 hover:text-primary-900 transition-colors">
                FAQ
              </a>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Language Switcher -->
            <button
              @click="toggleLocale"
              class="text-sm font-medium text-gray-500 hover:text-primary-900 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
            >
              {{ locale === 'de' ? 'DE' : 'EN' }}
            </button>
            <!-- Dev Login Dropdown -->
            <div class="relative">
              <button
                @click="devDropdownOpen = !devDropdownOpen"
                class="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                {{ locale === 'de' ? 'Anmelden' : 'Login' }}
                <ChevronDown class="w-4 h-4" :class="devDropdownOpen ? 'rotate-180' : ''" />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div
                  v-if="devDropdownOpen"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                >
                  <p class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ locale === 'de' ? 'Entwicklung' : 'Development' }}</p>
                  <button
                    @click="handleDevLogin('admin')"
                    class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-900 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck class="w-4 h-4" style="color: #6366F1;" />
                    {{ locale === 'de' ? 'Als Admin (point4Studio)' : 'As Admin (point4Studio)' }}
                  </button>
                  <button
                    @click="handleDevLogin('company')"
                    class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-900 transition-colors flex items-center gap-2"
                  >
                    <Building2 class="w-4 h-4" style="color: #3B82F6;" />
                    {{ locale === 'de' ? 'Als Firmenkunde' : 'As Company' }}
                  </button>
                  <button
                    @click="handleDevLogin('end_customer')"
                    class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-900 transition-colors flex items-center gap-2"
                  >
                    <User class="w-4 h-4" style="color: #0F172A;" />
                    {{ locale === 'de' ? 'Als Endkunde' : 'As End Customer' }}
                  </button>
                  <div class="border-t border-gray-100 my-1"></div>
                  <RouterLink
                    to="/login"
                    @click="devDropdownOpen = false"
                    class="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-primary-900 transition-colors"
                  >
                    {{ locale === 'de' ? 'Normale Anmeldung →' : 'Normal login →' }}
                  </RouterLink>
                </div>
              </Transition>
            </div>
            <RouterLink
              to="/register"
              class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
              style="background-color: #0F172A;"
            >
              {{ t('landing.nav.getQuote') }}
            </RouterLink>
            <!-- Mobile menu button -->
            <button
              @click="menuOpen = !menuOpen"
              class="md:hidden p-2 rounded-md text-gray-500 hover:text-primary-900 hover:bg-gray-100 transition-colors"
            >
              <Menu v-if="!menuOpen" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="menuOpen" class="md:hidden pb-4 border-t border-gray-100 mt-2">
            <div class="flex flex-col gap-1 pt-3">
              <a href="#how-it-works" @click="menuOpen = false" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-900 hover:bg-gray-50 rounded-lg transition-colors">
                {{ t('landing.nav.howItWorks') }}
              </a>
              <a href="#solutions" @click="menuOpen = false" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-900 hover:bg-gray-50 rounded-lg transition-colors">
                {{ t('landing.nav.solutions') }}
              </a>
              <a href="#faq" @click="menuOpen = false" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-900 hover:bg-gray-50 rounded-lg transition-colors">
                FAQ
              </a>
              <RouterLink to="/login" @click="menuOpen = false" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-900 hover:bg-gray-50 rounded-lg transition-colors sm:hidden">
                {{ t('landing.nav.login') }}
              </RouterLink>
            </div>
          </div>
        </Transition>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20" style="background: radial-gradient(circle, #3B82F6 0%, transparent 70%);"></div>
        <div class="absolute top-1/2 -left-32 w-64 h-64 rounded-full opacity-15" style="background: radial-gradient(circle, #6366F1 0%, transparent 70%);"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Left: Text -->
          <div class="max-w-xl reveal">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style="background-color: #EFF6FF; color: #1D4ED8;">
              <Sparkles class="w-3.5 h-3.5" />
              {{ locale === 'de' ? 'KI-gestützt' : 'AI-Powered' }}
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-900 font-headline leading-[1.1] tracking-tight">
              {{ t('landing.hero.headline') }}
            </h1>
            <p class="mt-6 text-lg text-gray-500 leading-relaxed">
              {{ t('landing.hero.subheadline') }}
            </p>
            <div class="mt-8 flex flex-wrap gap-4">
              <RouterLink
                to="/register"
                class="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style="background-color: #0F172A; box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.4);"
              >
                <Package class="w-5 h-5 mr-2" />
                {{ t('landing.hero.planMove') }}
              </RouterLink>
              <RouterLink
                to="/register"
                class="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-xl transition-all border-2 hover:shadow-md hover:-translate-y-0.5"
                style="color: #0F172A; border-color: #0F172A;"
              >
                <Building2 class="w-5 h-5 mr-2" />
                {{ t('landing.hero.registerCompany') }}
              </RouterLink>
            </div>
          </div>

          <!-- Right: Hero Illustration -->
          <div class="relative lg:h-[500px] flex items-center justify-center reveal-scale">
            <div class="relative w-full max-w-md">
              <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30" style="background: radial-gradient(circle, #3B82F6 0%, transparent 70%);"></div>
              <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-25" style="background: radial-gradient(circle, #6366F1 0%, transparent 70%);"></div>

              <div class="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #0F172A;">
                      <Home class="w-4 h-4 text-white" />
                    </div>
                    <span class="text-sm font-semibold text-gray-700">MyMove Scan</span>
                  </div>
                  <div class="flex gap-1">
                    <div class="w-2 h-2 rounded-full" style="background-color: #3B82F6;"></div>
                    <div class="w-2 h-2 rounded-full bg-gray-200"></div>
                    <div class="w-2 h-2 rounded-full bg-gray-200"></div>
                  </div>
                </div>

                <div class="p-5">
                  <div class="relative rounded-2xl overflow-hidden mb-4" style="background: linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%); aspect-ratio: 4/3;">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="text-center">
                        <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3" style="background-color: rgba(59, 130, 246, 0.15);">
                          <Video class="w-8 h-8" style="color: #3B82F6;" />
                        </div>
                        <p class="text-xs font-medium" style="color: #64748B;">{{ locale === 'de' ? 'Räume filmen...' : 'Recording rooms...' }}</p>
                      </div>
                    </div>
                    <div class="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-sm" style="border-color: #3B82F6;"></div>
                    <div class="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 rounded-tr-sm" style="border-color: #3B82F6;"></div>
                    <div class="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 rounded-bl-sm" style="border-color: #3B82F6;"></div>
                    <div class="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 rounded-br-sm" style="border-color: #3B82F6;"></div>

                    <div class="absolute top-1/4 left-1/4 px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1" style="background-color: rgba(15, 23, 42, 0.8);">
                      <Sofa class="w-3 h-3" /> Sofa
                    </div>
                    <div class="absolute top-1/3 right-1/4 px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1" style="background-color: rgba(59, 130, 246, 0.9);">
                      <Tv class="w-3 h-3" /> TV
                    </div>
                    <div class="absolute bottom-1/3 left-1/3 px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1" style="background-color: rgba(99, 102, 241, 0.9);">
                      <Lamp class="w-3 h-3" /> Lampe
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium text-gray-500">{{ locale === 'de' ? 'Erkannt' : 'Detected' }}</span>
                    <span class="text-xs font-bold" style="color: #3B82F6;">24 {{ locale === 'de' ? 'Gegenstände' : 'Items' }}</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div class="h-full rounded-full" style="width: 78%; background-color: #3B82F6;"></div>
                  </div>
                </div>
              </div>

              <div class="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-48">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: #EFF6FF;">
                    <CheckCircle class="w-3.5 h-3.5" style="color: #3B82F6;" />
                  </div>
                  <span class="text-xs font-semibold text-gray-700">{{ locale === 'de' ? 'Angebot bereit' : 'Quote Ready' }}</span>
                </div>
                <p class="text-lg font-bold font-headline" style="color: #0F172A;">€ ...</p>
                <p class="text-[10px] text-gray-400">{{ locale === 'de' ? 'Angebote verfügbar' : 'Offers available' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section id="how-it-works" class="py-20 lg:py-28" style="background-color: #FAFBFC;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight" style="color: #0F172A;">
            {{ t('landing.howItWorks.title') }}
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            {{ t('landing.howItWorks.subtitle') }}
          </p>
        </div>

        <!-- Desktop: Horizontal Timeline -->
        <div class="hidden lg:block reveal">
          <div class="relative">
            <div class="absolute top-10 left-[10%] right-[10%] h-0.5" style="background: linear-gradient(to right, #0F172A, #3B82F6, #6366F1, #3B82F6, #0F172A);"></div>

            <div class="grid grid-cols-5 gap-4 relative">
              <div v-for="step in 5" :key="step" class="flex flex-col items-center text-center">
                <div
                  class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border-4 border-white shadow-lg z-10"
                  :style="{ backgroundColor: stepColors[step - 1] }"
                >
                  <component :is="stepIcons[step - 1]" class="w-8 h-8 text-white" />
                </div>
                <span class="text-xs font-bold uppercase tracking-wider mb-2" style="color: #3B82F6;">0{{ step }}</span>
                <h3 class="text-base font-bold font-headline mb-2" style="color: #0F172A;">
                  {{ t(`landing.howItWorks.steps.${step}.title`) }}
                </h3>
                <p class="text-sm text-gray-500 leading-relaxed px-2">
                  {{ t(`landing.howItWorks.steps.${step}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: Vertical Timeline -->
        <div class="lg:hidden">
          <div class="relative max-w-md mx-auto">
            <div class="absolute left-8 top-0 bottom-0 w-0.5" style="background: linear-gradient(to bottom, #0F172A, #3B82F6, #6366F1, #3B82F6, #0F172A);"></div>

            <div class="space-y-10">
              <div v-for="step in 5" :key="step" class="flex gap-5 reveal" :class="'reveal-delay-' + step">
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0 z-10"
                  :style="{ backgroundColor: stepColors[step - 1] }"
                >
                  <component :is="stepIcons[step - 1]" class="w-7 h-7 text-white" />
                </div>
                <div class="pt-1">
                  <span class="text-xs font-bold uppercase tracking-wider" style="color: #3B82F6;">0{{ step }}</span>
                  <h3 class="text-lg font-bold font-headline mt-1 mb-1" style="color: #0F172A;">
                    {{ t(`landing.howItWorks.steps.${step}.title`) }}
                  </h3>
                  <p class="text-sm text-gray-500 leading-relaxed">
                    {{ t(`landing.howItWorks.steps.${step}.description`) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- For Customers -->
    <section class="py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="reveal-left">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style="background-color: #EFF6FF; color: #1D4ED8;">
              <User class="w-3.5 h-3.5" />
              {{ locale === 'de' ? 'Für Privatkunden' : 'For Individuals' }}
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight mb-4" style="color: #0F172A;">
              {{ t('landing.forCustomers.title') }}
            </h2>
            <p class="text-lg text-gray-500 mb-8">
              {{ t('landing.forCustomers.subtitle') }}
            </p>

            <div class="space-y-5">
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EFF6FF;">
                  <Video class="w-5 h-5" style="color: #3B82F6;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCustomers.features.video.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCustomers.features.video.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EEF2FF;">
                  <Zap class="w-5 h-5" style="color: #6366F1;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCustomers.features.quotes.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCustomers.features.quotes.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EFF6FF;">
                  <ShieldCheck class="w-5 h-5" style="color: #3B82F6;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCustomers.features.verified.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCustomers.features.verified.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EEF2FF;">
                  <MapPin class="w-5 h-5" style="color: #6366F1;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCustomers.features.tracking.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCustomers.features.tracking.description') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative flex items-center justify-center reveal-right">
            <div class="relative w-full max-w-sm">
              <div class="absolute inset-0 rounded-3xl opacity-20" style="background: linear-gradient(135deg, #3B82F6, #6366F1); transform: rotate(-3deg);"></div>
              <div class="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: #0F172A;">
                    <User class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ locale === 'de' ? 'Ihr Umzug' : 'Your Move' }}</p>
                    <p class="text-xs text-gray-400">{{ locale === 'de' ? 'Auftrag erstellt' : 'Request created' }}</p>
                  </div>
                  <div class="ml-auto px-2 py-1 rounded-md text-[10px] font-bold text-white" style="background-color: #3B82F6;">
                    {{ locale === 'de' ? 'In Bearbeitung' : 'In Progress' }}
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: #FAFBFC;">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #EFF6FF;">
                        <Truck class="w-4 h-4" style="color: #3B82F6;" />
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">{{ locale === 'de' ? 'Umzugsfirma' : 'Moving Company' }}</p>
                        <div class="flex items-center gap-0.5">
                          <Star v-for="s in 5" :key="s" class="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    </div>
                    <p class="text-sm font-bold" style="color: #0F172A;">€ ...</p>
                  </div>

                  <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: #FAFBFC;">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #EEF2FF;">
                        <Package class="w-4 h-4" style="color: #6366F1;" />
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">{{ locale === 'de' ? 'Inventar' : 'Inventory' }}</p>
                        <p class="text-[10px] text-gray-400">{{ locale === 'de' ? 'KI-basiert erfasst' : 'AI-detected' }}</p>
                      </div>
                    </div>
                    <CheckCircle class="w-5 h-5" style="color: #3B82F6;" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- For Companies -->
    <section id="solutions" class="py-20 lg:py-28" style="background-color: #FAFBFC;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="relative flex items-center justify-center order-2 lg:order-1 reveal-left">
            <div class="relative w-full max-w-sm">
              <div class="absolute inset-0 rounded-3xl opacity-20" style="background: linear-gradient(135deg, #6366F1, #3B82F6); transform: rotate(3deg);"></div>
              <div class="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: #3B82F6;">
                    <Building2 class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ locale === 'de' ? 'Ihr Firmenkonto' : 'Your Business Account' }}</p>
                    <p class="text-xs text-gray-400">{{ locale === 'de' ? 'Partner-Dashboard' : 'Partner Dashboard' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="p-3 rounded-xl" style="background-color: #FAFBFC;">
                    <p class="text-[10px] text-gray-400 uppercase font-semibold">{{ locale === 'de' ? 'Anfragen' : 'Requests' }}</p>
                    <p class="text-xl font-bold font-headline mt-1" style="color: #0F172A;">...</p>
                    <p class="text-[10px]" style="color: #3B82F6;">{{ locale === 'de' ? 'Neue Anfragen' : 'New requests' }}</p>
                  </div>
                  <div class="p-3 rounded-xl" style="background-color: #FAFBFC;">
                    <p class="text-[10px] text-gray-400 uppercase font-semibold">{{ locale === 'de' ? 'Umsatz' : 'Revenue' }}</p>
                    <p class="text-xl font-bold font-headline mt-1" style="color: #0F172A;">€ ...</p>
                    <p class="text-[10px]" style="color: #3B82F6;">{{ locale === 'de' ? 'Diesen Monat' : 'This month' }}</p>
                  </div>
                </div>

                <div class="p-3 rounded-xl" style="background-color: #FAFBFC;">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-semibold text-gray-700">{{ locale === 'de' ? 'Nächster Auftrag' : 'Next Job' }}</p>
                    <span class="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style="background-color: #3B82F6;">AI</span>
                  </div>
                  <div class="flex items-center gap-2 text-[10px] text-gray-500">
                    <MapPin class="w-3 h-3" />
                    <span>{{ locale === 'de' ? 'Von → Nach' : 'From → To' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                    <Users class="w-3 h-3" />
                    <span>{{ locale === 'de' ? 'KI-basierte Planung' : 'AI-based planning' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="order-1 lg:order-2 reveal-right">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style="background-color: #EEF2FF; color: #4338CA;">
              <Building2 class="w-3.5 h-3.5" />
              {{ locale === 'de' ? 'Für Unternehmen' : 'For Businesses' }}
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight mb-4" style="color: #0F172A;">
              {{ t('landing.forCompanies.title') }}
            </h2>
            <p class="text-lg text-gray-500 mb-8">
              {{ t('landing.forCompanies.subtitle') }}
            </p>

            <div class="space-y-5">
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EEF2FF;">
                  <Target class="w-5 h-5" style="color: #6366F1;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCompanies.features.leads.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCompanies.features.leads.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EFF6FF;">
                  <Brain class="w-5 h-5" style="color: #3B82F6;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCompanies.features.ai.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCompanies.features.ai.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EEF2FF;">
                  <Star class="w-5 h-5" style="color: #6366F1;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCompanies.features.reviews.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCompanies.features.reviews.description') }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #EFF6FF;">
                  <CreditCard class="w-5 h-5" style="color: #3B82F6;" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ t('landing.forCompanies.features.payments.title') }}</h4>
                  <p class="text-sm text-gray-500">{{ t('landing.forCompanies.features.payments.description') }}</p>
                </div>
              </div>
            </div>

            <RouterLink
              to="/register"
              class="group inline-flex items-center mt-8 text-sm font-semibold transition-colors"
              style="color: #3B82F6;"
            >
              {{ t('landing.forCompanies.cta') }}
              <ArrowRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight" style="color: #0F172A;">
            {{ t('landing.testimonials.title') }}
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            {{ t('landing.testimonials.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-shadow reveal" :class="'reveal-delay-' + i">
            <div class="flex items-center gap-1 mb-4">
              <Star v-for="s in 5" :key="s" class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-gray-600 leading-relaxed mb-6 italic">
              "{{ t(`landing.testimonials.items.${i}.quote`) }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background-color: #0F172A;">
                {{ t(`landing.testimonials.items.${i}.author`).charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ t(`landing.testimonials.items.${i}.author`) }}</p>
                <p class="text-xs text-gray-400">{{ t(`landing.testimonials.items.${i}.role`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-20 lg:py-28" style="background-color: #FAFBFC;">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight" style="color: #0F172A;">
            {{ t('landing.faq.title') }}
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            {{ t('landing.faq.subtitle') }}
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-white rounded-xl border border-gray-100 overflow-hidden reveal"
            :class="'reveal-delay-' + i"
          >
            <button
              @click="toggleFaq(i)"
              class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold text-gray-900 pr-4">{{ t(`landing.faq.items.${i}.question`) }}</span>
              <ChevronDown
                class="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                :class="openFaq === i ? 'rotate-180' : ''"
                style="color: #64748B;"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-if="openFaq === i" class="overflow-hidden">
                <p class="px-5 pb-5 text-gray-500 leading-relaxed">
                  {{ t(`landing.faq.items.${i}.answer`) }}
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="py-20 lg:py-24 relative overflow-hidden" style="background-color: #0F172A;">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style="background: radial-gradient(circle, #3B82F6 0%, transparent 70%);"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10" style="background: radial-gradient(circle, #6366F1 0%, transparent 70%);"></div>
      </div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-headline tracking-tight">
          {{ t('landing.ctaBanner.title') }}
        </h2>
        <p class="mt-4 text-lg max-w-xl mx-auto" style="color: #94A3B8;">
          {{ t('landing.ctaBanner.subtitle') }}
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
          <RouterLink
            to="/register"
            class="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl transition-colors hover:bg-gray-100"
            style="background-color: white; color: #0F172A;"
          >
            {{ t('landing.ctaBanner.customerButton') }}
          </RouterLink>
          <RouterLink
            to="/register"
            class="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl transition-colors hover:bg-white/10"
            style="color: white; border: 2px solid rgba(255,255,255,0.2);"
          >
            {{ t('landing.ctaBanner.companyButton') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer style="background-color: #020617;" class="border-t border-gray-800 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="/assets/img/MyMoveLogoSchrift.png"
            alt="MyMove"
            class="h-10 w-auto object-contain brightness-0 invert"
          />
          <div class="flex items-center gap-6">
            <a href="#" class="text-sm transition-colors hover:text-white" style="color: #64748B;">{{ t('landing.footer.privacy') }}</a>
            <a href="#" class="text-sm transition-colors hover:text-white" style="color: #64748B;">{{ t('landing.footer.terms') }}</a>
            <a href="#" class="text-sm transition-colors hover:text-white" style="color: #64748B;">{{ t('landing.footer.support') }}</a>
            <a href="#" class="text-sm transition-colors hover:text-white" style="color: #64748B;">{{ t('landing.footer.careers') }}</a>
          </div>
          <p class="text-sm" style="color: #334155;">
            © {{ new Date().getFullYear() }} {{ t('landing.footer.copyright') }}
          </p>
        </div>
      </div>
    </footer>

    <!-- Cookie Banner -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <div
        v-if="!cookiesAccepted"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-600 text-center sm:text-left">
            {{ t('landing.cookieBanner.text') }}
          </p>
          <button
            @click="acceptCookies"
            class="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            style="background-color: #0F172A;"
          >
            {{ t('landing.cookieBanner.accept') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Package,
  Building2,
  Home,
  Sofa,
  Lamp,
  Tv,
  Video,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Truck,
  User,
  Zap,
  MapPin,
  Target,
  Brain,
  Star,
  CreditCard,
  Users,
  ArrowRight,
  UserPlus,
  Search,
  Send,
  ClipboardCheck,
  Menu,
  X,
  ChevronDown,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const toggleLocale = () => {
  locale.value = locale.value === 'de' ? 'en' : 'de'
}

const devDropdownOpen = ref(false)

async function handleDevLogin(role: 'admin' | 'company' | 'end_customer') {
  devDropdownOpen.value = false
  const success = await auth.devLogin(role)
  if (success) {
    if (role === 'company') {
      router.push('/company/dashboard')
    } else if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }
}

// Mobile menu
const menuOpen = ref(false)

// Navbar scroll effect
const scrolled = ref(false)
const onScroll = () => {
  scrolled.value = window.scrollY > 10
}

// Scroll reveal animation
const observer = shallowRef<IntersectionObserver | null>(null)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.value?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  const revealSelectors = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale']
  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const rect = el.getBoundingClientRect()
      // If element is already in viewport, show it immediately
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('reveal-visible')
      } else {
        observer.value?.observe(el)
      }
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  observer.value?.disconnect()
})

// FAQ accordion
const openFaq = ref<number | null>(null)
const toggleFaq = (i: number) => {
  openFaq.value = openFaq.value === i ? null : i
}

// Cookie banner
const cookiesAccepted = ref(true)
onMounted(() => {
  cookiesAccepted.value = localStorage.getItem('cookiesAccepted') === 'true'
})
const acceptCookies = () => {
  localStorage.setItem('cookiesAccepted', 'true')
  cookiesAccepted.value = true
}

// How it Works step config
const stepColors = ['#0F172A', '#3B82F6', '#6366F1', '#3B82F6', '#0F172A']
const stepIcons = [UserPlus, Video, Search, Send, ClipboardCheck]
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-left {
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-right {
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-scale {
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0) translateX(0) scale(1);
}
.reveal-delay-1 { transition-delay: 0.08s; }
.reveal-delay-2 { transition-delay: 0.16s; }
.reveal-delay-3 { transition-delay: 0.24s; }
.reveal-delay-4 { transition-delay: 0.32s; }
</style>
