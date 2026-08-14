# Login — UI native (web / mobile)

## Objectif

Rendre `/login` plus proche d’un écran de connexion natif (app atelier) tout en restant dans le design system **Industrial Precision**.

## Mobile

- Plein écran clair (`min-h-dvh`), safe-area (`viewport-fit=cover`).
- Marque centrée (pictogramme + IndustriOS), titre **Connexion**, sous-titre machine.
- Champs persistants (pas de floating label), icône à gauche, afficher/masquer le mot de passe.
- CTA 48 px `bg-primary`, alerte erreur tonale.
- Pied de page : session 8 h + **Réalisé par Jawher Araibi**.

## Desktop / poste fixe

- Split : panneau primary à gauche (grille industrielle, blocs géométriques), carte formulaire à droite (`max-w-login`).
- Crédit auteur dans le pied du panneau branding.

## Fichiers

- `apps/web/src/features/auth/login-page.tsx`
- `apps/web/src/features/auth/login-field.tsx`
- `apps/web/index.html` (`viewport-fit=cover`)
