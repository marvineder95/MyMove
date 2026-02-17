<template>
  <v-app>
    <!-- Hero Section -->
    <v-app-bar color="primary" flat>
      <v-app-bar-title class="text-h5 font-weight-bold">
        MyMove
      </v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/login" class="mr-2">
        Anmelden
      </v-btn>
      <v-btn variant="outlined" to="/register/customer">
        Umzug starten
      </v-btn>
    </v-app-bar>

    <v-main>
      <!-- Hero -->
      <v-container fluid class="hero-section py-16">
        <v-row justify="center" align="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h2 font-weight-bold mb-6">
              Ihr Umzug, einfach & transparent
            </h1>
            <p class="text-h6 text-medium-emphasis mb-8">
              Laden Sie ein Video Ihrer Räume hoch, wir analysieren Ihr Inventar 
              und Sie erhalten vergleichbare Angebote von geprüften Umzugsfirmen.
            </p>
            <div class="d-flex justify-center gap-4">
              <v-btn 
                color="primary" 
                size="large" 
                to="/register/customer"
                prepend-icon="mdi-video"
              >
                Kostenlos Angebot einholen
              </v-btn>
              <v-btn 
                variant="outlined" 
                size="large" 
                to="/register/company"
                prepend-icon="mdi-domain"
              >
                Als Firma registrieren
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- How it works -->
      <v-container class="py-12">
        <h2 class="text-h4 text-center mb-12">So funktioniert's</h2>
        
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="text-center pa-6 h-100">
              <v-icon size="64" color="primary" class="mb-4">mdi-video</v-icon>
              <h3 class="text-h6 mb-2">1. Video aufnehmen</h3>
              <p class="text-body-2 text-medium-emphasis">
                Gehen Sie durch Ihre Räume und filmen Sie Ihr Inventar. 
                Unsere KI erkennt automatisch Ihre Möbel und Gegenstände.
              </p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card class="text-center pa-6 h-100">
              <v-icon size="64" color="primary" class="mb-4">mdi-clipboard-list</v-icon>
              <h3 class="text-h6 mb-2">2. Inventar prüfen</h3>
              <p class="text-body-2 text-medium-emphasis">
                Überprüfen und ergänzen Sie das erkannte Inventar. 
                Sie haben die volle Kontrolle über Ihre Umzugsliste.
              </p>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card class="text-center pa-6 h-100">
              <v-icon size="64" color="primary" class="mb-4">mdi-offer</v-icon>
              <h3 class="text-h6 mb-2">3. Angebote vergleichen</h3>
              <p class="text-body-2 text-medium-emphasis">
                Erhalten Sie transparente Preisschätzungen und 
                vergleichbare Angebote von geprüften Umzugsfirmen.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Footer -->
      <v-footer class="bg-grey-lighten-3 py-6">
        <v-container class="text-center">
          <p class="text-body-2 text-medium-emphasis">
            © {{ new Date().getFullYear() }} MyMove - Ihr Umzugspartner
          </p>
        </v-container>
      </v-footer>
    </v-main>
  </v-app>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: 60vh;
  display: flex;
  align-items: center;
}
</style>
