#!/bin/bash
set -e

# Function to wait for a service to be ready
wait_for_service() {
    echo "Waiting for $1 to be ready..."
    echo "Attempting to connect to $2:$3 as user $4"
    until pg_isready -h "$2" -p "$3" -U "$4"; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 1
    done
    echo "$1 is ready!"
}

# Wait for databases to be ready
wait_for_service "App database" "$APP_DB_HOST" "$APP_DB_PORT" "$APP_DB_USER"
wait_for_service "Channel database" "$CHANNEL_DB_HOST" "$CHANNEL_DB_PORT" "$CHANNEL_DB_USER"

# # 2FA make migrations (Make migration peut provoquer des erreurs, si tu dois faire un makemigrations faite le dans le conteneur directement et pas a chaque fois)
# python3 manage.py makemigrations

# Run migrations
python3 manage.py migrate


# Start Gunicorn to serve the Django application
# exec gunicorn --bind 0.0.0.0:8000 SinglePageApp.wsgi:application --reload
daphne -b 0.0.0.0 -p 8000 SinglePageApp.asgi:application