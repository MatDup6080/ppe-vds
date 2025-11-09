<?php

class DocumentInformation
{
    /**
     * Insère un nouveau document dans la base de données
     */
    public static function inserer(array $donnees): int
    {
        $db = Database::getInstance();

        $sql = "INSERT INTO documentInformation 
                (date, titre, fichier, idInformation, nbDemande, date_creation) 
                VALUES (:date, :titre, :fichier, :idInformation, :nbDemande, NOW())";

        $cmd = $db->prepare($sql);
        $cmd->execute([
            'date' => $donnees['date'],
            'titre' => $donnees['titre'],
            'fichier' => $donnees['fichier'],
            'idInformation' => $donnees['idInformation'],
            'nbDemande' => $donnees['nbDemande'] ?? 0
        ]);

        return $db->lastInsertId();
    }

    /**
     * Supprime un document par son ID
     */
    public static function supprimer(int $id): bool
    {
        $db = Database::getInstance();
        $sql = "DELETE FROM documentInformation WHERE id = :id";
        $cmd = $db->prepare($sql);
        return $cmd->execute(['id' => $id]);
    }

    /**
     * Valide les données d'un document
     */
    public static function validerDonnees(array $donnees): array
    {
        $erreurs = [];

        // Validation de la date
        if (empty($donnees['date']) || !strtotime($donnees['date'])) {
            $erreurs[] = "La date n'est pas valide";
        }

        // Validation du titre
        if (empty($donnees['titre'])) {
            $erreurs[] = "Le titre est obligatoire";
        } elseif (strlen($donnees['titre']) < 3) {
            $erreurs[] = "Le titre doit contenir au moins 3 caractères";
        } elseif (strlen($donnees['titre']) > 255) {
            $erreurs[] = "Le titre ne peut pas dépasser 255 caractères";
        }

        // Validation du fichier
        if (empty($donnees['fichier'])) {
            $erreurs[] = "Le nom du fichier est obligatoire";
        }

        // Validation de l'information
        if (empty($donnees['idInformation']) || $donnees['idInformation'] < 1) {
            $erreurs[] = "L'information associée est obligatoire";
        }

        return $erreurs;
    }

    // Gardez les autres méthodes existantes (getDocumentsByInformation, etc.)
    public static function getDocumentsByInformation(int $idInformation): array
    {
        $sql = "SELECT id, date, titre, fichier, idInformation, nbDemande 
                FROM documentInformation 
                WHERE idInformation = :idInformation 
                ORDER BY date DESC";

        $select = new Select();
        return $select->getRows($sql, ['idInformation' => $idInformation]);
    }

    public static function getDocumentById(int $id): ?array
    {
        $sql = "SELECT id, date, titre, fichier, idInformation, nbDemande 
                FROM documentInformation 
                WHERE id = :id";

        $select = new Select();
        return $select->getRow($sql, ['id' => $id]);
    }

    public static function getAllWithInformation(): array
    {
        $sql = "SELECT di.*, i.titre as information_titre, i.type as information_type
                FROM documentInformation di
                INNER JOIN information i ON di.idInformation = i.id
                ORDER BY di.date DESC";

        $select = new Select();
        return $select->getRows($sql);
    }

    public static function incrementerDemandes(int $id): void
    {
        $sql = "UPDATE documentInformation 
                SET nbDemande = nbDemande + 1 
                WHERE id = :id";

        $db = Database::getInstance();
        $cmd = $db->prepare($sql);
        $cmd->execute(['id' => $id]);
    }
}