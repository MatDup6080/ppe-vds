<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// vérification de la transmission du paramètre
if (!isset($_POST["idDocument"])) {
    Erreur::envoyerReponse("L'identifiant du document à supprimer n'est pas transmis", 'global');
}

// récupération de l'ID du document
$idDocument = (int)$_POST['idDocument'];

try {
    // Récupérer le document pour avoir le nom du fichier
    $document = DocumentInformation::getDocumentById($idDocument);
    if (!$document) {
        Erreur::envoyerReponse("Document introuvable", 'global');
    }

    // suppression du fichier physique
    $resultat = FichierPDF::supprimer($document['fichier']);
    if (!$resultat['success']) {
        Erreur::envoyerReponse($resultat['message'], 'global');
    }

    // suppression de l'entrée en base de données
    DocumentInformation::supprimer($idDocument);

    // renvoi de la liste des documents mise à jour
    $idInformation = isset($_POST['idInformation']) ? (int)$_POST['idInformation'] : 0;
    if ($idInformation > 0) {
        $fichiers = DocumentInformation::getDocumentsByInformation($idInformation);
    } else {
        $fichiers = DocumentInformation::getAllWithInformation();
    }

    echo json_encode($fichiers, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    Erreur::envoyerReponse($e->getMessage(), 'global');
}