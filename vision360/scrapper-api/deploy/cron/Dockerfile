FROM alpine:3.19

RUN apk add --no-cache bash curl tzdata dcron

WORKDIR /opt/scrapperPlanning
COPY scripts/planning-sync.sh /opt/scrapperPlanning/scripts/planning-sync.sh
COPY deploy/cron/entrypoint.sh /entrypoint.sh

RUN chmod +x /opt/scrapperPlanning/scripts/planning-sync.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
