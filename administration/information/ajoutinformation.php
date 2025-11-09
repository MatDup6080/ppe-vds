<?php

require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérification des droits d'accès
if (!isset($_SESSION['membre'])) {
    header('Location: /connexion.php');
    exit;
}

$titre = "Ajout d'une information";

// Récupération des paramètres pour les informations
$lesParametresInfo = json_encode(Information::getConfig());

// Récupération des paramètres pour les fichiers PDF
$lesParametresFichier = json_encode(FichierPDF::getConfig(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// Récupération des fichiers PDF
$lesFichiers = json_encode(FichierPDF::getAll(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$head = <<<HTML
<script src='/composant/tinymce/tinymce.min.js' referrerpolicy='origin'></script>
<script>
const lesParametresInfo = $lesParametresInfo;
const lesParametresFichier = $lesParametresFichier;
const lesFichiers = $lesFichiers;
</script>
HTML;

require RACINE . '/include/interface.php';