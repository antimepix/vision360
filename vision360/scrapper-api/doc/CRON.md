# Cron (serveur)

Ce guide installe un cron hebdomadaire qui appelle `/planning/sync` avec le token.

## 1) Installer le script

```sh
sudo mkdir -p /opt/scrapperPlanning/scripts
sudo cp /chemin/vers/presta/scrapperPlanning/scripts/planning-sync.sh /opt/scrapperPlanning/scripts/
sudo chmod +x /opt/scrapperPlanning/scripts/planning-sync.sh
```

## 2) Créer le fichier d’environnement

```sh
sudo cp /chemin/vers/presta/scrapperPlanning/deploy/scrapperplanning.env.example /etc/scrapperplanning.env
sudo nano /etc/scrapperplanning.env
```

Contenu attendu :
```
PLANNING_SYNC_URL=http://127.0.0.1:5000
PLANNING_SYNC_TOKEN=TON_TOKEN
```

## 3) Crontab

Édite le crontab :
```sh
crontab -e
```

Ajoute :
```cron
0 3 * * 0 . /etc/scrapperplanning.env; /bin/bash /opt/scrapperPlanning/scripts/planning-sync.sh >> /var/log/planning-sync.log 2>&1
```

→ lance **dimanche à 03:00**.

## 4) Vérifier

```sh
tail -n 50 /var/log/planning-sync.log
```

## Notes
- Le script calcule automatiquement l’année scolaire (septembre → août).
- Si tu veux déclencher manuellement :
  ```sh
  . /etc/scrapperplanning.env
  /bin/bash /opt/scrapperPlanning/scripts/planning-sync.sh
  ```
