import unittest
from .set_match_data import set_match_data, initialize_web3_and_contract
from .get_match_data import get_match_data
from web3 import Web3
import hashlib
import random

def Add_game_history(scores, game):
	
	players = list(scores.keys())

	if (len(players) != 2):
		return "Error"
	player_1, player_2 = players[0], players[1]
	score_1, score_2 = scores[player_1], scores[player_2]

	# gen match id 

	# Déterminer le gagnant et le perdant
	if score_1 > score_2:
		winner = player_1
		loser = player_2
	elif score_2 > score_1:
		winner = player_2
		loser = player_1
	else:
		winner = "Draw"
		loser = "Draw"
	
	random_id = random.randint(1000, 99999)
	match_id = f"winner_{winner}_loser_{loser}_game_{game}_id_{random_id}"

	# Debug: Print the generated match ID
	print(f"Generated Match ID: {match_id}")

	# Store match data
	set_match_data(match_id, player_1, player_2, f"{score_1}-{score_2}", winner)

	return "success"

def Player_stat(player, game):
	try:
		print("Player_stat called")
		# Initialiser la connexion au contrat
		web3, contract = initialize_web3_and_contract()
		if not web3.is_connected():  # Utilisation correcte de is_connected()
			print("Erreur : Impossible de se connecter à la blockchain.")
			return None
		# Appeler la fonction getAllMatches pour récupérer tous les matchs
		try:
			all_matches = contract.functions.getAllMatches().call()
			print("------ ALL MATCHES ------")
			print(all_matches)
		except Exception as e:
			print(f"Erreur lors de l'appel de getAllMatches : {e}")
			return None

		# Filtrer les matchs dans lesquels le joueur a participé et qui correspondent au jeu spécifié
		player_matches = []
		for match in all_matches:
			try:
				if (match[1] == player or match[2] == player) and game in match[0]:  # On vérifie si le jeu fait partie de l'ID du match
					player_matches.append(match)
			except Exception as e:
				print(f"Erreur lors du filtrage des matchs pour le joueur {player} dans le jeu {game} : {e}")
				return None

		if not player_matches:
			print(f"Aucun match trouvé pour le joueur {player} dans le jeu {game}.")
		else:
			print(f"{len(player_matches)} match(s) trouvé(s) pour le joueur {player} dans le jeu {game}.")

		return player_matches

	except Exception as e:
		print(f"Erreur générale dans Player_stat pour le joueur {player} dans le jeu {game} : {e}")
		return None
	
def Game_history(game):
	try:
		# Initialiser la connexion au contrat
		web3, contract = initialize_web3_and_contract()
		if not web3.is_connected():  # Utilisation correcte de is_connected()
			print("Erreur : Impossible de se connecter à la blockchain.")
			return None
		
		# Appeler la fonction getAllMatches pour récupérer tous les matchs
		try:
			all_matches = contract.functions.getAllMatches().call()
		except Exception as e:
			print(f"Erreur lors de l'appel de getAllMatches : {e}")
			return None
		
		# Filtrer les matchs dans lesquels le joueur a participé et qui correspondent au jeu spécifié
		print('All Matches: ', all_matches)
		matches = []
		for match in all_matches:
			try:
				if game in match[0]:  # On vérifie si le jeu fait partie de l'ID du match
					matches.append(match)
			except Exception as e:
				print(f"Erreur lors du filtrage des matchs pour le jeu {game} : {e}")
				return None
		print('found matches');
		return matches
	
	except Exception as e:
		print(f"Erreur générale dans Game_history pour le jeu {game} : {e}")
		return None

	
def Match_history(self_player, other_player, game):
	try:
		# Initialiser la connexion au contrat
		web3, contract = initialize_web3_and_contract()
		if not web3.is_connected():  # Utilisation correcte de is_connected()
			print("Erreur : Impossible de se connecter à la blockchain.")
			return None
		
		# Appeler la fonction getAllMatches pour récupérer tous les matchs
		try:
			all_matches = contract.functions.getAllMatches().call()
		except Exception as e:
			print(f"Erreur lors de l'appel de getAllMatches : {e}")
			return None

		# Filtrer les matchs entre self_player et other_player pour le jeu spécifié
		matches_between_players = []
		for match in all_matches:
			try:
				# Vérifier si les deux joueurs sont dans le match et si le jeu correspond
				if ((match[1] == self_player and match[2] == other_player) or 
					(match[1] == other_player and match[2] == self_player)) and game in match[0]:
					matches_between_players.append(match)
			except Exception as e:
				print(f"Erreur lors du filtrage des matchs entre {self_player} et {other_player} pour le jeu {game} : {e}")
				return None

		if not matches_between_players:
			print(f"Aucun match trouvé entre {self_player} et {other_player} pour le jeu {game}.")
		else:
			print(f"{len(matches_between_players)} match(s) trouvé(s) entre {self_player} et {other_player} pour le jeu {game}.")

		# Retourner la liste des matchs trouvés
		return matches_between_players

	except Exception as e:
		print(f"Erreur générale dans Match_history pour les joueurs {self_player} et {other_player} dans le jeu {game} : {e}")
		return None
