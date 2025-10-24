<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

// Headers pour JSON
header('Content-Type: application/json');

// Vérifier que la requête est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validation des données
if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

if (!isset($data['titre']) || empty(trim($data['titre']))) {
    echo json_encode(['success' => false, 'message' => 'Titre manquant']);
    exit;
}

if (!isset($data['type']) || empty($data['type'])) {
    echo json_encode(['success' => false, 'message' => 'Type manquant']);
    exit;
}

if (!isset($data['contenu']) || empty(trim($data['contenu']))) {
    echo json_encode(['success' => false, 'message' => 'Contenu manquant']);
    exit;
}

try {
    // Nettoyer les données
    $id = intval($data['id']);
    $titre = trim($data['titre']);
    $type = trim($data['type']);
    $contenu = trim($data['contenu']);

    // Vérifier d'abord si l'information existe
    $select = new Select();
    $informationExistante = $select->getRow("SELECT * FROM information WHERE id = :id", ["id" => $id]);

    if (!$informationExistante) {
        echo json_encode(['success' => false, 'message' => 'Information non trouvée']);
        exit;
    }

    // Modifier l'information dans la base de données - CORRECTION DU NOM DE TABLE
    $db = Database::getInstance();
    $cmd = $db->prepare("UPDATE information SET titre = :titre, type = :type, contenu = :contenu WHERE id = :id");
    $resultat = $cmd->execute([
        "titre" => $titre,
        "type" => $type,
        "contenu" => $contenu,
        "id" => $id
    ]);

    if ($resultat) {
        echo json_encode([
            'success' => true,
            'message' => 'Information modifiée avec succès'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la modification en base de données'
        ]);
    }

} catch (Exception $e) {
    error_log("Erreur modification information: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}