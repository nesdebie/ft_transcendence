#!/bin/sh
sleep 10

# Run migrations
python3 manage.py migrate

# Démarrer Gunicorn pour servir l'application Django
gunicorn --bind 0.0.0.0:8000 SinglePageApp.wsgi:application
