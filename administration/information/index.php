<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// chargement des données utilisées par l'interface
$titre = "Gestion des informations";

// Récupération des informations depuis la base de données
$dataInformations = Information::getInformation();
$informations = json_encode($dataInformations);

// Préparer les paramètres pour les fichiers
$lesParametres = json_encode([
    'accept' => '.pdf,.jpg,.png,.doc,.docx'
]);

$head = <<<HTML
    <script>
        let lesinformations = $informations;
        let lesParametres = $lesParametres;
    </script>
HTML;

// chargement interface
require RACINE . '/include/interface.php';