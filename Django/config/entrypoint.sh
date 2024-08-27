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

# ganache / blockchain
echo "starting ganache ..."
cd ./blockchain/ALL_FILE_NEEDED
echo "pwd" 
pwd
./start.sh 

cd ../..



echo "start database .."
# Wait for databases to be ready
wait_for_service "App database" "$APP_DB_HOST" "$APP_DB_PORT" "$APP_DB_USER"
wait_for_service "Channel database" "$CHANNEL_DB_HOST" "$CHANNEL_DB_PORT" "$CHANNEL_DB_USER"

# echo "migrations .."
# 2FA make migrations 
# python3 manage.py makemigrations
# Run migrations
python3 manage.py migrate
python3 manage.py migrate channels_postgres --database=channels_postgres

# Start Uvicorn to serve the Django application over HTTPS
echo "Starting Uvicorn with SSL..."
uvicorn SinglePageApp.asgi:application --host 0.0.0.0 --port 443 --ssl-keyfile /app/private.key --ssl-certfile /app/certificate.cr
