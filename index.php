<?php
declare(strict_types=1);

require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Chargement des données
$titre = "Site du VDS";

// Chargement des derniers classements présents dans le répertoire 'data/classement'
$lesClassements = Classement::getAll();
$lesClassementsJson = json_encode($lesClassements);

// Prochaine édition des 4 saisons
$prochaineEdition = Epreuve::getProchaineEpreuve();
$prochaineEditionJson = json_encode($prochaineEdition);

// Récupérer les informations avec leurs documents
$informationsAvecDocuments = [];
$informationsBrutes = Information::getInformation();

foreach ($informationsBrutes as $info) {
    // Pour chaque information, récupérer ses documents associés
    $documents = DocumentInformation::getDocumentsByInformation($info['id']);
    $informationsAvecDocuments[] = [
        'id' => $info['id'],
        'type' => $info['type'],
        'titre' => $info['titre'],
        'contenu' => $info['contenu'],
        'auteur' => $info['auteur'],
        'date_creation' => $info['date_creation'],
        'datefr' => $info['datefr'] ?? '',
        'documents' => $documents // Ajout des documents associés
    ];
}

$informationsJson = json_encode($informationsAvecDocuments);

// transmission des données à l'interface
$head = <<<HTML
    <script>
        const prochaineEdition = $prochaineEditionJson;
        const lesClassements = $lesClassementsJson;
        const informations = $informationsJson;
    </script>
HTML;

// chargement de l'interface
require RACINE . "/include/interface.php";