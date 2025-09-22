# APICarto

[![CI](https://github.com/IGNF/apicarto/actions/workflows/ci.yml/badge.svg)](https://github.com/IGNF/apicarto/actions/workflows/ci.yml)

## Prérequis 

Pour faire fonctionner API Carto, vous avez besoin de:

* [Node.js](https://nodejs.org) v20+

## Variables d'environnements

### apikey pour les tests du module aoc

| Variable   | Description                                |
|------------|--------------------------------------------|
| APIKEY     | apikey du flux WFS privé de France Agrimer |

## Sources de données

| Source                | Version            | Modules           | Plus d'information |
|-----------------------|--------------------|-------------------|--------------------|
| Géoplateforme           | Flux WFS | Cadastre <br/> RPG <br/> Nature <br/> WFS-Geoportail | [Geoservices](https://geoservices.ign.fr/services-web-experts) |
| GPU                   | Flux WFS | GPU                                   | [Géoportail de l'urbanisme](https://www.geoportail-urbanisme.gouv.fr/) |
| Base adresse nationale | v4.1.1  | Codes Postaux                         | [BAN](https://github.com/baseadressenationale/codes-postaux) |
<!-- | Base des appellations viticoles | Flux WFS | Appellations viticoles      | [FranceAgriMer](https://www.franceagrimer.fr/filieres-Vin-et-cidre/Vin/Professionnels/Teleprocedures) | -->


## Installation

### Installation du package

```
npm install
```

### Lancer le service

```
npm start
```

### Tests

```
npm run test
```

### Coverage

```
npm run coverage
```
Consulter le rapport "index.htlm" créé dans le dossier "coverage"

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).
