# APICarto

[![CI](https://github.com/IGNF/apicarto/actions/workflows/ci.yml/badge.svg)](https://github.com/IGNF/apicarto/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/IGNF/apicarto/badge.svg?branch=master)](https://coveralls.io/github/IGNF/apicarto?branch=master)

## Prérequis 

Pour faire fonctionner API Carto, vous avez besoin de:

* [Node.js](https://nodejs.org) v14+ (utilisation de [nvm](https://github.com/creationix/nvm) recommandée)

### Prérequis module aoc

Pour faire fonctionner le module aoc, vous avez besoin en plus de:

* PostgreSQL v12+
* PostGIS v2.2+
* [ogr2ogr](http://www.gdal.org/ogr2ogr.html) v1.11+
* wget (inclus dans la plupart des distributions Linux)


## Variables d'environnements

### Configuration de la connexion postgresql pour le module aoc

La connexion à la base postgresql est configurée à l'aide des variables d'environnement standard postgresql :

| Variable   | Description                   |
|------------|-------------------------------|
| PGHOST     | Host du serveur postgresql    |
| PGDATABASE | Nom de la base de données     |
| PGUSER     | Nom de l'utilisateur          |
| PGPASSWORD | Mot de passe de l'utilisateur |


## Sources de données

| Source                | Version            | Modules           | Plus d'information |
|-----------------------|--------------------|-------------------|--------------------|
| Géoportail            | Flux WFS | Cadastre <br/> RPG <br/> Nature <br/> WFS-Geoportail | [Geoservices](https://geoservices.ign.fr/services-web-experts) |
| GPU                   | Flux WFS | GPU                                   | [Géoportail de l'urbanisme](https://www.geoportail-urbanisme.gouv.fr/) |
| Base adresse nationale | v4.1.1  | Codes Postaux                         | [BAN](https://github.com/baseadressenationale/codes-postaux) |
| Base des appellations viticoles | Flux WFS | Appellations viticoles      | [FranceAgriMer](https://www.franceagrimer.fr/filieres-Vin-et-cidre/Vin/Professionnels/Teleprocedures) |


## Installation

### Installation du package

```
npm install
```

### Lancer le service

```
npm start
```

## Installation  complémentaire pour le module aoc


Sous Ubuntu :
```bash
# Installer ogr2ogr
apt-get install gdal-bin

# Installer PostgreSQL et PostGIS
apt-get postgresql postgis postgresql-13-postgis-3
```

Sous Mac OS X :
```bash
# Installer ogr2ogr
brew install gdal

# Installer PostgreSQL et PostGIS
brew install postgresql postgis
```

### Création de la base de données

La base qui contiendra les données locales doit être créée au prélable.

```bash
createdb "apicarto"
psql -d "apicarto" -c "CREATE EXTENSION postgis"
```

### Lancer le service

```bash
npm start
```

## Développement derrière un proxy

En cas de nécessité, utiliser les [variables d'environnement standards](https://www.npmjs.com/package/request#controlling-proxy-behaviour-using-environment-variables).
