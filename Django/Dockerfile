# Utilisez l'image de base Debian
FROM debian:bullseye

# S'assurer que la sortie Python est sans tampon
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install system dependencies
RUN apt-get update
RUN apt-get install -y python3 python3-pip bash procps
RUN apt-get upgrade
RUN apt-get clean



COPY . /app/.

# Installer les dépendances Python
RUN pip install --upgrade pip \
    && pip install -r config/requirements.txt

# Ajouter les permissions d'exécution pour le script d'entrée
RUN chmod +x /app/config/entrypoint.sh

# Exposer le port 8000 pour Gunicorn
EXPOSE 8000

# Utiliser le script d'entrée pour exécuter le conteneur
ENTRYPOINT ["/app/config/entrypoint.sh"]