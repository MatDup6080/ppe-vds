"use strict";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesinformations, lesParametres */
let informationCourante = null;

// -----------------------------------------------------------------------------------
// Fonctions utilitaires simplifiées
// -----------------------------------------------------------------------------------

function messageBox(message, type = 'info') {
    // Créer une alerte Bootstrap stylée
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insérer au début du container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-supprimer après 5 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function confirmer(callback, message) {
    if (confirm(message)) {
        callback();
    }
}

function corriger(champ, message) {
    const element = document.getElementById(champ);
    if (element) {
        element.style.borderColor = 'red';
        let errorElement = element.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message text-danger small mt-1';
            element.parentNode.insertBefore(errorElement, element.nextSibling);
        }
        errorElement.textContent = message;
    }
}

function effacerLesErreurs() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-control').forEach(el => {
        el.style.borderColor = '';
    });
}

function appelAjax(options) {
    console.log('Appel AJAX vers:', options.url);
    console.log('Données:', options.data);

    // Utiliser fetch pour l'AJAX
    return fetch(options.url, {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (options.success) options.success(data);
            return data;
        })
        .catch(error => {
            console.error('Erreur AJAX:', error);
            if (options.error) options.error(error.message);
            throw error;
        });
}

// -----------------------------------------------------------------------------------
// Fonctions d'affichage
// -----------------------------------------------------------------------------------

function afficherStatistiques() {
    const nbTotal = document.getElementById('nb-total');
    const nbPubliques = document.getElementById('nb-publiques');
    const nbPrivees = document.getElementById('nb-privees');

    if (lesinformations && Array.isArray(lesinformations)) {
        const publiques = lesinformations.filter(info => info.type === 'Publique' || info.type === 'publique').length;
        const privees = lesinformations.filter(info => info.type === 'Privée' || info.type === 'privee').length;

        nbTotal.innerText = lesinformations.length;
        nbPubliques.innerText = publiques;
        nbPrivees.innerText = privees;
    } else {
        nbTotal.innerText = '0';
        nbPubliques.innerText = '0';
        nbPrivees.innerText = '0';
    }
}

function remplirMenuDeroulant() {
    const liste = document.getElementById('liste-informations');
    const messageVide = document.getElementById('message-vide');

    if (!liste) {
        console.error('Élément liste-informations non trouvé');
        return;
    }

    // Vider la liste
    liste.innerHTML = '';

    if (!lesinformations || !Array.isArray(lesinformations) || lesinformations.length === 0) {
        if (messageVide) messageVide.style.display = 'block';
        return;
    }

    if (messageVide) messageVide.style.display = 'none';

    // Trier les informations par titre
    const informationsTriees = [...lesinformations].sort((a, b) => a.titre.localeCompare(b.titre));

    informationsTriees.forEach(info => {
        const elementListe = document.createElement('div');
        elementListe.className = 'list-group-item d-flex justify-content-between align-items-center';
        elementListe.dataset.id = info.id;

        // Container pour les boutons
        const containerBoutons = document.createElement('div');
        containerBoutons.className = 'btn-group';

        // Bouton Voir
        const btnVoir = document.createElement('button');
        btnVoir.className = 'btn btn-outline-primary btn-sm';
        btnVoir.textContent = 'Voir';
        btnVoir.onclick = () => selectionnerInformation(info.id);

        // Bouton Modifier
        const btnModifier = document.createElement('button');
        btnModifier.className = 'btn btn-outline-warning btn-sm';
        btnModifier.textContent = 'Modifier';
        btnModifier.onclick = () => activerModeEdition(info);

        const supprimer = () => {
            appelAjax({
                url: 'ajax/supprimer.php',
                data: {
                    id: info.id
                },
                success: (reponse) => {
                    // 1. Supprimer visuellement
                    elementListe.remove();

                    setTimeout(() => {
                        location.reload();
                    }, 500);
                },
                error: (error) => {
                    messageBox("Erreur lors de la suppression: " + error, "error");
                }
            });
        };

        const actionSupprimer = () => confirmer(supprimer, `Êtes-vous sûr de vouloir supprimer "${info.titre}" ?`);

        // Bouton Supprimer
        const btnSupprimer = document.createElement('button');
        btnSupprimer.className = 'btn btn-outline-danger btn-sm';
        btnSupprimer.innerHTML = '×';
        btnSupprimer.onclick = actionSupprimer;

        // Ajouter les boutons au container
        containerBoutons.appendChild(btnVoir);
        containerBoutons.appendChild(btnModifier);
        containerBoutons.appendChild(btnSupprimer);

        // Contenu de l'élément
        const contenu = document.createElement('div');
        contenu.className = 'flex-grow-1';
        contenu.innerHTML = `
            <h6 class="mb-1">${info.titre}</h6>
            <small class="text-muted">${info.auteur} - ${info.type}</small>
        `;

        // Assembler l'élément
        elementListe.appendChild(contenu);
        elementListe.appendChild(containerBoutons);

        liste.appendChild(elementListe);
    });
}

