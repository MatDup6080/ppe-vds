<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Démarrer la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Vérifier si les données viennent en JSON
$input = json_decode(file_get_contents('php://input'), true);
if ($input && isset($input['id'])) {
    $id = (int)$input['id'];
} else {
    Erreur::envoyerReponse("Paramètre manquant", 'global');
}

// Vérification des droits
if (!isset($_SESSION['membre'])) {
    Erreur::envoyerReponse("Accès non autorisé", 'global');
}

// Suppression de l'enregistrement en base de données
Information::supprimer($id);

$reponse = ['success' => "L'information a été supprimée"];
echo json_encode($reponse, JSON_UNESCAPED_UNICODE);