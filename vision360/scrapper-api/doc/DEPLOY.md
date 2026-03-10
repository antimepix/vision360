# Déploiement Docker + cron intégré

Ce guide déploie :
- l’API `scrapperPlanning`
- une base PostgreSQL
- un cron qui appelle `/planning/sync` chaque dimanche à 03:00

## 1) Pré-requis
- Docker + Docker Compose
- Un token API pour sécuriser l’API
- Les identifiants Aurion

## 2) Préparer l’environnement

```sh
cd /chemin/vers/presta/scrapperPlanning/deploy
cp .env.example .env
```

Éditer `.env` :
```
DB_PASSWORD=CHANGE_ME
API_TOKEN=CHANGE_ME
AURION_USERNAME=CHANGE_ME
AURION_PASSWORD=CHANGE_ME
```

## 3) Lancer le stack

```sh
docker compose up -d --build
```

L’API est disponible sur : `http://<server>:5000`

## 4) Vérifier

```sh
docker compose ps
docker logs scrapperplanning-api --tail=50
docker logs scrapperplanning-cron --tail=50
```

## 5) Cron intégré

Le cron est géré par le conteneur `scrapperplanning-cron`.
Par défaut, il exécute :
```
POST /planning/sync
```
avec `schoolYear` calculé automatiquement (septembre → août).

**Horaire par défaut** : dimanche à 03:00.

### Modifier l’horaire

Dans `deploy/docker-compose.yml`, variable :
```
CRON_SCHEDULE: "0 3 * * 0"
```

## 6) Mettre à jour

```sh
docker compose pull
docker compose up -d --build
```

## 7) Stopper

```sh
docker compose down
```

## Notes
- L’API utilise `API_TOKEN` pour sécuriser les routes (header `X-API-Key`).
- La base est persistée dans le volume Docker `scrapperplanning_db`.
