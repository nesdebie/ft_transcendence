from web3 import Web3
from set_match_data import initialize_web3_and_contract

def display_all_matches():
    try:
        # init
        web3, contract = initialize_web3_and_contract()
        
        if not web3.is_connected():
            print("Erreur : Impossible de se connecter à la blockchain.")
            return None
        # show matched 
        try:
            all_matches = contract.functions.getAllMatches().call()
        except Exception as e:
            print(f"Erreur lors de l'appel de getAllMatches : {e}")
            return None

        if not all_matches:
            print("Aucun match trouvé sur la blockchain.")
            return None

		# show
        print(f"Total de {len(all_matches)} match(s) trouvé(s) :")
        for match in all_matches:
            match_id, participant1, participant2, score, winner = match
            print(f"Match ID: {match_id}, Participant 1: {participant1}, Participant 2: {participant2}, Score: {score}, Gagnant: {winner}")

    except Exception as e:
        print(f"Erreur générale : {e}")
        return None

display_all_matches()