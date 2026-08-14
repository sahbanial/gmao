# Login — viewport fixe et responsive

## Problème

La page `/login` n’occupait pas le viewport (poste fixe atelier) et le formulaire était invisible : `max-w-md` valait **16 px** car Tailwind v4 mappe `max-w-*` sur `--spacing-md` (token Industrial Precision).

## Correctif

- Shell `min-h-dvh` / `h-dvh` desktop : viewport atelier, scroll si clavier mobile.
- Split **desktop / poste fixe** : panneau primary à gauche, carte formulaire à droite (`max-w-login` = 28 rem).
- **Mobile** : écran natif clair (marque centrée, formulaire, pied de page), safe-area.
- Inputs `h-12` / `w-full` (cible tactile ≥ 44 px), icônes et toggle mot de passe.

## À ne pas réutiliser

Ne pas utiliser `max-w-sm` / `max-w-md` / `max-w-lg` / `max-w-xl` : ces noms collisionnent avec `--spacing-sm|md|lg|xl`. Préférer `--container-*` (`max-w-login`) ou une valeur arbitraire (`max-w-[28rem]`).
