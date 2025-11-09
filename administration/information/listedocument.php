<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérification des droits d'accès
if (!isset($_SESSION['membre'])) {
    header('Location: /connexion.php');
    exit;
}

// Récupération de l'ID de l'information depuis l'URL
$idInformation = isset($_GET['idInformation']) ? (int)$_GET['idInformation'] : 0;

// Initialisation des variables
$lesDocuments = [];
$nomInformation = '';
$titre = "Liste des documents";

if ($idInformation > 0) {
    $lesDocuments = DocumentInformation::getDocumentsByInformation($idInformation);
    $information = Information::getInformationById($idInformation);
    if ($information) {
        $titre = "Documents - " . $information['titre'];
        $nomInformation = $information['titre'];
    } else {
        $titre = "Documents - Information inconnue";
    }
} else {
    $lesDocuments = DocumentInformation::getAllWithInformation();
}

// Récupération des paramètres PDF (comme dans index.php)
$lesParametresPDF = json_encode(FichierPDF::getConfig(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// Convertir en JSON
$lesDocumentsJson = json_encode($lesDocuments, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$nomInformationJson = json_encode($nomInformation, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$head = <<<HTML
<script>
const lesDocuments = $lesDocumentsJson;
const idInformation = $idInformation;
const nomInformation = $nomInformationJson;
const lesParametresPDF = $lesParametresPDF;
</script>
HTML;

require RACINE . '/include/interface.php';