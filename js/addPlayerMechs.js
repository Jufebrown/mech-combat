function addPlayerSquad() {
  let startingPlayerSquadArray = [
    {positionX: 10, positionY: 13},
    {positionX: 4, positionY: 13},
    {positionX: 18, positionY: 13}
    ]

  for(let i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingPlayerSquadArray[i].positionX)
    let startY = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
    new Scout(game, startX, startY)
    playerSquad.children[i].inputEnabled = true
    playerSquad.children[i].events.onInputDown.add(getMoveRange, playerSquad.children[i])
  }
}
