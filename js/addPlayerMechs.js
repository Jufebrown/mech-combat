// function to add player squad to map. Plan on having squad array in level data
function addPlayerSquad() {
  let startingPlayerSquadArray = [
    {positionX: 6, positionY: 6},
    {positionX: 4, positionY: 6},
    {positionX: 8, positionY: 6}
    ]

  // loops over array and puts each unit on x,y coordinates
  for(let i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingPlayerSquadArray[i].positionX)
    let startY = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
    new Scout(game, startX, startY)
    //allows squad units to be clickable
    playerSquad.children[i].inputEnabled = true
  }
}
