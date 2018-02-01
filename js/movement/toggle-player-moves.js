'use strict';

module.exports = function() {
  function disablePlayerMoves() {
    for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
      playerSquad.children[i].events.onInputDown.remove(getMoveRange, playerSquad.children[i])
    }
  }
  
  function enablePlayerMoves() {
    for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
      if (playerSquad.children[i].hasMoved === false) {
        playerSquad.children[i].events.onInputDown.add(getMoveRange, playerSquad.children[i])
      }
    }
  }
}

