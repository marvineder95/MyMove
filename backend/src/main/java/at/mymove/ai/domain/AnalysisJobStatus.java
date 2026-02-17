package at.mymove.ai.domain;

/**
 * Status einer Video-Analyse.
 *
 * Lifecycle:
 * PENDING ──▶ RUNNING ──▶ SUCCEEDED
 *                │
 *                └──▶ FAILED
 */
public enum AnalysisJobStatus {
    PENDING,    // Job erstellt, wartet auf Start
    RUNNING,    // Analyse läuft
    SUCCEEDED,  // Analyse erfolgreich abgeschlossen
    FAILED      // Analyse fehlgeschlagen
}
