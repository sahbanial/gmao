# UI Stitch — résumé

Le front `@gmao/web` reprend le design system **Industrial Precision** du prototype Stitch *GMAO Inserter Performance Tracker*.

## Écrans alignés

| Route | Écran Stitch | Notes |
| --- | --- | --- |
| `/` | MA03 KPI Dashboard | Bento KPI, barre d’accent, CTA rouge, activité récente |
| `/downtimes/new` | Declare Failure | Formulaire, chrono, pas de bottom nav |
| `/machines/MA03` | Machine Technical File | Fiche, AMDEC (TanStack Table), docs, photo |
| `/report` | Pareto & AMDEC | Arrêts + AMDEC live, filtre période, PDF désactivé |
| `/login` | (hors prototype) | Mobile natif (safe-area, champs icônes, toggle mot de passe) ; split branding / carte desktop, `max-w-login` |
| `/tasks` | (hors prototype) | File d’attente live : arrêts ouverts + contrôles AMDEC HIGH |

## Tokens

- Couleurs Material : primary `#00236f`, secondary-container `#fd761a`, surface `#f8f9ff`
- Typo Inter + Material Symbols Outlined (FILL)
- Rayons Stitch : 2 / 4 / 8 / 12 px (`rounded` / `lg` / `xl` / `full`)
- Nav active : pastille orange `secondary-container`

## Données

Dashboard, fiche machine, Pareto/AMDEC et file d’attente `/tasks` sont branchés sur l’API.
