'use strict';

module.exports = function() {
  function addPlayerSquad() {
    let startingPlayerSquadArray = [
      {positionX: 6, positionY: 6},
      {positionX: 4, positionY: 6},
      {positionX: 8, positionY: 6}
      ]
  
    for(let i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
      let startX = hexToPixelX(startingPlayerSquadArray[i].positionX)
      let startY = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
      new Scout(game, startX, startY)
      playerSquad.children[i].inputEnabled = true
    }
  }
}
