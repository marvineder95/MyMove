# MyMove Layout Komponenten

## Erstellte Dateien

### 1. LanguageSwitcher.vue (3,313 Bytes)
- Dropdown für DE/EN Sprachauswahl
- Zeigt aktuelle Sprache mit Flagge an
- Speichert Auswahl in localStorage
- Dark Mode: bg-slate-800, text-white
- Smooth Transition Animationen
- Schließt bei Klick außerhalb

### 2. Navbar.vue (8,504 Bytes)
- Fixed top, z-50
- Glassmorphism: bg-white/80 dark:bg-slate-900/80, backdrop-blur-md
- Logo "MyMove" mit Gradient Icon
- Navigation Links mit RouterLink
- Public: Home, Register, Login
- Authenticated: Dashboard, My Moves, Profile, Logout
- Rechts: LanguageSwitcher + DarkModeToggle
- Mobile: Hamburger Menu mit Slide Animation
- Scroll-Shadow Effekt
- Smooth transitions

### 3. Footer.vue (11,471 Bytes)
- 4 Spalten Layout:
  - Über uns (Logo, Beschreibung, Social Media)
  - Links (Home, Register, Login, About)
  - Rechtliches (Privacy, Terms, Imprint, Cookies)
  - Kontakt (Adresse, Email, Telefon)
- Social Media Icons (Facebook, Twitter, Instagram)
- Copyright Zeile mit LanguageSwitcher & DarkModeToggle
- Dark Mode: bg-slate-900
- Responsive Grid Layout

### 4. MainLayout.vue (1,415 Bytes)
- Nutzt Navbar und Footer
- RouterView in main Container
- Min-h-screen, flex-col
- Padding für fixed Navbar (pt-16)
- Page Transition Animationen
- Initialisiert Theme und Locale

## Benötigte i18n Übersetzungen

```json
{
  "nav": {
    "home": "Home",
    "register": "Registrieren",
    "login": "Anmelden",
    "dashboard": "Dashboard",
    "myMoves": "Meine Umzüge",
    "profile": "Profil",
    "logout": "Abmelden"
  },
  "footer": {
    "aboutText": "MyMove ist Ihre zuverlässige Plattform für stressfreie Umzüge. Wir verbinden Sie mit professionellen Umzugsunternehmen.",
    "aboutUs": "Über uns",
    "links": "Links",
    "legal": "Rechtliches",
    "contact": "Kontakt",
    "privacy": "Datenschutz",
    "terms": "Nutzungsbedingungen",
    "imprint": "Impressum",
    "cookies": "Cookies",
    "copyright": "© {year} MyMove. Alle Rechte vorbehalten."
  }
}
```

## Benötigte Stores

### auth.ts (Pinia Store)
```typescript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),
  actions: {
    async logout() {
      // Logout logic
      this.user = null
      this.isAuthenticated = false
    }
  }
})
```

### theme.ts (Pinia Store)
```typescript
export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  actions: {
    initTheme() {
      // Initialize theme from localStorage or system preference
    },
    toggleTheme() {
      this.isDark = !this.isDark
    }
  }
})
```

## Benötigte Komponente

### DarkModeToggle.vue
Muss in `../Theme/DarkModeToggle.vue` existieren mit:
- Toggle Button für Dark/Light Mode
- Sun/Moon Icons
- Integration mit theme Store

## Tailwind CSS Konfiguration

Erfordert custom colors in tailwind.config.js:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  }
}
```

## Verwendung

```vue
<template>
  <MainLayout />
</template>

<script setup lang="ts">
import MainLayout from '@/components/Layout/MainLayout.vue'
</script>
```

## Dateipfade

Alle Dateien wurden erfolgreich erstellt in:
- `/mnt/okcomputer/output/frontend/src/components/Layout/LanguageSwitcher.vue`
- `/mnt/okcomputer/output/frontend/src/components/Layout/Navbar.vue`
- `/mnt/okcomputer/output/frontend/src/components/Layout/Footer.vue`
- `/mnt/okcomputer/output/frontend/src/components/Layout/MainLayout.vue`
