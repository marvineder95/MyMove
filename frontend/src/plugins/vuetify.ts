import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { de, en } from 'vuetify/locale'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const customTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
}

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'de',
    fallback: 'en',
    messages: { de, en }
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VBtn: {
      variant: 'elevated'
    },
    VCard: {
      elevation: 2
    }
  }
})
