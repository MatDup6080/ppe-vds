<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérification de l'authentification
if (!isset($_SESSION['membre'])) {
    Erreur::envoyerReponse("Accès non autorisé", 'global');
}

// Contrôle sur le fichier téléversé
if (!isset($_FILES['fichier'])) {
    Erreur::envoyerReponse("Le fichier n'a pas été transmis", 'global');
}

// Vérification des données obligatoires
if (!isset($_POST['idInformation'], $_POST['date'], $_POST['titre'])) {
    Erreur::envoyerReponse("Toutes les données attendues ne sont pas transmises", 'global');
}

try {
    // Instanciation et paramétrage d'un objet InputFile
    $file = new InputFile($_FILES['fichier'], FichierPDF::getConfig());

    // Vérifie la validité du fichier
    if (!$file->checkValidity()) {
        Erreur::envoyerReponse($file->getValidationMessage(), 'global');
    }

    // Vérifier que l'information existe
    $idInformation = (int)$_POST['idInformation'];
    $information = Information::getInformationById($idInformation);
    if (!$information) {
        Erreur::envoyerReponse("L'information sélectionnée n'existe pas", 'global');
    }

    // Préparation des données
    $donnees = [
        'date' => $_POST['date'],
        'titre' => trim($_POST['titre']),
        'fichier' => $file->Value,
        'idInformation' => $idInformation,
        'nbDemande' => 0
    ];

    // Validation des données
    $erreurs = DocumentInformation::validerDonnees($donnees);
    if (!empty($erreurs)) {
        Erreur::envoyerReponse(implode(', ', $erreurs), 'global');
    }

    // Ajout dans la table documentInformation
    $id = DocumentInformation::inserer($donnees);

    // Copie du fichier dans le répertoire de stockage
    $ok = $file->copy();

    // En cas d'échec, supprimer l'enregistrement créé
    if (!$ok) {
        DocumentInformation::supprimer($id);
        Erreur::envoyerReponse("L'ajout a échoué car le fichier PDF n'a pas pu être téléversé", 'global');
    }

    $reponse = ['success' => $id];
    echo json_encode($reponse, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    Erreur::envoyerReponse("Erreur lors de l'ajout du document: " . $e->getMessage(), 'global');
}