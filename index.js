"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {initialiserToutesLesCartes, basculerToutesLesCartes} from "/composant/fonction/openclose.js?";
import {formatDateLong} from "/composant/fonction/date.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global prochaineEdition, lesClassements, informations*/

// Récupération des éléments de l'interface
const detailClassement = document.getElementById('detailClassement');
const dateEpreuve = document.getElementById('dateEpreuve');
const descriptionEpreuve = document.getElementById('descriptionEpreuve');
const btnOuvrirToutes = document.getElementById('btnOuvrirToutes');
const btnFermerToutes = document.getElementById('btnFermerToutes');
const information = document.getElementById('information');


// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

btnOuvrirToutes.onclick = () => basculerToutesLesCartes(true);
btnFermerToutes.onclick = () => basculerToutesLesCartes(false); // fermer

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------


initialiserToutesLesCartes();

// Affichage des informations
for (const element of informations) {
    let div = document.createElement('div');
    div.classList.add('information-item');
    div.innerHTML = `<h3>${element.titre}</h3><p>${element.contenu}</p><small>Par ${element.auteur}</small>`;

    // Si l'information est privée, l'ajouter dans la section privée
    if (element.type === 'privee') {
        // Afficher la section privée si elle était cachée
        document.getElementById('sectionPrivee').style.display = 'block';
        document.getElementById('informationPrivee').appendChild(div);
    } else {
        // Information publique
        information.appendChild(div);
    }
}

// Rendre visible la section informations
information.style.display = 'block';

// Affichage de la prochaine épreuve
dateEpreuve.innerText = formatDateLong(prochaineEdition.date);
descriptionEpreuve.innerHTML = prochaineEdition.description;

// Afficher les derniers classements pdf
for (const element of lesClassements) {
    let a = document.createElement('a');
    a.classList.add('lien');
    a.href = "/afficherclassement.php?id=" + element.id;
    a.innerText = element.dateFr + ' ' + element.titre;
    detailClassement.appendChild(a);
}