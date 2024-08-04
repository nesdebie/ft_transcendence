// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongMatches {
    struct Match {
        string matchId;
        string participant1;
        string participant2;
        string score;
        string winner;
    }

    Match[] public matches;
    mapping(string => uint) public matchIndexById;
    mapping(string => bool) public matchExists;

    event MatchAdded(string matchId, string participant1, string participant2, string score, string winner);

    function addMatch(
        string memory _matchId,
        string memory _participant1,
        string memory _participant2,
        string memory _score,
        string memory _winner
    ) public {
        // Vérification si l'ID de match existe déjà
        require(!matchExists[_matchId], "id already used");

        Match memory newMatch = Match(_matchId, _participant1, _participant2, _score, _winner);
        matches.push(newMatch);
        matchIndexById[_matchId] = matches.length - 1;
        matchExists[_matchId] = true;

        emit MatchAdded(_matchId, _participant1, _participant2, _score, _winner);
    }

    function getMatchById(string memory _matchId) public view returns (Match memory) {
        // Vérification si l'ID de match existe
        require(matchExists[_matchId], "match not found");
        
        uint index = matchIndexById[_matchId];
        return matches[index];
    }

    function getAllMatches() public view returns (Match[] memory) {
        return matches;
    }
}