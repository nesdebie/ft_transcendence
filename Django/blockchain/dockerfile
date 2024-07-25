# Utiliser l'image de base Node.js 20
FROM node:20

# Mettre à jour et installer les dépendances de base
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Créer un environnement virtuel et installer web3.py dans cet environnement
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install web3

# Ajouter le venv au PATH pour que python et pip pointent vers l'environnement virtuel
ENV PATH="/opt/venv/bin:$PATH"

# Installer Ganache et Truffle globalement
RUN npm install -g ganache@7.9.1 truffle@5.11.5 --unsafe-perm

# Créer et se déplacer dans le dossier PROJECT
WORKDIR /PROJECT

# Initialiser un nouveau projet Truffle
RUN truffle init

# Copier le contrat intelligent et le fichier de migration dans les répertoires appropriés
COPY ./ALL_FILE_NEEDED/contracts/PongMatches.sol /PROJECT/contracts/PongMatches.sol
COPY ./ALL_FILE_NEEDED/migrations/2_deploy_contracts.js /PROJECT/migrations/2_deploy_contracts.js
COPY ./ALL_FILE_NEEDED/contract_abi.json /PROJECT/contract_abi.json

# Copier les scripts Python
COPY ./ALL_FILE_NEEDED/get_match_data.py /PROJECT/get_match_data.py
COPY ./ALL_FILE_NEEDED/set_match_data.py /PROJECT/set_match_data.py

# Copier le fichier de configuration truffle-config.js dans le répertoire du projet
COPY ./ALL_FILE_NEEDED/truffle-config.js /PROJECT/real_truffle_config.js

# Exposer le port par défaut de Ganache
EXPOSE 7545

# Utiliser le script pour démarrer les services
COPY ./ALL_FILE_NEEDED/start.sh /start.sh
RUN chmod +x /start.sh

# Démarrer le script start.sh
CMD ["/start.sh"]