# Utilisez l'image Nginx de base
FROM nginx:latest

# Installer OpenSSL pour générer les certificats
RUN apt-get update && apt-get install -y openssl

# Générer un certificat SSL autosigné
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key \
    -out /etc/ssl/certs/selfsigned.crt \
    -subj "/C=FR/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

RUN touch /var/log/nginx/error.log /var/log/nginx/access.log

# Copiez le fichier de configuration nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 443 pour HTTPS
EXPOSE 443