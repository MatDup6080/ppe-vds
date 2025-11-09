<?php

require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérification des droits d'accès
if (!isset($_SESSION['membre'])) {
    header('Location: /connexion.php');
    exit;
}

$titre = "Ajout d'un document";

// Récupération de l'ID de l'information depuis l'URL (optionnel)
$idInformation = isset($_GET['idInformation']) ? (int)$_GET['idInformation'] : 0;

// Récupération des informations pour le select
$informations = Information::getInformation();
$informationsJson = json_encode($informations, JSON_UNESCAPED_UNICODE);

// Récupération des paramètres pour les fichiers PDF
$lesParametres = json_encode(FichierPDF::getConfig(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$head = <<<HTML
<script>
const lesInformations = $informationsJson;
const lesParametres = $lesParametres;
const idInformationPreSelectionne = $idInformation;
</script>
HTML;

require RACINE . '/include/interface.php';