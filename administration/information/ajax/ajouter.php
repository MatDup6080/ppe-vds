<?php
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

if (!isset($_SESSION['membre'])) {
    Erreur::envoyerReponse("Accès non autorisé", 'global');
}

$information = new Information();

if (!$information->donneesTransmises()) {
    Erreur::envoyerReponse("Toutes les données attendues ne sont pas transmises", 'global');
}

if (!$information->checkAll()) {
    Erreur::envoyerReponse("Certaines données transmises ne sont pas valides", 'global');
}

$information->setValue('date_creation', date('Y-m-d H:i:s'));


$information->insert();

$id = $information->getLastInsertId();

$reponse = ['success' => $id];
echo json_encode($reponse, JSON_UNESCAPED_UNICODE);