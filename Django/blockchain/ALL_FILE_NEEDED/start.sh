##!/bin/bash
#
## rest files content 
#echo ""> result_compilation_and_migration.txt
#echo ""> ganache_log.txt
#
## Démarrer Ganache en arrière-plan sur le port 7545
#ganache --host 0.0.0.0 --port 7545 > ganache_log.txt &
#sleep 5
#
#echo "--- pwd ---"
#pwd
#
#echo "----"
#ls 
#
#echo "-----"
## Remplacer le fichier de configuration Truffle par la version correcte
#rm -rf truffle-config.js
#
#echo "---- "
#ls 
#echo " --- ls | grep ---"
#ls | grep real_truffle_config.js 
#
#echo "---"
#mv real_truffle_config.js truffle-config.js
#
#echo "----"
#ls 
#
#echo "-----"
## Compiler les contrats
#truffle compile >> result_compilation_and_migration.txt
#sleep 2
#
## Migrer les contrats
#truffle migrate --network development >> result_compilation_and_migration.txt
#sleep 2
#
## Garder le conteneur en cours d'exécution
#tail -f /dev/null

#!/bin/bash

# rest files content 
echo ""> result_compilation_and_migration.txt
echo ""> ganache_log.txt

# Démarrer Ganache en arrière-plan sur le port 7545
ganache --host 0.0.0.0 --port 7545 > ganache_log.txt &
sleep 5

echo "--- pwd ---"
pwd

# Vérifiez si le fichier real_truffle_config.js existe
if [ -f real_truffle_config.js ]; then
    echo "-----"
    # Remplacer le fichier de configuration Truffle par la version correcte
    rm -rf truffle-config.js
    echo "---- "
    ls 
    echo " --- ls | grep ---"
    ls | grep real_truffle_config.js 
    echo "---"
    mv real_truffle_config.js truffle-config.js
fi

echo "-----"
# Compiler les contrats
truffle compile >> result_compilation_and_migration.txt
sleep 2

# Migrer les contrats
truffle migrate --network development >> result_compilation_and_migration.txt
sleep 2

# Garder le conteneur en cours d'exécution
tail -f /dev/null




##!/bin/bash
#
## Démarrer Ganache en arrière-plan sur le port 7545
#ganache --host 0.0.0.0 --port 7545 > ganache_log.txt 2>&1 &
#sleep 5

## Vérifier si Ganache a démarré correctement
#if ! pgrep -f ganache > /dev/null; then
#    echo "Ganache n'a pas démarré correctement. Consultez ganache_log.txt pour plus de détails."
#    exit 1
#fi
#
## Remplacer le fichier de configuration Truffle par la version correcte
#if [ -f "real_truffle_config.js" ]; then
#    rm -rf truffle-config.js
#    mv real_truffle_config.js truffle-config.js
#else
#    echo "Le fichier real_truffle_config.js est introuvable."
#    exit 1
#fi
#
## Compiler les contrats
#truffle compile >> result_compilation_and_migration.txt 2>&1
#if [ $? -ne 0 ]; then
#    echo "Échec de la compilation des contrats. Consultez result_compilation_and_migration.txt pour plus de détails."
#    exit 1
#fi
#sleep 2
#
## Migrer les contrats
#truffle migrate --network development >> result_compilation_and_migration.txt 2>&1
#if [ $? -ne 0 ]; then
#    echo "Échec de la migration des contrats. Consultez result_compilation_and_migration.txt pour plus de détails."
#    exit 1
#fi
#sleep 2
#
## Garder le conteneur en cours d'exécution
#tail -f /dev/null