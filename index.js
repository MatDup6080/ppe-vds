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

    // Contenu de l'information
    let contenuHTML = `
        <h3>${element.titre}</h3>
        <p>${element.contenu}</p>
        <small>Par ${element.auteur}</small>
        <small>le ${element.date_creation}</small>
    `;

    // Ajouter les documents associés s'ils existent
    if (element.documents && element.documents.length > 0) {
        contenuHTML += `<div class="documents-associes" style="margin-top: 10px;">`;
        contenuHTML += `<strong>Documents associés :</strong><br>`;

        element.documents.forEach(document => {
            contenuHTML += `
                <a href="/afficherdocumentinformation.php?id=${document.id}" 
                   target="_blank" 
                   class="lien-document" 
                   style="display: block; margin: 5px 0;">
                   📄 ${document.titre}
                </a>
            `;
        });

        contenuHTML += `</div>`;
    }

    div.innerHTML = contenuHTML;

    // Si l'information est privée, l'ajouter dans la section privée
    if (element.type === 'privee') {
        // Vérifier si la section privée existe, sinon la créer
        let sectionPrivee = document.getElementById('sectionPrivee');
        if (!sectionPrivee) {
            sectionPrivee = document.createElement('div');
            sectionPrivee.id = 'sectionPrivee';
            sectionPrivee.classList.add('card', 'mb-1');
            sectionPrivee.innerHTML = `
                <div class="card-header entete">Informations Privées</div>
                <div id="informationPrivee" style="padding: 10px;"></div>
            `;
            information.parentNode.insertBefore(sectionPrivee, information.nextSibling);
        }
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