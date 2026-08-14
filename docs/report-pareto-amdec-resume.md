# Report Pareto & AMDEC dynamique

La page `/report` lit les données live de MA03.

## Sources

- Arrêts : `GET /downtimes?machineCode=MA03&from=&to=`
- AMDEC : `GET /machines/MA03` (G, F, D, C déjà en base)

## Traitements (`@gmao/shared`)

- Pareto : agrégation des durées par composant (sinon type d’arrêt), tri décroissant, part cumulée, causes vitales jusqu’à 80 %
- Période : mois en cours, trimestre, année en cours
- Arrêt ouvert : durée = maintenant − début

## Non inclus

Export PDF (bouton désactivé).
