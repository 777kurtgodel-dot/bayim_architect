#!/usr/bin/env sh
# Резервная копия сайта: база данных + загруженные файлы (медиатека и вложения заявок).
# Запускать на сервере из папки проекта. Ежедневно через cron, например:
#   15 3 * * * cd /opt/baiym && ./scripts/backup.sh >> backups/backup.log 2>&1
# Копии старше KEEP_DAYS дней удаляются. Обязательно копируйте папку backups на другой диск или в облако.
set -eu
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$BACKUP_DIR"

docker compose exec -T db pg_dump -U baiym -d baiym --format=custom > "$BACKUP_DIR/db_$STAMP.dump"
docker compose exec -T app tar czf - -C /app media private > "$BACKUP_DIR/files_$STAMP.tar.gz"

find "$BACKUP_DIR" -name 'db_*.dump' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'files_*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date '+%F %T') Готово: $BACKUP_DIR/db_$STAMP.dump, $BACKUP_DIR/files_$STAMP.tar.gz"