function afficherInformationCourante() {
    const container = document.getElementById('information-courante');

    if (!container) {
        console.error('Élément information-courante non trouvé');
        return;
    }

    if (!informationCourante) {
        container.style.display = 'none';
        return;
    }

    const titreInfo = document.getElementById('titre-info');
    const auteurInfo = document.getElementById('auteur-info');
    const contenuInfo = document.getElementById('contenu-info');
    const badge = document.getElementById('badge-type');

    if (titreInfo) titreInfo.textContent = informationCourante.titre;
    if (auteurInfo) auteurInfo.textContent = informationCourante.auteur;
    if (contenuInfo) contenuInfo.textContent = informationCourante.contenu;

    if (badge) {
        badge.textContent = informationCourante.type;
        badge.className = `badge ${informationCourante.type === 'Publique' || informationCourante.type === 'publique' ? 'bg-success' : 'bg-warning'}`;
    }

    container.style.display = 'block';
}

function selectionnerInformation(id) {
    // Trouver l'information dans le tableau
    informationCourante = lesinformations.find(info => info.id === id);
    if (informationCourante) {
        afficherInformationCourante();

        // Scroll vers l'information affichée
        document.getElementById('information-courante').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// -----------------------------------------------------------------------------------
// Fonctions pour la modification
// -----------------------------------------------------------------------------------

function activerModeEdition(info) {
    // Cacher les boutons et afficher le formulaire d'édition
    const elementListe = document.querySelector(`[data-id="${info.id}"]`);
    const containerBoutons = elementListe.querySelector('.btn-group');

    // Cacher les boutons normaux
    containerBoutons.style.display = 'none';

    // Créer le formulaire d'édition
    const formulaireEdition = document.createElement('div');
    formulaireEdition.className = 'edit-form mt-2 p-2 border rounded';
    formulaireEdition.style.backgroundColor = '#f8f9fa';
    formulaireEdition.innerHTML = `
        <div class="mb-2">
            <label class="form-label small mb-1">Titre:</label>
            <input type="text" class="form-control form-control-sm mb-1" id="edit-titre-${info.id}" 
                   value="${info.titre.replace(/"/g, '&quot;')}" placeholder="Titre">
            
            <label class="form-label small mb-1">Type:</label>
            <select class="form-select form-select-sm mb-1" id="edit-type-${info.id}">
                <option value="Publique" ${info.type === 'Publique' ? 'selected' : ''}>Publique</option>
                <option value="Privée" ${info.type === 'Privée' ? 'selected' : ''}>Privée</option>
            </select>
            
            <label class="form-label small mb-1">Contenu:</label>
            <textarea class="form-control form-control-sm mb-1" id="edit-contenu-${info.id}" 
                      rows="3" placeholder="Contenu">${info.contenu}</textarea>
        </div>
        <div class="btn-group">
            <button class="btn btn-success btn-sm" onclick="sauvegarderModification(${info.id})">
                ✓ Sauvegarder
            </button>
            <button class="btn btn-secondary btn-sm" onclick="annulerEdition(${info.id})">
                ✗ Annuler
            </button>
        </div>
    `;

    elementListe.appendChild(formulaireEdition);
}

function annulerEdition(id) {
    const elementListe = document.querySelector(`[data-id="${id}"]`);
    const formulaireEdition = elementListe.querySelector('.edit-form');
    const containerBoutons = elementListe.querySelector('.btn-group');

    if (formulaireEdition) {
        formulaireEdition.remove();
    }
    if (containerBoutons) {
        containerBoutons.style.display = 'flex';
    }
}

function sauvegarderModification(id) {
    const titre = document.getElementById(`edit-titre-${id}`).value.trim();
    const type = document.getElementById(`edit-type-${id}`).value;
    const contenu = document.getElementById(`edit-contenu-${id}`).value.trim();

    // Validation
    if (!titre) {
        messageBox("Le titre est obligatoire", "error");
        document.getElementById(`edit-titre-${id}`).focus();
        return;
    }
    if (!type) {
        messageBox("Le type est obligatoire", "error");
        return;
    }
    if (!contenu) {
        messageBox("Le contenu est obligatoire", "error");
        return;
    }

    appelAjax({
        url: 'ajax/modifier.php',
        data: {
            id: id,
            titre: titre,
            type: type,
            contenu: contenu
        },
        success: (reponse) => {
            if (reponse.success) {
                messageBox("Information modifiée avec succès", "success");

                // Mettre à jour l'affichage dans la liste
                const elementListe = document.querySelector(`[data-id="${id}"]`);
                const h6 = elementListe.querySelector('h6');
                const small = elementListe.querySelector('small');

                if (h6) h6.textContent = titre;
                if (small) small.textContent = `${informationCourante ? informationCourante.auteur : ''} - ${type}`;

                // Mettre à jour les données globales
                const infoIndex = lesinformations.findIndex(info => info.id === id);
                if (infoIndex !== -1) {
                    lesinformations[infoIndex].titre = titre;
                    lesinformations[infoIndex].type = type;
                    lesinformations[infoIndex].contenu = contenu;
                }

                // Mettre à jour l'affichage courant si c'est l'information sélectionnée
                if (informationCourante && informationCourante.id === id) {
                    informationCourante.titre = titre;
                    informationCourante.type = type;
                    informationCourante.contenu = contenu;
                    afficherInformationCourante();
                }

                annulerEdition(id);
                afficherStatistiques();
            } else {
                messageBox(reponse.message || "Erreur lors de la modification", "error");
            }
        },
        error: (error) => {
            messageBox("Erreur: " + error, "error");
        }
    });
}

// -----------------------------------------------------------------------------------
// Fonctions de validation
// -----------------------------------------------------------------------------------

function validerFormulaireAjout() {
    const titre = document.getElementById('titre').value.trim();
    const auteur = document.getElementById('auteur').value.trim();
    const type = document.getElementById('type').value;
    const contenu = document.getElementById('contenu').value.trim();

    effacerLesErreurs();
    let isValid = true;

    if (!titre) {
        corriger('titre', 'Le titre est obligatoire');
        isValid = false;
    } else if (titre.length < 2) {
        corriger('titre', 'Le titre doit contenir au moins 2 caractères');
        isValid = false;
    }

    if (!auteur) {
        corriger('auteur', 'L\'auteur est obligatoire');
        isValid = false;
    } else if (auteur.length < 2) {
        corriger('auteur', 'L\'auteur doit contenir au moins 2 caractères');
        isValid = false;
    }

    if (!type) {
        corriger('type', 'Le type est obligatoire');
        isValid = false;
    }

    if (!contenu) {
        corriger('contenu', 'Le contenu est obligatoire');
        isValid = false;
    } else if (contenu.length < 10) {
        corriger('contenu', 'Le contenu doit contenir au moins 10 caractères');
        isValid = false;
    }

    return isValid;
}

// -----------------------------------------------------------------------------------
// Initialisation
// -----------------------------------------------------------------------------------

function initialiserPage() {
    console.log('Initialisation de la page informations...');
    console.log('Données reçues:', lesinformations);

    afficherStatistiques();
    remplirMenuDeroulant();

    console.log('Page informations initialisée');
}

document.addEventListener('DOMContentLoaded', initialiserPage);

// Exposer les fonctions globalement
window.selectionnerInformation = selectionnerInformation;
window.validerFormulaireAjout = validerFormulaireAjout;
window.activerModeEdition = activerModeEdition;
window.annulerEdition = annulerEdition;
window.sauvegarderModification = sauvegarderModification;