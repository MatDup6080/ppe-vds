<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Vérifier que l'ID du document est fourni
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    die('ID de document invalide');
}

$idDocument = (int)$_GET['id'];

try {
    // Récupérer les informations du document
    $document = DocumentInformation::getDocumentById($idDocument);

    if (!$document) {
        http_response_code(404);
        die('Document non trouvé');
    }

    $cheminFichier = $_SERVER['DOCUMENT_ROOT'] . '/data/documentinformation/' . $document['fichier'];

    // Vérifier que le fichier existe
    if (!file_exists($cheminFichier)) {
        http_response_code(404);
        die('Fichier non trouvé');
    }

    // Incrémenter le compteur de demandes
    DocumentInformation::incrementerDemandes($idDocument);

    // Définir les headers pour l'affichage PDF
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $document['titre'] . '.pdf"');
    header('Content-Length: ' . filesize($cheminFichier));
    header('Cache-Control: private, max-age=0, must-revalidate');

    // Lire et output le fichier
    readfile($cheminFichier);

} catch (Exception $e) {
    http_response_code(500);
    die('Erreur lors de l\'affichage du document: ' . $e->getMessage());
}
?>