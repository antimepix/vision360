# 📚 Documentation API Scrapper Planning JUNIA

## Table des matières
1. [Introduction](#introduction)
2. [Démarrage rapide](#démarrage-rapide)
3. [Authentification](#authentification)
4. [Endpoints disponibles](#endpoints-disponibles)
5. [Modèles de données](#modèles-de-données)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Données de référence](#données-de-référence)
8. [Gestion des erreurs](#gestion-des-erreurs)
9. [FAQ](#faq)

---

## Introduction

Cette API permet de récupérer automatiquement les emplois du temps depuis Aurion (plateforme de JUNIA) pour une formation, une classe et une date spécifiques.

### Caractéristiques principales
- Récupération automatique des plannings Aurion
- Support de toutes les formations JUNIA (ISEN, HEI, ISA, etc.)
- API REST simple et documentée
- Authentification par clé API
- Swagger UI intégré pour les tests

### URL de base
```
http://localhost:5000
```
*(Remplacez par l'URL réelle du serveur en production)*

---

## Démarrage rapide

### Exemple simple
```bash
# 1. Récupérer la liste des formations
curl http://localhost:5000/api/formations

# 2. Récupérer les classes d'une formation
curl http://localhost:5000/api/formations/ISEN%20AP/classes

# 3. Scraper le planning (nécessite une clé API)
curl -X POST http://localhost:5000/api/scrape-planning \
  -H "Content-Type: application/json" \
  -H "X-API-Key: VOTRE_CLE_API" \
  -d '{
    "aurionName": "ISEN AP",
    "className": "AP5",
    "date": "2026-02-10T00:00:00"
  }'
```

---

## Authentification

### Clé API
La plupart des endpoints nécessitent une authentification par clé API.

**Header requis:**
```
X-API-Key: "Izfz3Sv5vkUFfzRURcFK6p6MjTTDPZyqoQ4Q56D360J48bXkFeMLBwSkKB2ArrEOwmg3C9YYJX8bzlIzmipMQCYemRMQsxB1LgTCkY0aYcYlq9S5s1TQa8UUevW7w0P"
```

### Endpoints publics (sans authentification)
- `GET /api/health`
- `GET /api/formations`
- `GET /api/formations/{formationName}/classes`
- `/swagger` (documentation interactive)

### Endpoints protégés (avec authentification)
- `POST /api/scrape-planning`


## Endpoints disponibles

### 1. Health Check

Vérifier que l'API fonctionne correctement.

#### Requête
```
GET /api/health
```

#### Réponse (200 OK)
```json
{
  "status": "Healthy",
  "timestamp": "2026-02-10T14:30:00Z"
}
```

---

### 2. Liste des formations

Récupérer toutes les formations disponibles.

#### Requête
```
GET /api/formations
```

#### Headers
```
Content-Type: application/json
```

#### Réponse (200 OK)
```json
[
  "ADIMAKER",
  "CPI",
  "HEI Ingénieur",
  "HEI Prépa",
  "ISA Enviro",
  "ISA Ingénieur",
  "ISEN AP",
  "ISEN CIR",
  "ISEN CNB",
  "ISEN CPG",
  "ISEN CSI",
  "ISEN Master"
]
```

---

### 3. Classes par formation

Récupérer les classes disponibles pour une formation spécifique.

#### Requête
```
GET /api/formations/{formationName}/classes
```

#### Paramètres URL
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `formationName` | string | Nom de la formation (URL encodé) | `ISEN%20AP` |

#### Exemple de requête
```bash
curl http://localhost:5000/api/formations/ISEN%20AP/classes
```

#### Réponse (200 OK)
```json
[
  "AP3",
  "AP4",
  "AP5",
  "Bordeaux AP3"
]
```

#### Codes d'erreur
- **404 Not Found** : Formation non trouvée
```json
{
  "error": "Formation 'ISEN XYZ' not found"
}
```

---

### 4. Scraper le planning (PRINCIPAL)

Récupérer les cours d'une classe pour une date donnée.

#### Requête
```
POST /api/scrape-planning
```

#### Headers
```
Content-Type: application/json
X-API-Key: VOTRE_CLE_API
```

#### Body (JSON)
```json
{
  "aurionName": "ISEN AP",
  "className": "AP5",
  "date": "2026-02-10T00:00:00"
}
```

#### Paramètres Body
| Paramètre | Type | Obligatoire | Description | Exemple |
|-----------|------|-------------|-------------|---------|
| `aurionName` | string | Oui | Nom de la formation dans Aurion | `"ISEN AP"` |
| `className` | string | Oui | Nom de la classe | `"AP5"` |
| `date` | string (ISO 8601) | Oui | Date du planning souhaité | `"2026-02-10T00:00:00"` |

#### Format de date accepté
```
YYYY-MM-DDTHH:mm:ss
Exemples valides:
- "2026-02-10T00:00:00"
- "2026-12-25T09:30:00"
- "2026-03-15T14:00:00Z"
```

#### Réponse (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "subject": "Mathématiques Avancées",
      "startTime": "2026-02-10T08:00:00",
      "endTime": "2026-02-10T10:00:00",
      "roomId": 201,
      "teacher": "M. Dupont",
      "idClass": 1
    },
    {
      "subject": "Programmation C++",
      "startTime": "2026-02-10T10:15:00",
      "endTime": "2026-02-10T12:15:00",
      "roomId": 105,
      "teacher": "Mme Martin",
      "idClass": 1
    },
    {
      "subject": "Physique Quantique",
      "startTime": "2026-02-10T14:00:00",
      "endTime": "2026-02-10T16:00:00",
      "roomId": null,
      "teacher": "Dr. Bernard",
      "idClass": 1
    }
  ]
}
```

#### Codes d'erreur

**400 Bad Request** : Paramètres invalides
```json
{
  "error": "Invalid date format. Expected ISO 8601 format."
}
```

**401 Unauthorized** : Clé API manquante
```json
{
  "error": "API Key is missing"
}
```

**403 Forbidden** : Clé API invalide
```json
{
  "error": "Invalid API Key"
}
```

**500 Internal Server Error** : Erreur lors du scraping
```json
{
  "error": "Failed to scrape planning: Connection timeout"
}
```

---

## Modèles de données

### PlanningRequest (Corps de requête)

Modèle utilisé pour la requête de scraping.

```csharp
public record PlanningRequest(
    string AurionName,      // Nom de la formation dans Aurion
    string ClassName,       // Nom de la classe
    DateTime Date           // Date cible pour extraire les cours
);
```

#### Exemple JSON
```json
{
  "aurionName": "ISEN AP",
  "className": "AP5",
  "date": "2026-02-10T00:00:00"
}
```

---

### CourseEvent (Cours)

Modèle représentant un cours dans le planning.

```csharp
public record CourseEvent(
    string Subject,         // Matière/Sujet du cours
    DateTime StartTime,     // Heure de début du cours
    DateTime EndTime,       // Heure de fin du cours
    int? RoomId,           // Numéro de salle (peut être null)
    string Teacher,        // Nom du professeur
    int IdClass            // ID de la classe (actuellement toujours 1)
);
```

#### Exemple JSON
```json
{
  "subject": "Algorithmique",
  "startTime": "2026-02-10T09:00:00",
  "endTime": "2026-02-10T11:00:00",
  "roomId": 302,
  "teacher": "Prof. Durand",
  "idClass": 1
}
```

#### Propriétés détaillées

| Propriété | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `subject` | string | Non | Nom de la matière/module enseigné |
| `startTime` | DateTime | Non | Date et heure de début du cours (format ISO 8601) |
| `endTime` | DateTime | Non | Date et heure de fin du cours (format ISO 8601) |
| `roomId` | int | Oui | Numéro de salle (null si non spécifié) |
| `teacher` | string | Non | Nom complet du professeur |
| `idClass` | int | Non | Identifiant de la classe (hardcodé à 1) |

---

## Exemples d'utilisation

### JavaScript (Fetch API)

#### Récupérer les formations
```javascript
async function getFormations() {
  const response = await fetch('http://localhost:5000/api/formations');
  const formations = await response.json();
  console.log('Formations disponibles:', formations);
  return formations;
}

getFormations();
```

#### Récupérer les classes
```javascript
async function getClasses(formation) {
  const encodedFormation = encodeURIComponent(formation);
  const response = await fetch(
    `http://localhost:5000/api/formations/${encodedFormation}/classes`
  );
  const classes = await response.json();
  console.log(`Classes pour ${formation}:`, classes);
  return classes;
}

getClasses('ISEN AP');
```

#### Scraper un planning
```javascript
async function scrapePlanning(aurionName, className, date) {
  const API_KEY = 'VOTRE_CLE_API';

  const response = await fetch('http://localhost:5000/api/scrape-planning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      aurionName: aurionName,
      className: className,
      date: date
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Scraping failed');
  }

  const result = await response.json();
  console.log(`${result.count} cours trouvés:`, result.data);
  return result.data;
}

// Exemple d'utilisation
scrapePlanning('ISEN AP', 'AP5', '2026-02-10T00:00:00')
  .then(courses => {
    courses.forEach(course => {
      console.log(`${course.startTime} - ${course.subject} (${course.teacher})`);
    });
  })
  .catch(error => console.error('Erreur:', error));
```

#### Exemple complet avec React
```javascript
import React, { useState, useEffect } from 'react';

function PlanningApp() {
  const [formations, setFormations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState('2026-02-10');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_API_KEY;
  const BASE_URL = 'http://localhost:5000';

  // Charger les formations au démarrage
  useEffect(() => {
    fetch(`${BASE_URL}/api/formations`)
      .then(res => res.json())
      .then(data => setFormations(data))
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Charger les classes quand une formation est sélectionnée
  useEffect(() => {
    if (selectedFormation) {
      const encoded = encodeURIComponent(selectedFormation);
      fetch(`${BASE_URL}/api/formations/${encoded}/classes`)
        .then(res => res.json())
        .then(data => setClasses(data))
        .catch(err => console.error('Erreur:', err));
    }
  }, [selectedFormation]);

  const handleScrapePlanning = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/scrape-planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          aurionName: selectedFormation,
          className: selectedClass,
          date: `${date}T00:00:00`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      setCourses(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Scrapper Planning JUNIA</h1>

      <div className="form">
        <select
          value={selectedFormation}
          onChange={e => setSelectedFormation(e.target.value)}
        >
          <option value="">Sélectionnez une formation</option>
          {formations.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          disabled={!selectedFormation}
        >
          <option value="">Sélectionnez une classe</option>
          {classes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <button
          onClick={handleScrapePlanning}
          disabled={!selectedFormation || !selectedClass || loading}
        >
          {loading ? 'Chargement...' : 'Récupérer le planning'}
        </button>
      </div>

      {error && <div className="error">Erreur: {error}</div>}

      <div className="courses">
        <h2>Cours trouvés: {courses.length}</h2>
        {courses.map((course, index) => (
          <div key={index} className="course-card">
            <h3>{course.subject}</h3>
            <p>
              {new Date(course.startTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
              {' - '}
              {new Date(course.endTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p>Professeur: {course.teacher}</p>
            {course.roomId && <p>Salle: {course.roomId}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanningApp;
```

---

### Python (Requests)

#### Installation
```bash
pip install requests
```

#### Récupérer les formations
```python
import requests

BASE_URL = "http://localhost:5000"

def get_formations():
    response = requests.get(f"{BASE_URL}/api/formations")
    response.raise_for_status()
    formations = response.json()
    print("Formations disponibles:", formations)
    return formations

get_formations()
```

#### Récupérer les classes
```python
import requests
from urllib.parse import quote

def get_classes(formation):
    encoded_formation = quote(formation)
    response = requests.get(
        f"{BASE_URL}/api/formations/{encoded_formation}/classes"
    )
    response.raise_for_status()
    classes = response.json()
    print(f"Classes pour {formation}:", classes)
    return classes

get_classes("ISEN AP")
```

#### Scraper un planning
```python
import requests
from datetime import datetime

API_KEY = "VOTRE_CLE_API"
BASE_URL = "http://localhost:5000"

def scrape_planning(aurion_name, class_name, date):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }

    payload = {
        "aurionName": aurion_name,
        "className": class_name,
        "date": date
    }

    response = requests.post(
        f"{BASE_URL}/api/scrape-planning",
        headers=headers,
        json=payload
    )

    if response.status_code != 200:
        error = response.json()
        raise Exception(error.get("error", "Scraping failed"))

    result = response.json()
    print(f"{result['count']} cours trouvés")
    return result['data']

# Exemple d'utilisation
try:
    courses = scrape_planning("ISEN AP", "AP5", "2026-02-10T00:00:00")

    for course in courses:
        start = datetime.fromisoformat(course['startTime'].replace('Z', '+00:00'))
        print(f"{start.strftime('%H:%M')} - {course['subject']} ({course['teacher']})")
        if course['roomId']:
            print(f"  Salle: {course['roomId']}")
        print()

except Exception as e:
    print(f"Erreur: {e}")
```

#### Script complet Python
```python
#!/usr/bin/env python3
import requests
from datetime import datetime, timedelta
from urllib.parse import quote
import json

class PlanningAPI:
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key

    def _get_headers(self, require_auth=False):
        headers = {"Content-Type": "application/json"}
        if require_auth and self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def health_check(self):
        """Vérifier le statut de l'API"""
        response = requests.get(f"{self.base_url}/api/health")
        return response.json()

    def get_formations(self):
        """Récupérer toutes les formations"""
        response = requests.get(f"{self.base_url}/api/formations")
        response.raise_for_status()
        return response.json()

    def get_classes(self, formation):
        """Récupérer les classes d'une formation"""
        encoded = quote(formation)
        response = requests.get(
            f"{self.base_url}/api/formations/{encoded}/classes"
        )
        response.raise_for_status()
        return response.json()

    def scrape_planning(self, aurion_name, class_name, date):
        """Scraper le planning pour une date donnée"""
        if not self.api_key:
            raise ValueError("API Key required for scraping")

        # Convertir la date en string ISO si c'est un objet datetime
        if isinstance(date, datetime):
            date = date.isoformat()

        payload = {
            "aurionName": aurion_name,
            "className": class_name,
            "date": date
        }

        response = requests.post(
            f"{self.base_url}/api/scrape-planning",
            headers=self._get_headers(require_auth=True),
            json=payload
        )

        if response.status_code != 200:
            error = response.json()
            raise Exception(error.get("error", "Scraping failed"))

        return response.json()

    def get_week_planning(self, aurion_name, class_name, start_date):
        """Récupérer le planning d'une semaine complète"""
        courses_by_day = {}

        for day in range(7):
            current_date = start_date + timedelta(days=day)
            try:
                result = self.scrape_planning(
                    aurion_name,
                    class_name,
                    current_date.isoformat()
                )
                courses_by_day[current_date.strftime('%Y-%m-%d')] = result['data']
            except Exception as e:
                print(f"Erreur pour {current_date}: {e}")
                courses_by_day[current_date.strftime('%Y-%m-%d')] = []

        return courses_by_day

# Exemple d'utilisation
if __name__ == "__main__":
    API_KEY = "VOTRE_CLE_API"
    api = PlanningAPI("http://localhost:5000", API_KEY)

    # Vérifier le statut
    print("Status:", api.health_check())

    # Lister les formations
    formations = api.get_formations()
    print(f"\n{len(formations)} formations disponibles:")
    for f in formations:
        print(f"  - {f}")

    # Lister les classes d'une formation
    classes = api.get_classes("ISEN AP")
    print(f"\nClasses ISEN AP:")
    for c in classes:
        print(f"  - {c}")

    # Scraper un planning
    print(f"\nPlanning du jour:")
    today = datetime.now()
    result = api.scrape_planning("ISEN AP", "AP5", today)

    print(f"{result['count']} cours trouvés:\n")
    for course in result['data']:
        start = datetime.fromisoformat(course['startTime'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(course['endTime'].replace('Z', '+00:00'))

        print(f"📚 {course['subject']}")
        print(f"   ⏰ {start.strftime('%H:%M')} - {end.strftime('%H:%M')}")
        print(f"   👨‍🏫 {course['teacher']}")
        if course['roomId']:
            print(f"   🏫 Salle {course['roomId']}")
        print()
```

---

### cURL

#### Récupérer les formations
```bash
curl -X GET "http://localhost:5000/api/formations" \
  -H "Content-Type: application/json"
```

#### Récupérer les classes
```bash
curl -X GET "http://localhost:5000/api/formations/ISEN%20AP/classes" \
  -H "Content-Type: application/json"
```

#### Scraper un planning
```bash
curl -X POST "http://localhost:5000/api/scrape-planning" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: VOTRE_CLE_API" \
  -d '{
    "aurionName": "ISEN AP",
    "className": "AP5",
    "date": "2026-02-10T00:00:00"
  }'
```

#### Avec jq pour formater la sortie
```bash
# Installer jq: sudo apt-get install jq (Linux) ou brew install jq (macOS)

curl -X POST "http://localhost:5000/api/scrape-planning" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: VOTRE_CLE_API" \
  -d '{
    "aurionName": "ISEN AP",
    "className": "AP5",
    "date": "2026-02-10T00:00:00"
  }' | jq '.'
```

---

### C# (.NET)

#### Utilisation avec HttpClient
```csharp
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

public class PlanningApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public PlanningApiClient(string baseUrl, string apiKey = null)
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(baseUrl)
        };
        _apiKey = apiKey;
    }

    public async Task<List<string>> GetFormationsAsync()
    {
        var response = await _httpClient.GetAsync("/api/formations");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<string>>();
    }

    public async Task<List<string>> GetClassesAsync(string formation)
    {
        var encodedFormation = Uri.EscapeDataString(formation);
        var response = await _httpClient.GetAsync($"/api/formations/{encodedFormation}/classes");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<string>>();
    }

    public async Task<PlanningResponse> ScrapePlanningAsync(
        string aurionName,
        string className,
        DateTime date)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("API Key is required");
        }

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/scrape-planning")
        {
            Content = JsonContent.Create(new PlanningRequest(aurionName, className, date))
        };
        request.Headers.Add("X-API-Key", _apiKey);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<PlanningResponse>();
    }
}

// Modèles
public record PlanningRequest(
    string AurionName,
    string ClassName,
    DateTime Date
);

public record PlanningResponse(
    bool Success,
    int Count,
    List<CourseEvent> Data
);

public record CourseEvent(
    string Subject,
    DateTime StartTime,
    DateTime EndTime,
    int? RoomId,
    string Teacher,
    int IdClass
);

// Exemple d'utilisation
class Program
{
    static async Task Main(string[] args)
    {
        var apiKey = "VOTRE_CLE_API";
        var client = new PlanningApiClient("http://localhost:5000", apiKey);

        // Récupérer les formations
        var formations = await client.GetFormationsAsync();
        Console.WriteLine($"Formations disponibles: {string.Join(", ", formations)}");

        // Récupérer les classes
        var classes = await client.GetClassesAsync("ISEN AP");
        Console.WriteLine($"Classes ISEN AP: {string.Join(", ", classes)}");

        // Scraper le planning
        var result = await client.ScrapePlanningAsync(
            "ISEN AP",
            "AP5",
            new DateTime(2026, 2, 10)
        );

        Console.WriteLine($"\n{result.Count} cours trouvés:\n");
        foreach (var course in result.Data)
        {
            Console.WriteLine($"📚 {course.Subject}");
            Console.WriteLine($"   ⏰ {course.StartTime:HH:mm} - {course.EndTime:HH:mm}");
            Console.WriteLine($"   👨‍🏫 {course.Teacher}");
            if (course.RoomId.HasValue)
            {
                Console.WriteLine($"   🏫 Salle {course.RoomId}");
            }
            Console.WriteLine();
        }
    }
}
```

---

### Postman

#### Collection Postman

Vous pouvez importer cette collection dans Postman:

```json
{
  "info": {
    "name": "JUNIA Planning Scraper API",
    "description": "Collection pour l'API de scraping des plannings Aurion",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000",
      "type": "string"
    },
    {
      "key": "api_key",
      "value": "VOTRE_CLE_API",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/health",
          "host": ["{{base_url}}"],
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Get Formations",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/formations",
          "host": ["{{base_url}}"],
          "path": ["api", "formations"]
        }
      }
    },
    {
      "name": "Get Classes by Formation",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/formations/ISEN AP/classes",
          "host": ["{{base_url}}"],
          "path": ["api", "formations", "ISEN AP", "classes"]
        }
      }
    },
    {
      "name": "Scrape Planning",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "X-API-Key",
            "value": "{{api_key}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"aurionName\": \"ISEN AP\",\n  \"className\": \"AP5\",\n  \"date\": \"2026-02-10T00:00:00\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/scrape-planning",
          "host": ["{{base_url}}"],
          "path": ["api", "scrape-planning"]
        }
      }
    }
  ]
}
```

---

## Données de référence

### Formations disponibles

| Formation | Description |
|-----------|-------------|
| `ADIMAKER` | ADIMAKER |
| `CPI` | Cycle Préparatoire Intégré |
| `HEI Ingénieur` | HEI - Cycle Ingénieur |
| `HEI Prépa` | HEI - Cycle Préparatoire |
| `ISA Enviro` | ISA Environnement |
| `ISA Ingénieur` | ISA - Cycle Ingénieur |
| `ISEN AP` | ISEN - Architecture et Programmation |
| `ISEN CIR` | ISEN - Cybersécurité et Infrastructures Réseaux |
| `ISEN CNB` | ISEN - Conception Numérique et Blockchain |
| `ISEN CPG` | ISEN - Classe Prépa Généraliste |
| `ISEN CSI` | ISEN - Cybersécurité Systèmes et Infrastructures |
| `ISEN Master` | ISEN - Master |

### Classes par formation

#### ADIMAKER
- Bordeaux A1
- Bordeaux A2
- Lille A1
- Lille A2

#### CPI
- CPI1
- CPI2

#### HEI Ingénieur
- HEI3
- HEI4
- HEI5

#### HEI Prépa
- HEI1
- HEI2

#### ISA Enviro
- ISA Enviro 3
- ISA Enviro 4
- ISA Enviro 5

#### ISA Ingénieur
- ISA3
- ISA4
- ISA5

#### ISEN AP
- AP3
- AP4
- AP5
- Bordeaux AP3

#### ISEN CIR
- CIR1
- CIR2
- CIR3

#### ISEN CNB
- CNB1
- CNB2
- CNB3

#### ISEN CPG
- CPG1
- CPG2
- CPG3

#### ISEN CSI
- CSI1
- CSI2
- CSI3

#### ISEN Master
- M1
- M2

---

## Gestion des erreurs

### Codes de statut HTTP

| Code | Description | Signification |
|------|-------------|---------------|
| `200` | OK | Requête réussie |
| `400` | Bad Request | Paramètres invalides ou manquants |
| `401` | Unauthorized | Clé API manquante |
| `403` | Forbidden | Clé API invalide |
| `404` | Not Found | Ressource non trouvée (formation, classe) |
| `500` | Internal Server Error | Erreur serveur (problème de scraping) |

### Format des erreurs

Toutes les erreurs renvoient un objet JSON avec une clé `error`:

```json
{
  "error": "Description de l'erreur"
}
```

### Erreurs courantes

#### 1. Clé API manquante (401)
```json
{
  "error": "API Key is missing"
}
```
**Solution:** Ajoutez le header `X-API-Key` à votre requête.

#### 2. Clé API invalide (403)
```json
{
  "error": "Invalid API Key"
}
```
**Solution:** Vérifiez que vous utilisez la bonne clé API.

#### 3. Formation non trouvée (404)
```json
{
  "error": "Formation 'ISEN XYZ' not found"
}
```
**Solution:** Utilisez `GET /api/formations` pour obtenir la liste des formations valides.

#### 4. Format de date invalide (400)
```json
{
  "error": "Invalid date format. Expected ISO 8601 format."
}
```
**Solution:** Utilisez le format ISO 8601: `YYYY-MM-DDTHH:mm:ss` (ex: `2026-02-10T00:00:00`)

#### 5. Erreur de scraping (500)
```json
{
  "error": "Failed to scrape planning: Element not found on page"
}
```
**Solutions possibles:**
- Vérifiez que la formation et la classe existent dans Aurion
- Réessayez plus tard (le site Aurion peut être temporairement indisponible)
- Contactez l'administrateur si le problème persiste

### Gestion des erreurs - Bonnes pratiques

#### JavaScript
```javascript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  // Traiter les données

} catch (error) {
  if (error.message.includes('API Key')) {
    console.error('Problème d\'authentification:', error.message);
  } else if (error.message.includes('not found')) {
    console.error('Ressource introuvable:', error.message);
  } else {
    console.error('Erreur inattendue:', error.message);
  }
}
```

#### Python
```python
try:
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    # Traiter les données

except requests.exceptions.HTTPError as e:
    error = e.response.json()
    if e.response.status_code == 401:
        print(f"Authentification requise: {error['error']}")
    elif e.response.status_code == 403:
        print(f"Clé API invalide: {error['error']}")
    elif e.response.status_code == 404:
        print(f"Non trouvé: {error['error']}")
    else:
        print(f"Erreur: {error['error']}")

except requests.exceptions.RequestException as e:
    print(f"Erreur de connexion: {e}")
```

---

## FAQ

### Questions générales

#### Q: Où trouver ma clé API ?
**R:** Contactez l'administrateur du projet pour obtenir une clé API. Conservez-la en sécurité et ne la partagez jamais publiquement.

#### Q: Quelle est la limite de requêtes ?
**R:** Il n'y a pas de limite stricte actuellement, mais évitez de faire des requêtes excessives pour ne pas surcharger le serveur Aurion.

#### Q: Les données sont-elles mises en cache ?
**R:** Non, chaque requête déclenche un nouveau scraping en temps réel sur Aurion.

#### Q: Puis-je récupérer plusieurs jours en une seule requête ?
**R:** Non, vous devez faire une requête par jour. Voir les exemples de code pour récupérer une semaine complète.

#### Q: Combien de temps prend une requête de scraping ?
**R:** En général 10-30 secondes, selon la charge du serveur Aurion et la complexité de la navigation.

### Questions techniques

#### Q: Pourquoi mes dates ne fonctionnent pas ?
**R:** Assurez-vous d'utiliser le format ISO 8601: `YYYY-MM-DDTHH:mm:ss`
```javascript
// ✅ Correct
"2026-02-10T00:00:00"
"2026-12-25T09:30:00"

// ❌ Incorrect
"10/02/2026"
"2026-02-10"
"10-02-2026 00:00:00"
```

#### Q: Comment gérer les fuseaux horaires ?
**R:** Les heures retournées sont en heure locale. Vous pouvez ajouter `Z` pour UTC ou `+01:00` pour le fuseau souhaité.

#### Q: Que signifie `roomId: null` ?
**R:** Cela signifie qu'aucune salle n'est spécifiée pour ce cours dans Aurion (cours à distance, salle TBD, etc.).

#### Q: Comment encoder les noms de formation dans l'URL ?
**R:**
```javascript
// JavaScript
encodeURIComponent("ISEN AP")  // → "ISEN%20AP"

// Python
from urllib.parse import quote
quote("ISEN AP")  // → "ISEN%20AP"

// Manuellement
"ISEN AP" → "ISEN%20AP" (remplacer espaces par %20)
```

#### Q: L'API fonctionne-t-elle pendant les vacances ?
**R:** Oui, mais Aurion peut ne pas avoir de cours programmés. La requête réussira mais retournera une liste vide.

#### Q: Puis-je récupérer des plannings pour l'année prochaine ?
**R:** Oui, tant que les données sont disponibles dans Aurion. Le scraper peut naviguer jusqu'à 52 semaines dans le futur.

### Résolution de problèmes

#### Problème: "API Key is missing"
**Solution:**
```bash
# Vérifiez que vous envoyez bien le header
curl -X POST "http://localhost:5000/api/scrape-planning" \
  -H "X-API-Key: VOTRE_CLE"  # ← Cette ligne est obligatoire
  -H "Content-Type: application/json" \
  -d '...'
```

#### Problème: "Formation not found"
**Solution:**
1. Listez les formations disponibles: `GET /api/formations`
2. Vérifiez l'orthographe exacte (sensible à la casse)
3. Utilisez le nom exact retourné par l'API

#### Problème: "Failed to scrape planning"
**Solutions:**
1. Vérifiez que la formation et classe existent
2. Réessayez dans quelques minutes
3. Vérifiez que le serveur Aurion est accessible
4. Contactez l'administrateur si persistant

#### Problème: Cours manquants dans la réponse
**Causes possibles:**
1. La date demandée n'a pas de cours dans Aurion
2. Les cours n'ont pas encore été publiés par l'administration
3. C'est un jour férié ou weekend sans cours

#### Problème: Temps de réponse très long
**Causes:**
1. Premier scraping de la journée (démarre Chrome)
2. Navigation nécessaire à travers plusieurs semaines
3. Charge élevée sur le serveur Aurion

**Solution:** Patienter 30-60 secondes maximum

---

## Exemples de cas d'usage

### 1. Application mobile de planning étudiant
Créez une app qui affiche le planning de la journée au réveil.

```javascript
// Récupérer le planning du jour
const today = new Date().toISOString().split('T')[0] + 'T00:00:00';
const courses = await scrapePlanning('ISEN AP', 'AP5', today);

// Afficher les prochains cours
const now = new Date();
const nextCourses = courses.filter(c =>
  new Date(c.startTime) > now
);
```

### 2. Bot Discord/Slack
Envoyez automatiquement le planning de la journée.

```python
import discord
from datetime import datetime

@bot.command()
async def planning(ctx, classe="AP5"):
    api = PlanningAPI(BASE_URL, API_KEY)
    today = datetime.now()
    result = api.scrape_planning("ISEN AP", classe, today)

    embed = discord.Embed(title=f"Planning {classe} - {today.strftime('%d/%m/%Y')}")
    for course in result['data']:
        start = datetime.fromisoformat(course['startTime'])
        embed.add_field(
            name=f"{start.strftime('%H:%M')} - {course['subject']}",
            value=f"{course['teacher']} - Salle {course['roomId'] or 'TBD'}",
            inline=False
        )

    await ctx.send(embed=embed)
```

### 3. Export vers Google Calendar
Synchronisez automatiquement le planning avec Google Calendar.

```javascript
// Utiliser l'API Google Calendar pour ajouter les cours
courses.forEach(async course => {
  await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: course.subject,
      location: course.roomId ? `Salle ${course.roomId}` : '',
      description: `Professeur: ${course.teacher}`,
      start: {
        dateTime: course.startTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: course.endTime,
        timeZone: 'Europe/Paris',
      },
    },
  });
});
```

### 4. Statistiques de présence enseignants
Analysez la charge de travail des professeurs.

```python
from collections import Counter

# Récupérer plusieurs jours
all_courses = []
for day in range(30):
    date = datetime.now() + timedelta(days=day)
    result = api.scrape_planning("ISEN AP", "AP5", date)
    all_courses.extend(result['data'])

# Compter les cours par professeur
teacher_stats = Counter(course['teacher'] for course in all_courses)
for teacher, count in teacher_stats.most_common():
    print(f"{teacher}: {count} cours")
```

---

## Swagger UI

L'API dispose d'une interface Swagger pour tester les endpoints directement dans votre navigateur.

### Accès
```
http://localhost:5000/swagger
```

### Fonctionnalités
- Documentation interactive
- Test des endpoints directement
- Visualisation des modèles
- Pas besoin de Postman ou curl

### Utilisation
1. Ouvrez `http://localhost:5000/swagger` dans votre navigateur
2. Cliquez sur un endpoint pour l'expandre
3. Cliquez sur "Try it out"
4. Remplissez les paramètres
5. Pour les endpoints protégés:
   - Cliquez sur le cadenas en haut à droite
   - Entrez votre clé API
   - Cliquez "Authorize"
6. Cliquez sur "Execute"
7. Voir la réponse dans la section "Response"

---

## Architecture technique

### Stack
- **Backend:** .NET 9.0 (Minimal APIs)
- **Web Scraping:** Selenium WebDriver 4.35.0
- **Browser:** Chrome (via ChromeDriver 141)
- **Documentation:** Swagger/Swashbuckle

### Fonctionnement du scraper
1. Lance une instance Chrome headless
2. Se connecte à Aurion avec des identifiants
3. Navigate jusqu'au planning de la formation/classe
4. Change la semaine affichée si nécessaire
5. Extrait les événements de cours via le DOM
6. Parse les informations (matière, prof, salle, horaires)
7. Retourne les données en JSON

### Variables d'environnement
```bash
AURION_LOGIN=username        # Compte Aurion pour le scraping
AURION_PASSWORD=password     # Mot de passe Aurion
API_KEY=your_api_key        # Clé API pour l'authentification
```

---

## Support et contact

### Problèmes techniques
Si vous rencontrez des problèmes:
1. Consultez la section [FAQ](#faq)
2. Vérifiez la section [Gestion des erreurs](#gestion-des-erreurs)
3. Testez vos requêtes sur [Swagger](#swagger-ui)
4. Contactez l'administrateur du projet

### Contributions
Ce projet est maintenu par les étudiants de JUNIA. Les contributions sont les bienvenues.

### Licence
À définir selon les besoins du projet.

---

**Version de la documentation:** 1.0
**Dernière mise à jour:** 10 février 2026
**API Version:** 1.0
