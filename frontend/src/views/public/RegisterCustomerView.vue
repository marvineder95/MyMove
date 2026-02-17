<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-title>MyMove</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/">Zurück</v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-6">
              <v-card-title class="text-h5 text-center mb-2">
                Umzug starten
              </v-card-title>
              <v-card-subtitle class="text-center mb-6">
                Als Kunde können Sie direkt mit Ihrem Umzug beginnen
              </v-card-subtitle>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-6"
              >
                <p class="mb-2">
                  Als Kunde benötigen Sie keine separate Registrierung.
                </p>
                <p class="mb-0">
                  Sie können direkt mit dem <strong>Umzugswizard</strong> starten 
                  und Ihre Anfrage erstellen.
                </p>
              </v-alert>

              <div class="text-center">
                <v-btn
                  color="primary"
                  size="large"
                  to="/customer/wizard"
                  prepend-icon="mdi-arrow-right"
                >
                  Zum Umzugswizard
                </v-btn>
              </div>

              <v-divider class="my-6" />

              <div class="text-center">
                <p class="text-body-2 text-medium-emphasis mb-2">
                  Bereits registriert?
                </p>
                <v-btn
                  variant="text"
                  to="/login"
                >
                  Hier anmelden
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
