# API - scrapperPlanning

Documentation pour les developpeurs.

## Authentification

Toutes les routes (sauf `/health` et `/swagger`) exigent le header :

```
X-API-Key: TON_TOKEN
```

Le token est defini dans la config (`ApiAuth:Token`) ou en variable d'environnement.

## Base URL

```
http://localhost:5000
```

## Endpoints

### Health

```
GET /health
```

Reponse : `{ "status": "Healthy" }` (ou `Unhealthy`)

---

### Planning sync

```
POST /planning/sync
```

Body (JSON) :
```
{ "date": "2026-01-24" }
```
ou
```
{ "schoolYear": 2025 }
```

- `date` : synchronise une seule journee
- `schoolYear` : synchronise l'annee scolaire (septembre -> aout)

Reponse :
```
{
  "success": true,
  "message": "Données récupérées avec succès",
  "eventsFetched": 14,
  "eventsInserted": 14,
  "durationSeconds": 9.92
}
```

Exemple :
```sh
curl -X POST "http://localhost:5000/planning/sync" \
  -H "X-API-Key: TON_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schoolYear":2025}'
```

---

### Rooms

```
GET /rooms
```

Filtres :
- `aurionCode`
- `room` (contient)

Exemple :
```sh
curl "http://localhost:5000/rooms?room=E" \
  -H "X-API-Key: TON_TOKEN"
```

---

### Classes

```
GET /classes
```

Filtres :
- `aurionCode`
- `name` (contient)

---

### Courses

```
GET /courses
```

Filtres :
- `aurionCode`
- `course` (contient)
- `module` (contient)

---

### Lecturers

```
GET /lecturers
```

Filtres :
- `firstName` (contient)
- `lastName` (contient)

---

### Profiles

```
GET /profiles
```

Filtres :
- `firstName` (contient)
- `lastName` (contient)

---

### Planning events

```
GET /planning/events
```

Filtres (optionnels) :
- `date=YYYY-MM-DD` (journee)
- `start=YYYY-MM-DD` (debut)
- `end=YYYY-MM-DD` (fin)
- `schoolYear=2025` ou `schoolYear=2025-2026`
- `includeRelations=true` (classes/lecturers/courses/students)
- `idAurion`
- `processed=true|false`
- `className` (contient)
- `roomId`

Exemples :
```sh
curl "http://localhost:5000/planning/events?date=2026-01-24" \
  -H "X-API-Key: TON_TOKEN"
```

```sh
curl "http://localhost:5000/planning/events?schoolYear=2025&includeRelations=true" \
  -H "X-API-Key: TON_TOKEN"
```

---

### Planning events (date dans l'URL)

```
GET /planning/events/date/{date}
```

Exemple :
```sh
curl "http://localhost:5000/planning/events/date/2026-01-24" \
  -H "X-API-Key: TON_TOKEN"
```

## Swagger

Swagger est disponible sur :
```
http://localhost:5000/swagger
```

Clique sur **Authorize** et renseigne `X-API-Key` avec ton token.
