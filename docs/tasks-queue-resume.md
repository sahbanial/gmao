# File d'attente `/tasks`

La page Interventions lit les données live de MA03. Ce n’est pas le module 5 (work orders, pièces, workflow de clôture).

## Sources

- Arrêts ouverts : `GET /downtimes?machineCode=MA03` (`endedAt === null`)
- Contrôles AMDEC : composants `HIGH` de `GET /machines/MA03`

Un composant déjà couvert par un arrêt ouvert n’apparaît pas une seconde fois.

## Actions

- Curatif : **REMETTRE EN MARCHE** (`PATCH /downtimes/:id/end`)
- AMDEC : lien vers la fiche machine

## Non inclus (Phase 2)

Affectation technicien, préventif calendaire, pièces, PDF d’intervention.
