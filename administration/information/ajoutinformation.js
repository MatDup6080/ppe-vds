"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {retournerVers, afficherSousLeChamp, confirmer} from '/composant/fonction/afficher.js';
import {
    configurerFormulaire,
    donneesValides,
    effacerLesErreurs,
} from "/composant/fonction/formulaire.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesParametresInfo, lesParametresFichier, lesFichiers, tinymce */

// récupération des élements de l'interface
const type = document.getElementById('type');
const titre = document.getElementById('titre');
const contenu = document.getElementById('contenu');
const auteur = document.getElementById('auteur');
const btnAjouter = document.getElementById('btnAjouter');

// Fonction pour nettoyer TOUTES les balises HTML
// Fonction pour nettoyer le contenu HTML mais autoriser les images
function nettoyerContenu(html) {
    if (!html) return '';

    // Autoriser seulement les balises safe : images, gras, italique, etc.
    const allowedTags = {
        'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
        'strong': [],
        'em': [],
        'u': [],
        'br': [],
        'p': [],
        'ul': [],
        'ol': [],
        'li': [],
        'a': ['href', 'target']
    };

    // Supprimer toutes les balises non autorisées
    let cleaned = html.replace(/<(\/?)(\w+)([^>]*)>/g, function(match, slash, tagName, attributes) {
        if (allowedTags[tagName.toLowerCase()]) {
            // Nettoyer les attributs
            let cleanAttributes = '';
            if (attributes) {
                const allowedAttrs = allowedTags[tagName.toLowerCase()];
                const attrRegex = /(\w+)=("([^"]*)"|'([^']*)')/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                    const attrName = attrMatch[1].toLowerCase();
                    if (allowedAttrs.includes(attrName)) {
                        const attrValue = attrMatch[3] || attrMatch[4] || '';
                        // Validation spécifique pour les src d'images
                        if (attrName === 'src') {
                            if (attrValue.startsWith('data:image/') ||
                                attrValue.startsWith('/') ||
                                attrValue.startsWith('http')) {
                                cleanAttributes += ` ${attrName}="${attrValue}"`;
                            }
                        } else {
                            cleanAttributes += ` ${attrName}="${attrValue}"`;
                        }
                    }
                }
            }
            return `<${slash}${tagName}${cleanAttributes}>`;
        }
        return ''; // Supprimer les balises non autorisées
    });

    return cleaned.trim();
}

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

btnAjouter.onclick = () => {
    effacerLesErreurs();

    // récupération de la valeur du composant tinymce
    if (typeof tinymce !== 'undefined' && tinymce.get('contenu')) {
        // NETTOYER le contenu pour supprimer TOUTES les balises
        let contenuHTML = tinymce.get('contenu').getContent();
        contenu.value = nettoyerContenu(contenuHTML);
    }

    // Nettoyer les champs texte
    titre.value = titre.value.trim().replace(/\s+/g, ' ');
    auteur.value = auteur.value.trim().replace(/\s+/g, ' ');

    if (donneesValides()) {
        ajouterInformation();
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

function ajouterInformation() {
    let formData = new FormData();
    formData.append('type', type.value);
    formData.append('titre', titre.value);

    // Récupérer le contenu HTML avec images
    if (typeof tinymce !== 'undefined' && tinymce.get('contenu')) {
        let contenuHTML = tinymce.get('contenu').getContent();
        // Nettoyer mais garder les images et formatage basique
        contenu.value = nettoyerContenu(contenuHTML);
    }

    formData.append('contenu', contenu.value);
    formData.append('auteur', auteur.value);

    appelAjax({
        url: 'ajax/ajouter.php',
        data: formData,
        success: () => {
            retournerVers("Information ajoutée avec succès", './');
        },
        error: (xhr, status, error) => {
            afficherSousLeChamp('btnAjouter', 'Erreur lors de l\'ajout: ' + error);
            // Réactiver le bouton en cas d'erreur
            btnAjouter.disabled = false;
            btnAjouter.textContent = 'Ajouter';
        }
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// Mise en place des balises div de class 'messageErreur' sur chaque champ de saisie
configurerFormulaire();

// Remplir les options du select type avec les paramètres des informations
Object.entries(lesParametresInfo.types).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    type.appendChild(option);
});

// Initialisation de TinyMCE - SANS AUCUNE BALISE <p> NI <br>
// Initialisation de TinyMCE - AUTORISER les images et formatage basique
tinymce.init({
    license_key: 'gpl',
    selector: '#contenu',
    height: 400,
    menubar: 'edit insert view format',
    plugins: 'link lists image paste',
    toolbar: [
        'bold italic underline | forecolor backcolor | fontsizeselect | alignleft aligncenter alignright | bullist numlist | link image'
    ],
    fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',

    // Configuration des images
    image_advtab: true,
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',

    // Configuration de base pour le contenu
    forced_root_block: 'p',
    force_br_newlines: true,
    force_p_newlines: false,
    convert_newlines_to_brs: false,

    // Styles pour les images
    content_style: `
        img { max-width: 100%; height: auto; }
        p { margin: 0 0 10px 0; }
    `,

    setup: function(editor) {
        // Validation du contenu avant sauvegarde
        editor.on('GetContent', function(e) {
            if (e.format === 'html') {
                e.content = nettoyerContenu(e.content);
            }
        });

        // Gestion des images collées/déposées
        editor.on('paste', function(e) {
            // Autoriser le collage d'images
            if (e.clipboardData && e.clipboardData.items) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        e.preventDefault();
                        const file = items[i].getAsFile();
                        // Ici vous pouvez gérer l'upload de l'image
                        console.log('Image collée:', file);
                    }
                }
            }
        });
    }
});