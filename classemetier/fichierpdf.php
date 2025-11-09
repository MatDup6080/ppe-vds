<?php

class FichierPDF
{
    /**
     * Configuration des fichiers pdf
     */
    private const CONFIG = [
        'repertoire' => '/data/documentinformation',
        'extensions' => ['pdf'],
        'types' => ["application/pdf"],
        'maxSize' => 512 * 1024, // 512 Ko
        'require' => true,
        'rename' => false,
        'sansAccent' => true,
        'accept' => '.pdf',
        'label' => 'Fichier PDF à téléverser (512 Ko max)',
    ];

    private const DIR = RACINE . self::CONFIG['repertoire'];

    // ------------------------------------------------------------------------------------------------
    // Méthodes concernant les opérations de consultation
    // ------------------------------------------------------------------------------------------------

    /**
     * Renvoie les paramètres de configuration des fichiers image
     * @return array<string, mixed>
     */
    public static function getConfig(): array
    {
        return self::CONFIG;
    }

    /**
     * Retourne tous les fichiers PDF contenus dans le répertoire de stockage
     * @return array
     */
    public static function getAll(): array {
        $liste = array();
        $lesFichiers = scandir(RACINE . self::CONFIG['repertoire']);
        foreach ($lesFichiers as $fichier) {
            if ($fichier != "." && $fichier != "..") {
                $extension = strtolower(pathinfo($fichier, PATHINFO_EXTENSION));
                if (in_array($extension, self::CONFIG['extensions'])) {
                    $liste[] = $fichier;
                }
            }
        }
        return $liste;
    }



    /**
     * Ajoute un fichier PDF
     * @param InputFile $file
     * @return array
     */
    public static function ajouter(InputFile $file): array {
        if (!$file->checkValidity()) {
            return ['success' => false, 'message' => $file->getValidationMessage()];
        }
        if (!$file->copy()) {
            return ['success' => false, 'message' => "Le fichier n'a pas pu être téléversé"];
        }
        return ['success' => true, 'message' => "Fichier ajouté", 'fichiers' => self::getAll()];
    }



    /**
     * Supprime un fichier PDF
     * @param string $nomFichier
     * @return array
     */
    public static function supprimer(string $nomFichier): array {
        $resultat = ['success' => false, 'message' => ''];
        // vérification du nom de fichier (évite les attaques par traversée de répertoire)
        if (basename($nomFichier) !== $nomFichier) {
            $resultat['message'] = "Le nom du fichier à supprimer n'est pas valide";
            return $resultat;
        }
        // vérification de l'extension
        $extension = strtolower(pathinfo($nomFichier, PATHINFO_EXTENSION));
        if (!in_array($extension, self::CONFIG['extensions'])) {
            $resultat['message'] = "Le fichier ne possède pas la bonne extension";
            return $resultat;
        }
        // vérification de l'existence du fichier
        $cheminComplet = self::DIR . '/' . $nomFichier;
        if (!is_file($cheminComplet)) {
            $resultat['message'] = "Le fichier à supprimer n'existe pas";
            return $resultat;
        }
        // vérification des droits en écriture
        if (!is_writable($cheminComplet)) {
            $resultat['message'] = "Le fichier à supprimer n'est pas accessible en écriture";
            return $resultat;
        }
        // tentative de suppression
        if (!unlink($cheminComplet)) {
            $resultat['message'] = "La suppression du fichier a échoué";
            return $resultat;
        }
        // tout est OK
        return ['success' => true, 'message' => "Fichier supprimé", 'fichiers' => self::getAll()];
    }

}