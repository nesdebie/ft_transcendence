import json
import re
from web3 import Web3

# Fonction pour extraire l'adresse du contrat depuis le fichier de résultats
def extract_contract_address(filename):
    try:
        with open(filename, 'r') as file:
            contents = file.read()
            # Recherche de l'adresse du contrat dans la sortie de migration
            match = re.search(r'contract address:\s*(0x[a-fA-F0-9]{40})', contents)
            if match:
                contract_address = match.group(1)
                print(f"Contract address found: {contract_address}")
                return contract_address
            else:
                print("No contract address found in the file.")
                return None
    except FileNotFoundError:
        print(f"File {filename} not found.")
        return None

# Connexion à Ganache
ganache_url = "http://127.0.0.1:7545"  # Assurez-vous que le port est 8545 comme dans votre Dockerfile
web3 = Web3(Web3.HTTPProvider(ganache_url))

# Vérifiez la connexion
if not web3.is_connected():
    print("Échec de la connexion à Ganache")
else:
    print("Connecté à Ganache")

# Charger l'ABI depuis le fichier JSON
try:
    with open('contract_abi.json', 'r') as file:
        contract_abi = json.load(file)
except FileNotFoundError:
    print("Fichier ABI introuvable.")
    exit(1)

# Extraire l'adresse du contrat depuis le fichier de résultats
contract_address = extract_contract_address('result_compilation_and_migration.txt')
if contract_address:
    print(f"Contract address is {contract_address}")
else:
    raise Exception("Impossible de trouver l'adresse du contrat.")

# Chargement du contrat avec l'ABI chargée
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def set_match_data(match_id, participant1, participant2, score, winner):
    try:
        # Récupérer les comptes
        accounts = web3.eth.accounts
        
        if len(accounts) == 0:
            raise Exception("Aucun compte disponible pour l'envoi de la transaction.")
        
        # Appeler la fonction addMatch
        tx_hash = contract.functions.addMatch(match_id, participant1, participant2, score, winner).transact({
            'from': accounts[0],
            'gas': 3000000
        })
        
        # Attendre la confirmation de la transaction
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Afficher le résultat
        if tx_receipt['status'] == 1:
            print(f"Match ajouté avec succès : {match_id}")
        else:
            print("Échec de l'ajout du match")
            
    except Exception as e:
        print(f"Erreur lors de l'ajout du match : {e}")

def get_match_data(match_id):
    try:
        # Appeler la fonction getMatchById pour récupérer les informations du match en utilisant l'ID
        match_data = contract.functions.getMatchById(match_id).call()
        
        # Afficher les données du match
        print(f"Détails du match récupéré pour l'ID : {match_id}")
        print(f"ID de la Partie : {match_data[0]}")
        print(f"Participant 1 : {match_data[1]}")
        print(f"Participant 2 : {match_data[2]}")
        print(f"Score : {match_data[3]}")
        print(f"Gagnant : {match_data[4]}")
    except Exception as e:
        print(f"Erreur lors de la récupération des données du match : {e}")

# Exemple d'utilisation
set_match_data("match3", "Alice3", "Bob3", "2-1", "Alice3")