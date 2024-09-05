from pathlib import Path
import json
import re
from web3 import Web3
import os


BASE_DIR = Path(__file__).resolve().parent.parent
BLOCKCHAIN_DIR = os.path.join(BASE_DIR, 'ALL_FILE_NEEDED')

if not os.path.exists(BLOCKCHAIN_DIR):
    raise Exception(f"Le répertoire blockchain n'existe pas : {BLOCKCHAIN_DIR}")

def initialize_web3_and_contract():
    ganache_url = "http://127.0.0.1:7545"
    web3 = Web3(Web3.HTTPProvider(ganache_url))
    
    if not web3.is_connected():
        raise Exception("Échec de la connexion à Ganache")

    result_file = os.path.join(BLOCKCHAIN_DIR, 'result_compilation_and_migration.txt')
    contract_address = extract_contract_address(result_file)
    #contract_address = extract_contract_address('result_compilation_and_migration.txt')
    if not contract_address:
        raise Exception("Impossible de trouver l'adresse du contrat.")

    abi_file = os.path.join(BLOCKCHAIN_DIR, 'contract_abi.json')
    with open(abi_file, 'r') as file:
        contract_abi = json.load(file)
    
    #with open('contract_abi.json', 'r') as file:
    #    contract_abi = json.load(file)

    contract = web3.eth.contract(address=contract_address, abi=contract_abi)
    return web3, contract

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

def get_match_data(match_id):
    try:
        # init contract abi
        _, contract = initialize_web3_and_contract()
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
# get_match_data("match3")  # Remplacez par l'ID du match que vous souhaitez récupérer