"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {retournerVers} from '/composant/fonction/afficher.js';
import {
    configurerFormulaire,
    donneesValides,
    effacerLesErreurs
} from "/composant/fonction/formulaire.js";

/* global lesParametres */
const type = document.getElementById('type');
const titre = document.getElementById('titre');
const contenu = document.getElementById('contenu');
const auteur = document.getElementById('auteur');
const btnAjouter = document.getElementById('btnAjouter');

btnAjouter.onclick = () => {
    effacerLesErreurs();
    titre.value = titre.value.trim().replace(/\s+/g, ' ');
    contenu.value = contenu.value.trim().replace(/\s+/g, ' ');
    auteur.value = auteur.value.trim().replace(/\s+/g, ' ');

    if (donneesValides()) {
        ajouter();
    }
};

function ajouter() {
    let formData = new FormData();
    formData.append('type', type.value);
    formData.append('titre', titre.value);
    formData.append('contenu', contenu.value);
    formData.append('auteur', auteur.value);

    appelAjax({
        url: 'ajax/ajouter.php',  // Garder ajouter.php
        data: formData,
        success: () => {
            retournerVers("Information ajoutée avec succès", './');
        }
    });
}

// Configuration initiale
configurerFormulaire();

// Remplir les options du select type
Object.entries(lesParametres.types).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    type.appendChild(option);
});