#    
# fonction test en desous pour que tu puisse voir comment ça fonctionne , 1 lancer le docker , puis aller dans le docker 
# avec la commande docker exec -it modif_blockchain-web-1  /bin/bash  et faire  python3 blockchain/ALL_FILE_NEEDED/asked_functions.py 
# et tu verra plein de logs et tu verra aussi ce que renvoi chaque fonction 

# dans l'ID il y à le nom du winner, le nom du loser, le jeux et puis un ID (rand)
# donc winner_{Winner name}_loser_{loser_name}_game_{jeux joué}_id_{rand}

#def test_functions():
#    # Premier cas de test : Alice gagne contre Bob
#    scores = {"Alice": 3, "Bob": 2}
#    game = "pong"
#    timestamp = None  # Pour simplifier, on n'utilise pas de timestamp ici
#
#    print("=== Test de la fonction Add_game_history (Alice gagne) ===")
#    match_id = Add_game_history(scores, game, timestamp)
#
#    if match_id:
#        print(f"Match créé avec succès : {match_id}")
#
#        print("\n=== Test de la fonction Player_stat pour Alice ===")
#        alice_stats = Player_stat("Alice", game)
#        if alice_stats:
#            print(f"Statistiques pour Alice : {alice_stats}")
#        else:
#            print("Erreur lors de la récupération des statistiques pour Alice.")
#
#        print("\n=== Test de la fonction Player_stat pour Bob ===")
#        bob_stats = Player_stat("Bob", game)
#        if bob_stats:
#            print(f"Statistiques pour Bob : {bob_stats}")
#        else:
#            print("Erreur lors de la récupération des statistiques pour Bob.")
#
#        print("\n=== Test de la fonction Match_history entre Alice et Bob ===")
#        match_history = Match_history("Alice", "Bob", game)
#        if match_history:
#            print(f"Historique des matchs entre Alice et Bob : {match_history}")
#        else:
#            print("Erreur lors de la récupération de l'historique des matchs entre Alice et Bob.")
#    else:
#        print("Erreur lors de la création du match.")
#
#    # Deuxième cas de test : Match nul entre Alice et Bob
#    scores_draw = {"Alice": 2, "Bob": 2}
#
#    print("\n=== Test de la fonction Add_game_history (Match nul) ===")
#    match_id_draw = Add_game_history(scores_draw, game, timestamp)
#
#    if match_id_draw:
#        print(f"Match (Draw) créé avec succès : {match_id_draw}")
#
#        print("\n=== Test de la fonction Player_stat pour Alice (après match nul) ===")
#        alice_stats = Player_stat("Alice", game)
#        if alice_stats:
#            print(f"Statistiques pour Alice : {alice_stats}")
#        else:
#            print("Erreur lors de la récupération des statistiques pour Alice après match nul.")
#
#        print("\n=== Test de la fonction Player_stat pour Bob (après match nul) ===")
#        bob_stats = Player_stat("Bob", game)
#        if bob_stats:
#            print(f"Statistiques pour Bob : {bob_stats}")
#        else:
#            print("Erreur lors de la récupération des statistiques pour Bob après match nul.")
#
#        print("\n=== Test de la fonction Match_history entre Alice et Bob (après match nul) ===")
#        match_history_draw = Match_history("Alice", "Bob", game)
#        if match_history_draw:
#            print(f"Historique des matchs entre Alice et Bob (après match nul) : {match_history_draw}")
#        else:
#            print("Erreur lors de la récupération de l'historique des matchs entre Alice et Bob après match nul.")
#    else:
#        print("Erreur lors de la création du match nul.")
	
# Appel de la fonction de test
# test_functions()