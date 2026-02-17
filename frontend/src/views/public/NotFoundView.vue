<template>
  <v-app>
    <v-main class="d-flex align-center justify-center">
      <v-container class="text-center">
        <v-icon size="128" color="grey-lighten-1" class="mb-4">
          mdi-page-layout-body
        </v-icon>
        <h1 class="text-h2 mb-4">404</h1>
        <h2 class="text-h4 mb-6">Seite nicht gefunden</h2>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        <v-btn color="primary" to="/">
          Zurück zur Startseite
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>
