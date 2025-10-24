<?php
/**
 * Classe gérant les informations (publiques et privées)
 * Gestion de la table 'information' avec les colonnes :
 *  - id : identifiant unique
 *  - type : type d'information ('publique' ou 'privee')
 *  - titre : titre de l'information
 *  - contenu : contenu textuel de l'information
 *  - auteur : auteur de l'information
 *  - date_creation : date de création
 *  - date_modification : date de modification
 */
class Information extends Table
{
    /**
     * Configuration centralisée des paramètres
     */
    private const CONFIG = [
        'types' => [
            'publique' => 'Publique',
            'privee' => 'Privée'
        ],
        // Longueurs minimales et maximales pour les champs texte
        'titre_min' => 5,
        'titre_max' => 100,
        'contenu_min' => 10,
        'contenu_max' => 1000,
        'auteur_max' => 50,
    ];

    public $id;
    public $type;
    public $titre;
    public $contenu;
    public $auteur;

    /**
     * Constructeur de la classe
     */
    public function __construct()
    {

        parent::__construct('information');

        // Validation de la colonne type - utiliser InputText au lieu de InputSelect
        $input = new InputText();
        $input->Require = true;
        $input->Pattern = "^(publique|privee)$"; // Validation par regex
        $this->columns['type'] = $input;

        // Validation de la colonne titre
        $input = new InputText();
        $input->Pattern = "^[0-9A-Za-zÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ](?:[,' \\-]?[0-9A-Za-zÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ])*$";
        $input->MinLength = self::CONFIG['titre_min'];
        $input->MaxLength = self::CONFIG['titre_max'];
        $input->SupprimerEspaceSuperflu = true;
        $this->columns['titre'] = $input;

        // Validation de la colonne contenu
        $input = new InputText();
        $input->Require = true;
        $input->MinLength = self::CONFIG['contenu_min'];
        $input->MaxLength = self::CONFIG['contenu_max'];
        $input->SupprimerEspaceSuperflu = true;
        $this->columns['contenu'] = $input;

        // Validation de la colonne auteur
        $input = new InputText();
        $input->Require = false;
        $input->MaxLength = self::CONFIG['auteur_max'];
        $input->SupprimerEspaceSuperflu = true;
        $this->columns['auteur'] = $input;

        // Colonnes de dates
        $input = new InputDate();
        $input->Require = false;
        $this->columns['date_creation'] = $input;

        $this->listOfColumns->Values = ['type', 'titre', 'contenu', 'auteur', 'date_creation'];
    }

    /**
     * Récupère toutes les informations selon les droits de l'utilisateur
     *
     * @return array<int, array{
     *     id: int,
     *     type: string,
     *     titre: string,
     *     contenu: string,
     *     auteur: string,
     *     date_creation: string,
     *     date_modification: string,
     *     date_creation_fr: string,
     *     date_modification_fr: string
     * }>
     */
    public static function getInformation() {
        if (isset($_SESSION['membre'])) {
            $sql = "SELECT id, type, titre, contenu, auteur,date_creation FROM information;";
        } else {
            $sql = "SELECT id, type, titre, contenu, auteur,date_creation FROM information WHERE type = 'publique';";
        }

        $select = new Select();
        return $select->getRows($sql);
    }

    /**
     * Supprime une information
     *
     * @param int $id Identifiant de l'information
     * @return void
     */
    public static function supprimer(int $id): void
    {
        $db = Database::getInstance();
        $sql = "DELETE FROM information WHERE id = :id;";
        $cmd = $db->prepare($sql);
        $cmd->bindValue('id', $id);
        $result = $cmd->execute();

        if (!$result) {
            throw new Exception("Erreur lors de l'exécution de la suppression");
        }
    }
    /**
     * Met à jour une information
     *
     * @param int $id Identifiant de l'information
     * @param string $titre Nouveau titre
     * @param string $contenu Nouveau contenu
     * @return bool Succès de la mise à jour
     */
    public static function modifier(int $id, string $titre, string $contenu): bool
    {
        $db = Database::getInstance();
        $sql = "UPDATE information SET titre = :titre, contenu = :contenu, date_modification = NOW() WHERE id = :id;";
        $cmd = $db->prepare($sql);
        $cmd->bindValue('id', $id);
        $cmd->bindValue('titre', $titre);
        $cmd->bindValue('contenu', $contenu);

        return $cmd->execute();
    }
    /**
     * Récupère la configuration
     *
     * @return array La configuration des paramètres
     */
    public static function getConfig(): array
    {
        return self::CONFIG;
    }
}