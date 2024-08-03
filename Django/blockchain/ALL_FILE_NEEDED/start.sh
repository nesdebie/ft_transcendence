

#!/bin/bash

cd /app/blockchain/ALL_FILE_NEEDED

echo "*** pwd in start scripte --> "
pwd

echo "** ls "

ls
echo "*** continue.."

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
# tail -f /dev/null



