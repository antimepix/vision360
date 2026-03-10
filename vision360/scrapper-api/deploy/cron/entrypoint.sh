#!/usr/bin/env sh
set -e

: "${PLANNING_SYNC_URL:=http://api:5000}"
: "${PLANNING_SYNC_TOKEN:?PLANNING_SYNC_TOKEN is required}"
: "${CRON_SCHEDULE:=0 3 * * 0}"

cat >/etc/crontabs/root <<EOF
PLANNING_SYNC_URL=${PLANNING_SYNC_URL}
PLANNING_SYNC_TOKEN=${PLANNING_SYNC_TOKEN}
${CRON_SCHEDULE} /bin/bash /opt/scrapperPlanning/scripts/planning-sync.sh >> /var/log/planning-sync.log 2>&1
EOF

exec crond -f -l 2
