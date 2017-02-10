/****************************************************
This is a turn-based strategy game that uses a hex grid
map. The map uses odd-q offset coodinates
****************************************************/



// Initialize Firebase
const config = {
  apiKey: "AIzaSyDnjSA0d_UhYUHmmLft9EV8pWtf14Dqgd8",
  authDomain: "mech-combat.firebaseapp.com",
  databaseURL: "https://mech-combat.firebaseio.com",
  storageBucket: "mech-combat.appspot.com",
  messagingSenderId: "898287259769"
};

firebase.initializeApp(config);

//starts new canvas
const game = new Phaser.Game(640, 480, Phaser.CANVAS, "", {preload: onPreload, create: onCreate,});

//sets up hex width and height. height should be sqrt(3)/2 of width but need to tweek to get spacing right
const hexagonHeight = 32;
const hexagonWidth = 34;
//number of hexes x and y
const gridSizeX = 24;
const gridSizeY = 29;

//for mouse position tracking
const columns = [Math.ceil(gridSizeY/2),Math.floor(gridSizeY/2)];
let moveIndex;
let sectorWidth = hexagonWidth/4*3;
let sectorHeight = hexagonHeight;
let gradient = (hexagonWidth/4)/(hexagonHeight/2);

// var marker;
let hexagonGroup;
let highlightGroup
let playerSquad
const playerSpriteArray = []
let highlightSpriteArray = []
// let player
let enemy
let enemyStartX = 10
let enemyStartY = 0
let tween;
let currentSprite
let currentHex

//preloads images
function onPreload() {
  game.load.image("hexagon", "images/hexagon.png");
  game.load.image("highlight", "images/highlight.png");
  game.load.image("player", "images/player_ph.png")
  game.load.image("enemy", "images/enemy_ph.png")
}

function onCreate() {
  // adds hexagonGroup
  hexagonGroup = game.add.group();
  playerSquad = game.add.group()

  //background color for whole canvas element
  game.stage.backgroundColor = "#ddd"
  game.physics.startSystem(Phaser.Physics.ARCADE);

  // loops through and adds rows and columns of hexes to hexagonGroup
  for(var i = 0; i < gridSizeX/2; i ++) {
    for(var j = 0; j < gridSizeY; j ++) {
      if(gridSizeX%2==0 || i+1<gridSizeX/2 || j%2==0){
        //x position for hex group
        var hexagonX = hexagonWidth*i*1.5+(hexagonWidth/4*3)*(j%2);
        //y position for hex group
        var hexagonY = hexagonHeight*j/2;
        var hexagon = game.add.sprite(hexagonX,hexagonY,"hexagon");
        hexagonGroup.add(hexagon);
      }
    }
  }

  // positions hexagonGroup
  hexagonGroup.y = (game.height-hexagonHeight*Math.ceil(gridSizeY/2))/2;
  if(gridSizeY%2==0){
    hexagonGroup.y-=hexagonHeight/4;
  }
  hexagonGroup.x = (game.width-Math.ceil(gridSizeX/2)*hexagonWidth-Math.floor(gridSizeX/2)*hexagonWidth/2)/2;
  if(gridSizeX%2==0){
    hexagonGroup.x-=hexagonWidth/8;
  }
  //gives same position to playerSquad group
  playerSquad.x = hexagonGroup.x
  playerSquad.y = hexagonGroup.y

  addPlayerSquad()

  //adds enemy
  enemy = game.add.sprite(0,0,"enemy");
  enemy.anchor.setTo(0.5375, .5);
  enemy.visible = true;
  enemy.x = hexToPixelX(enemyStartX)
  enemy.y = hexToPixelY(enemyStartX,enemyStartY)
  hexagonGroup.add(enemy);

  //adds marker and hides it
  // marker = game.add.sprite(0,0,"marker");
  // marker.anchor.setTo(0.5);
  // marker.visible=false;
  // hexagonGroup.add(marker); //adds marker to hexagonGroup
  // moveIndex = game.input.addMoveCallback(checkHex, this); //listener for mouse move
}

function addPlayerSquad() {
  let startingPlayerSquadArray = [
    {positionX: 10, positionY: 8},
    {positionX: 4, positionY: 8},
    {positionX: 18, positionY: 8}
    ]

  for(var i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
    playerSpriteArray[i] = game.add.sprite(0,0,"player");
    playerSpriteArray[i].anchor.setTo(0.5375, .5);
    playerSpriteArray[i].visible = true;
    playerSpriteArray[i].x = hexToPixelX(startingPlayerSquadArray[i].positionX)
    playerSpriteArray[i].y = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
    playerSquad.add(playerSpriteArray[i]);
    playerSpriteArray[i].inputEnabled = true
    playerSpriteArray[i].events.onInputDown.add(getMoveRange, playerSpriteArray[i])
  }
}

function cubeToOffset(x,z) {
  let offsetCoordinates = {}
  offsetCoordinates.col = x
  offsetCoordinates.row = z + (x - (x&1)) / 2
  return offsetCoordinates
}

function offsetToCube (col, row) {
  let cubeCoordinates = {}
  cubeCoordinates.x = col
  cubeCoordinates.z = row - (col - (col&1)) / 2
  cubeCoordinates.y = -cubeCoordinates.x-cubeCoordinates.z
  return cubeCoordinates
}

function cubeDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z))
}

function offset_distance(a, b){
  let ac = offsetToCube(a)
  let bc = offsetToCube(b)
  return cubeDistance(ac, bc)
}


function rangeCalc(startCubePosition, nRange) {
  let rangeResults = []
  let xMin = startCubePosition.x-nRange
  let xMax = startCubePosition.x+nRange
  let yMin = startCubePosition.y-nRange
  let yMax = startCubePosition.y+nRange
  let zMin = startCubePosition.z-nRange
  let zMax = startCubePosition.z+nRange
  let i = 0
  for (let x = xMin; x <= xMax; x++) {
    for (let y = Math.max(yMin, -x-zMax); y <= Math.min(yMax, -x-zMin); y++) {
        var z = -x-y;
        rangeResults[i] = {x: x, y: y, z: z,};
        i++
    }
  }
  return rangeResults
}
