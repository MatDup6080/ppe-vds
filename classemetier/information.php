<?php
class Information extends table {
    public $id;
    public $type;
    public $titre;
    public $contenu;
    public $auteur;

    public static function getInformations() {
        if (isset($_SESSION['membre'])) {
            $sql = "SELECT id, type, titre, contenu, auteur FROM information;";
        } else {
            $sql = "SELECT id, type, titre, contenu, auteur FROM information WHERE type = 'publique';";
        }

        $select = new Select();
        return $select->getRows($sql);
    }
}