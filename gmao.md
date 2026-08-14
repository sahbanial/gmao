# Cahier des charges fonctionnel — Application Web de suivi des indicateurs de performance (type GMAO)
### Machine INSERTER MA03 — Atelier APT solénoïde — GRUNER El Fajja Tunisie

---

## 1. Contexte et objectif

Le rapport PFE identifie le suivi manuel des indicateurs (relevés mensuels reconstitués) comme un frein à la fiabilisation des gains obtenus (reconception outil SPAN, cales Vorschub, tolérances Schneider Plater/Bremze, SMED). L'application doit :

- Automatiser le calcul du **MTBF, MTTR, Disponibilité et TRS**.
- Centraliser un **historique fiable** des arrêts/pannes exploitable pour de futures analyses **Pareto** et **AMDEC**.
- Planifier la **maintenance préventive**.
- Assurer la **traçabilité complète** des interventions.

Périmètre initial : machine INSERTER MA03 (extensible ensuite aux autres machines de l'atelier).

---

## 2. Utilisateurs et rôles (RBAC)

| Rôle | Droits |
|---|---|
| **Opérateur** | Déclarer un arrêt/une panne, consulter le TRS du poste en cours |
| **Technicien de maintenance** | Traiter une intervention (curative/préventive), clôturer une fiche, consulter l'historique machine |
| **Responsable maintenance / production** | Valider les interventions, consulter tous les KPI, générer les rapports Pareto/AMDEC, planifier le préventif |
| **Administrateur** | Gérer les utilisateurs, les machines, les catégories de pannes, les seuils et paramètres système |

---

## 3. Architecture fonctionnelle — Modules

1. Authentification & gestion des utilisateurs
2. Fiche machine / équipement
3. Déclaration des arrêts et pannes (saisie temps réel)
4. Moteur de calcul des indicateurs (MTBF, MTTR, Disponibilité, TRS)
5. Gestion des interventions de maintenance (curatif + préventif)
6. Planification de la maintenance préventive
7. Analyse Pareto & AMDEC (génération automatique)
8. Tableau de bord (dashboard) temps réel
9. Gestion documentaire (procédures SMED, instructions de changement de série)
10. Rapports et exports
11. Notifications et alertes
12. Administration / paramétrage

Pour chaque module ci-dessous : **Entrées (Inputs)**, **Traitements**, **Sorties (Outputs)**.

---

## 4. Détail des modules

### Module 1 — Authentification & utilisateurs

**Inputs**
- Identifiant / mot de passe (ou SSO entreprise)
- Formulaire admin : nom, prénom, matricule, rôle, atelier/ligne assigné(e)

**Traitements**
- Vérification des identifiants, gestion de session (JWT ou session serveur)
- Contrôle d'accès selon le rôle (RBAC)

**Outputs**
- Session utilisateur active + token
- Journal de connexion (log d'audit : qui, quand, quelle action)

---

### Module 2 — Fiche machine / équipement

**Inputs**
- Code machine (ex. MA03), désignation, atelier, ligne de production
- Liste des composants critiques (issue de l'AMDEC) : Outil insertion SPAN, Vorschub, Moteur CC, Aiguilles Nadel, Stempel Batterie, Schneider Plater, Capteur caméra, Capteur optique, AX Module 10, cames, capteur déplacement, distributeur, vérins, chariot, unité de levage
- Criticité AMDEC de chaque composant (valeur C, calculée = Gravité × Fréquence × Détection)
- Date de mise en service, fournisseur, documentation technique (upload PDF/fiches)

**Traitements**
- Création/mise à jour de la fiche technique
- Association composant ↔ criticité ↔ historique de pannes

**Outputs**
- Fiche machine consultable (JSON pour l'app, PDF exportable)
- Liste des composants classés par niveau de criticité (Négligeable / Moyenne / Élevée) reprenant la grille du rapport (C ≤ 6 / 7 ≤ C ≤ 13 / C ≥ 14)

---

### Module 3 — Déclaration des arrêts et pannes (cœur du système)

**Inputs (saisie opérateur/technicien, idéalement en < 60 secondes)**
- Machine concernée (sélection, ou auto-détection si connectée à un automate)
- Date/heure de début d'arrêt (auto ou saisie manuelle)
- Date/heure de fin d'arrêt (saisie à la remise en marche)
- Type d'arrêt : Panne mécanique / Réglage Vorschub / Changement de série / Panne électrique / Arrêt qualité / Arrêt planifié / Autre
- Composant concerné (liste déroulante liée à la fiche machine)
- Cause déclarée (texte libre + liste de causes standardisées, alimentée par les 5 Pourquoi)
- Nom de l'opérateur/technicien déclarant
- Photo optionnelle (upload) de la panne

**Traitements**
- Calcul automatique de la **durée d'arrêt** = heure fin − heure début
- Horodatage et enregistrement en base (traçabilité immuable)
- Classement automatique de l'arrêt dans une catégorie (pour alimenter le Pareto)
- Déclenchement automatique d'une fiche d'intervention (Module 5) si arrêt > seuil paramétrable

**Outputs**
- Enregistrement en base de données (table `arrets`)
- Fiche d'arrêt horodatée, consultable dans l'historique
- Alerte temps réel envoyée au responsable si arrêt en cours dépasse un seuil critique (ex. > 30 min)

---

### Module 4 — Moteur de calcul des indicateurs (MTBF / MTTR / Disponibilité / TRS)

**Inputs**
- Historique des arrêts et de leurs durées (Module 3)
- Temps d'ouverture théorique (temps requis, paramétrable par période : équipe/jour/semaine/mois)
- Nombre de pannes sur la période
- Données de production (cadence théorique, quantité produite, quantité conforme/rebutée) — saisie ou import

**Traitements (formules à implémenter, cohérentes avec le rapport)**
- `MTBF = Temps de fonctionnement total / Nombre de pannes`
- `MTTR = Temps total de réparation / Nombre de pannes`
- `Disponibilité = Temps de fonctionnement / (Temps de fonctionnement + Temps d'arrêt)` ou `MTBF / (MTBF + MTTR)`
- `TRS = Disponibilité × Performance × Qualité`
  - Performance = (Quantité produite × Temps de cycle théorique) / Temps de fonctionnement
  - Qualité = Quantité conforme / Quantité produite
- Recalcul automatique à chaque nouvelle donnée saisie, et agrégation par période (poste / jour / semaine / mois)

**Outputs**
- Valeurs numériques des 4 indicateurs, par période, exportables
- Courbes d'évolution (tendance) MTBF/MTTR/Disponibilité/TRS
- Comparaison automatique vs objectifs cibles fixés par la direction (ex. Disponibilité, TRS, temps de changement de série)
- Alerte si un indicateur repasse sous le seuil objectif

---

### Module 5 — Gestion des interventions de maintenance

**Inputs**
- Fiche d'arrêt liée (héritée du Module 3) ou création manuelle (intervention préventive)
- Technicien assigné
- Type d'intervention : curative / préventive / améliorative
- Actions réalisées (texte structuré : diagnostic, action corrective, pièces changées)
- Pièces de rechange utilisées (référence, quantité)
- Temps d'intervention (début/fin)
- Statut : Ouverte / En cours / Clôturée / Validée

**Traitements**
- Workflow de statut (création → affectation → traitement → clôture → validation responsable)
- Calcul du temps de réparation (alimente le MTTR)
- Lien automatique avec la fiche machine et le composant concerné

**Outputs**
- Fiche d'intervention complète (PDF exportable, signature électronique optionnelle)
- Mise à jour de l'historique machine
- Alimentation de la base pour l'analyse AMDEC/Pareto

---

### Module 6 — Planification de la maintenance préventive

**Inputs**
- Composant/machine à traiter
- Type de maintenance préventive (systématique, conditionnelle)
- Périodicité (heures de fonctionnement, nombre de cycles, ou date calendaire)
- Checklist des tâches préventives (ex. contrôle cales Vorschub, contrôle usure outil SPAN)

**Traitements**
- Génération automatique d'un calendrier de maintenance
- Calcul de la prochaine échéance selon compteur d'heures machine ou date
- Génération automatique d'une intervention préventive (Module 5) à l'échéance

**Outputs**
- Calendrier de maintenance préventive (vue liste + vue calendrier)
- Notifications d'échéance à venir (Module 11)
- Taux de respect du plan préventif (KPI)

---

### Module 7 — Analyse Pareto & AMDEC automatisée

**Inputs**
- Historique des arrêts classés par cause/composant (Module 3)
- Durées cumulées par cause
- Grille AMDEC (Gravité, Fréquence, Détection) saisie/mise à jour par le responsable

**Traitements**
- Agrégation des durées d'arrêt par cause, tri décroissant
- Calcul du pourcentage cumulé (loi des 80/20)
- Calcul automatique de la criticité AMDEC : `C = G × F × D`
- Classement automatique par niveau de criticité (reprenant les seuils du rapport)

**Outputs**
- Diagramme de Pareto généré dynamiquement (graphique)
- Tableau de criticité AMDEC mis à jour en continu
- Export du diagramme et du tableau (image/PDF/Excel)

---

### Module 8 — Tableau de bord (dashboard)

**Inputs**
- Toutes les données calculées par les modules 4, 6 et 7
- Période sélectionnée par l'utilisateur (jour/semaine/mois/année)

**Traitements**
- Agrégation et mise en forme des données pour affichage temps réel
- Rafraîchissement automatique (polling ou WebSocket si connexion machine en temps réel)

**Outputs**
- Cartes KPI : MTBF, MTTR, Disponibilité, TRS, temps de changement de série moyen
- Graphique Pareto des causes d'arrêt du mois
- Liste des interventions en cours / en retard
- Statut du plan de maintenance préventive
- Comparatif objectifs vs réalisé (ex. Disponibilité 73,78 % → objectif ; TRS 40,33 % → objectif ; SMED 78,9 min → 21,9 min)

---

### Module 9 — Gestion documentaire

**Inputs**
- Documents à uploader : instructions de changement de série (SMED), fiches techniques, standards de réglage (cales début/fin de course), photos, manuels

**Traitements**
- Stockage, versionnage, indexation par machine/composant

**Outputs**
- Bibliothèque documentaire consultable et téléchargeable depuis chaque fiche machine/intervention

---

### Module 10 — Rapports et exports

**Inputs**
- Type de rapport demandé, période, machine(s)

**Traitements**
- Génération du rapport (agrégation des données des modules 3 à 7)

**Outputs**
- Export PDF / Excel : rapport KPI mensuel, historique des pannes, rapport AMDEC/Pareto, rapport de maintenance préventive

---

### Module 11 — Notifications et alertes

**Inputs**
- Événements système : arrêt en cours dépassant un seuil, échéance préventive proche, indicateur sous objectif, intervention en retard

**Traitements**
- Évaluation continue des règles d'alerte (moteur de règles simple, seuils paramétrables)

**Outputs**
- Notification in-app, e-mail, et/ou SMS (selon rôle du destinataire)

---

### Module 12 — Administration / paramétrage

**Inputs**
- Paramètres système : seuils d'alerte, objectifs KPI cibles, catégories de pannes, temps d'ouverture théorique, utilisateurs, machines

**Traitements**
- CRUD sur toutes les tables de référence

**Outputs**
- Configuration appliquée à l'ensemble de l'application

---

## 5. Modèle de données (entités principales)

| Entité | Attributs clés |
|---|---|
| `Utilisateur` | id, nom, prénom, matricule, rôle, atelier, login, mot_de_passe_hash |
| `Machine` | id, code, désignation, atelier, ligne, date_mise_service |
| `Composant` | id, machine_id, désignation, criticité_AMDEC (G, F, D, C) |
| `Arret` | id, machine_id, composant_id, type_arrêt, date_début, date_fin, durée, cause, déclarant_id, photo |
| `Intervention` | id, arrêt_id (nullable), machine_id, composant_id, technicien_id, type (curatif/préventif), date_début, date_fin, actions, statut |
| `PieceRechange` | id, référence, désignation, stock_disponible |
| `Intervention_Piece` | intervention_id, piece_id, quantité |
| `PlanPreventif` | id, machine_id, composant_id, périodicité, prochaine_échéance |
| `IndicateurCalcule` | id, machine_id, période, MTBF, MTTR, disponibilité, TRS |
| `Document` | id, machine_id, type, fichier, version |
| `Notification` | id, utilisateur_id, type, message, date, lu (bool) |

---

## 6. Exigences non fonctionnelles

- **Accessibilité** : application web responsive (poste fixe atelier + tablette technicien)
- **Performance** : recalcul des KPI en < 2 s après une saisie
- **Sécurité** : authentification obligatoire, journal d'audit, sauvegarde quotidienne de la base
- **Disponibilité** : application critique pour la production → hébergement avec sauvegarde/redondance
- **Extensibilité** : architecture multi-machines dès le départ (clé `machine_id` partout), pour permettre l'extension future à d'autres lignes de GRUNER El Fajja
- **Intégration future possible** : connexion directe à l'automate de la machine (API/OPC-UA) pour l'auto-détection des arrêts, au lieu de la saisie manuelle

---

## 7. Suggestion de stack technique (à valider avec l'ingénieur/l'IT de l'entreprise)

- **Frontend** : application web responsive (React/Vue/Angular) ou solution low-code interne si l'entreprise en dispose déjà
- **Backend** : API REST (Node.js/Express, Django/FastAPI, ou .NET selon standards IT de GRUNER)
- **Base de données** : PostgreSQL ou MySQL (relationnelle, adaptée aux relations machine/composant/arrêt/intervention)
- **Génération graphiques** : bibliothèque type Chart.js/Recharts pour Pareto et courbes de tendance
- **Export** : génération PDF (ex. PDFKit) et Excel (ex. openpyxl/ExcelJS)
- **Authentification** : JWT + gestion de rôles

---

## 8. Priorisation suggérée (MVP puis extensions)

**Phase 1 (MVP)** : Modules 1, 2, 3, 4, 8 — permet déjà le calcul automatique des KPI et remplace le suivi manuel.
**Phase 2** : Modules 5, 6, 11 — gestion complète des interventions et du préventif.
**Phase 3** : Modules 7, 9, 10, 12 — analyse Pareto/AMDEC automatisée, documentation, rapports, administration avancée.
