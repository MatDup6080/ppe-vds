"use strict";

import {appelAjax} from "/composant/fonction/ajax.js";
import {confirmer} from '/composant/fonction/afficher.js';
import {
    creerBoutonSuppression
} from "/composant/fonction/formulaire.js";

// Variables globales
const lesLignes = document.getElementById('lesLignes');
const filtreInfo = document.getElementById('filtre-info');
const nomInformationElement = document.getElementById('nom-information');
const messageAucunDocument = document.getElementById('message-aucun-document');

// Afficher l'information filtrée si applicable
function afficherFiltreInformation() {
    if (idInformation > 0 && nomInformation) {
        filtreInfo.style.display = 'block';
        nomInformationElement.textContent = nomInformation;
    } else {
        filtreInfo.style.display = 'none';
    }
}

// Fonction d'affichage des documents
function afficherDocuments(data) {
    lesLignes.innerHTML = '';

    if (!data || data.length === 0) {
        // Afficher le message "aucun document"
        if (messageAucunDocument) {
            messageAucunDocument.style.display = 'block';
        }

        const tr = lesLignes.insertRow();
        const td = tr.insertCell();
        td.colSpan = 2;
        td.className = 'text-center text-muted py-3';
        td.textContent = idInformation > 0
            ? 'Aucun document associé à cette information'
            : 'Aucun document disponible';
        return;
    }

    // Cacher le message "aucun document"
    if (messageAucunDocument) {
        messageAucunDocument.style.display = 'none';
    }

    // Pour chaque document, créer une ligne
    data.forEach(document => {
        const tr = lesLignes.insertRow();

        //  Bouton suppression
        let td = tr.insertCell();
        const btnSupprimer = creerBoutonSuppression(() => confirmer(() => supprimerDocument(document.id)));
        td.appendChild(btnSupprimer);
        td.style.width = "30px";
        td.style.textAlign = "center";

     // Lien du document
        td = tr.insertCell();

        let contenuHTML = `
            <a href="/afficherdocumentinformation.php?id=${document.id}" 
               target="_blank" 
               class="lien-document" 
               style="display: block; text-decoration: none; color: #007bff; font-weight: bold;">
               📄 ${document.titre}
            </a>`;

        // Ajouter le nom de l'information seulement en mode "tous les documents"
        if (idInformation === 0 && document.information_titre) {
            contenuHTML += `
                <div style="font-size: 0.875rem; color: #6c757d; margin-top: 2px;">
                    Information : ${document.information_titre}
                </div>`;
        }

        // Ajouter la date si disponible
        if (document.date) {
            contenuHTML += `
                <div style="font-size: 0.875rem; color: #6c757d; margin-top: 2px;">
                    Date : ${new Date(document.date).toLocaleDateString('fr-FR')}
                </div>`;
        }

        // Ajouter le compteur de demandes si disponible
        if (document.nbDemande !== undefined && document.nbDemande > 0) {
            contenuHTML += `
                <div style="font-size: 0.875rem; color: #6c757d; margin-top: 2px;">
                    ${document.nbDemande} consultation(s)
                </div>`;
        }

        td.innerHTML = contenuHTML;
    });
}

// Fonction de suppression
function supprimerDocument(idDocument) {
    appelAjax({
        url: 'ajax/supprimerfichier.php',
        data: {idDocument: idDocument},
        success: (data) => {
            afficherDocuments(data);
            // Afficher un message de confirmation
            const msgDiv = document.getElementById('msg');
            if (msgDiv) {
                msgDiv.innerHTML = '<div class="alert alert-success">Document supprimé avec succès</div>';
                setTimeout(() => {
                    msgDiv.innerHTML = '';
                }, 3000);
            }
        },
        error: (error) => {
            const msgDiv = document.getElementById('msg');
            if (msgDiv) {
                msgDiv.innerHTML = `<div class="alert alert-danger">Erreur lors de la suppression : ${error}</div>`;
            }
        }
    });
}

// Initialisation
function initialiserPage() {
    afficherFiltreInformation();
    afficherDocuments(lesDocuments);
}

// Démarrer quand la page est chargée
document.addEventListener('DOMContentLoaded', initialiserPage);