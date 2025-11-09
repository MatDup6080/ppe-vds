"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {retournerVers, afficherSousLeChamp} from '/composant/fonction/afficher.js';
import {
    configurerFormulaire,
    donneesValides,
    fichierValide,
    effacerLesErreurs
} from "/composant/fonction/formulaire.js";

// Variables globales
let leFichier = null;
const information = document.getElementById('information');
const date = document.getElementById('date');
const titre = document.getElementById('titre');
const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const btnFichier = document.getElementById('btnFichier');
const btnAjouter = document.getElementById('btnAjouter');

// Événements
btnFichier.onclick = () => fichier.click();

// Glisser-déposer
nomFichier.ondragover = (e) => e.preventDefault();
nomFichier.ondrop = (e) => {
    e.preventDefault();
    controlerFichier(e.dataTransfer.files[0]);
};

// Sélection de fichier via l'explorateur
fichier.onchange = () => {
    if (fichier.files.length > 0) {
        controlerFichier(fichier.files[0]);
    }
};

// Ajout du document
btnAjouter.onclick = () => {
    effacerLesErreurs();

    // Validation du fichier
    if (leFichier === null) {
        afficherSousLeChamp('fichier', 'Veuillez sélectionner un fichier PDF');
    }

    // Validation des données du formulaire
    if (donneesValides() && leFichier !== null) {
        ajouterDocument();
    }
};

// Fonctions
function controlerFichier(file) {
    effacerLesErreurs();
    if (fichierValide(file, lesParametres)) {
        nomFichier.textContent = file.name;
        leFichier = file;

        // Pré-remplir le titre si vide
        if (titre.value.length === 0) {
            titre.value = file.name.slice(0, -4); // Enlève l'extension .pdf
        }
    } else {
        leFichier = null;
        nomFichier.textContent = '';
    }
}

function ajouterDocument() {
    let formData = new FormData();
    formData.append('fichier', leFichier);
    formData.append('idInformation', information.value);
    formData.append('date', date.value);
    formData.append('titre', titre.value.trim());

    appelAjax({
        url: 'ajax/ajouterdocument.php',
        data: formData,
        success: (reponse) => {
            const message = "Document ajouté avec succès";
            if (idInformationPreSelectionne > 0) {
                retournerVers(message, `listedocument.php?idInformation=${idInformationPreSelectionne}`);
            } else {
                retournerVers(message, 'listedocument.php');
            }
        }
    });
}

// Initialisation
function initialiserPage() {
    // Configuration du formulaire
    configurerFormulaire();

    // Configuration du champ fichier
    fichier.accept = lesParametres.accept;

    // Remplir le select des informations
    remplirSelectInformations();

    // Date du jour par défaut
    date.value = new Date().toISOString().split('T')[0];
}

function remplirSelectInformations() {
    if (lesInformations && Array.isArray(lesInformations)) {
        // Trier par titre
        const informationsTriees = [...lesInformations].sort((a, b) =>
            a.titre.localeCompare(b.titre)
        );

        informationsTriees.forEach(info => {
            const option = document.createElement('option');
            option.value = info.id;
            option.textContent = `${info.titre} (${info.type})`;
            information.appendChild(option);
        });

        // Pré-sélectionner si ID fourni dans l'URL
        if (idInformationPreSelectionne > 0) {
            information.value = idInformationPreSelectionne;
        }
    }
}

// Démarrer l'initialisation
document.addEventListener('DOMContentLoaded', initialiserPage);