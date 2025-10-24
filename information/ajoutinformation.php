<?php

require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérification des droits d'accès
if (!isset($_SESSION['membre'])) {
    header('Location: /connexion.php');
    exit;
}

$titre = "Ajout d'une information";
$lesParametres = json_encode(Information::getConfig());

$head =<<<HTML
    <script>
         const lesParametres = $lesParametres;
    </script>
    
HTML;

require RACINE . '/include/interface.php';