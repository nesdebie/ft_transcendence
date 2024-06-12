Comment ça fonctionne ? 
	! On lance le scripte ./launch_docker.sh 
Dans le dossier ALL_FILE_NEEDED se trouve des fichier qui serons importé dans le docker.
Le docker vas installer ganache, et truffle. 
--> Truffle est utilisé poru crée des porjet blockchain ganache pemret d'avoir acces à une blockchain.
--> On déploie le smart contract dans ALL_FILE_NEEDED/contracts/PongMatches.sol ainsi que son fichier de migration ALL_FILE_NEEDED/migrations/2_deploy_contracts.js
On importe aussi les fonctions python, celle ci sont utilisé poru intéragir avec la blockchain:
	--> ALL_FILE_NEEDED/get_match_data.py est utilisé poru récupérer les info sur un match 
	--> ALL_FILE_NEEDED/set_match_data.py est utilisé pour mettre des info d'un match sur la blockchain.
Voici comment utiliser les 2 fonctions :
	--> get_match_data( MATCH_ID )  == on lui donne l'ID d'un match et si il se toruve sur la blockchain il nous la renvoie
	--> set_match_data(MATCH_ID, PLAYER1, PLAYER2, SCORE(ex:"2-1"), WINNER_NAME)
le scripte start.sh sert à importer les fichiers nécessaire après que le projet truffle sois initialisé sans arreter le docker.