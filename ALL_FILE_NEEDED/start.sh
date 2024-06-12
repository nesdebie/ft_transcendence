#!/bin/bash

# Démarrer Ganache en arrière-plan sur le port 7545
ganache --host 0.0.0.0 --port 7545 > ganache_log.txt &
sleep 5

# Remplacer le fichier de configuration Truffle par la version correcte
rm -rf truffle-config.js
mv real_truffle_config.js truffle-config.js

# Compiler les contrats
truffle compile >> result_compilation_and_migration.txt
sleep 2

# Migrer les contrats
truffle migrate --network development >> result_compilation_and_migration.txt
sleep 2

# Garder le conteneur en cours d'exécution
tail -f /dev/null