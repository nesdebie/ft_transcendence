#!/bin/sh
sleep 10

# Run migrations
python3 manage.py migrate

# Start the Gunicorn server "Right way"
#gunicorn --bind 0.0.0.0:8000 SinglePageApp.wsgi:application

python3 manage.py runserver 0.0.0.0:8000