#!/bin/bash
set -e

cd /var/www/html

echo "[start.sh] Running Laravel production startup..."

# Create SQLite database file if it doesn't exist (e.g. on first boot with a fresh volume)
if [ ! -f database/database.sqlite ]; then
    echo "[start.sh] Creating SQLite database..."
    touch database/database.sqlite
    chown www-data:www-data database/database.sqlite
    chmod 664 database/database.sqlite
fi

# Run database migrations
echo "[start.sh] Running migrations..."
php artisan migrate --force

# Cache config, routes, events, views for performance
echo "[start.sh] Optimizing..."
php artisan optimize

echo "[start.sh] Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
