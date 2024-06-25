#!/bin/sh
sleep 10

# Appliquer les migrations de la base de données
python3 manage.py makemigrations
python3 manage.py migrate

# Démarrer Gunicorn pour servir l'application Django
gunicorn --bind 0.0.0.0:8000 SinglePageApp.wsgi:application
