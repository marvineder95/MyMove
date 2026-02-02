package at.mymove.offer.domain;

public enum OfferStatus {
    DRAFT,          // angelegt, noch nicht rausgeschickt
    READY_TO_SEND,  // vollständig, kann raus
    SENT,           // Angebot ging an Kunden raus (ab hier Video löschen)
    FAILED          // Fehler beim Senden/Verarbeiten
}