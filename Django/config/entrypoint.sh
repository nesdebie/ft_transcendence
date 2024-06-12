#!/bin/sh

# Run migrations
python3 manage.py migrate

# Start the Gunicorn server
gunicorn --bind 0.0.0.0:8000 SinglePageApp.wsgi:application
