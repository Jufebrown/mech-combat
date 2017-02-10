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
let playerSpriteArray = []
let enemySpriteArray = []
let highlightSpriteArray = []
// let player
let enemy
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
 addEnemySquad()

  //adds marker and hides it
  // marker = game.add.sprite(0,0,"marker");
  // marker.anchor.setTo(0.5);
  // marker.visible=false;
  // hexagonGroup.add(marker); //adds marker to hexagonGroup
  // moveIndex = game.input.addMoveCallback(checkHex, this); //listener for mouse move
}

function addPlayerSquad() {
  let startingPlayerSquadArray = [
    {positionX: 10, positionY: 13},
    {positionX: 4, positionY: 13},
    {positionX: 18, positionY: 13}
    ]

  for(var i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
    playerSpriteArray[i] = game.add.sprite(0,0,"player");
    playerSpriteArray[i].anchor.setTo(0.5375, .5)
    playerSpriteArray[i].visible = true;
    playerSpriteArray[i].x = hexToPixelX(startingPlayerSquadArray[i].positionX)
    playerSpriteArray[i].y = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
    playerSquad.add(playerSpriteArray[i]);
    playerSpriteArray[i].inputEnabled = true
    playerSpriteArray[i].events.onInputDown.add(getMoveRange, playerSpriteArray[i])
  }
}

function addEnemySquad() {
  let startingEnemySquadArray = [
    {positionX: 10, positionY: 0},
    {positionX: 4, positionY: 0},
    {positionX: 18, positionY: 0}
    ]

  for(var i = 0, length1 = startingEnemySquadArray.length; i < length1; i++){
    enemySpriteArray[i] = new MechCombat.Vehicle.Mech.EnemyScout(game,0,0)
    enemySpriteArray[i].x = hexToPixelX(startingEnemySquadArray[i].positionX)
    enemySpriteArray[i].y = hexToPixelY(startingEnemySquadArray[i].positionX,startingEnemySquadArray[i].positionY)
    playerSquad.add(enemySpriteArray[i]);
  }
}











let MechCombat = {}
MechCombat.Vehicle = {}


/************************************
Mech Types:
Scout
************************************/

MechCombat.Vehicle.Mech = function() {
  this.aerial = true;
};
MechCombat.Vehicle.Mech.prototype = new MechCombat.Vehicle.Robot();


MechCombat.Vehicle.Scout = function() {
  this.name = "Scout";
  this.weapon = "MG"
  this.movePoints = 5
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
};
MechCombat.Vehicle.FixedWing.prototype = new MechCombat.Vehicle.Mech();


// MechCombat.Vehicle.Rotor = function() {
//   this.name = "Rotor";
//   this.health = Math.floor((Math.random() * 50) + 300)
//   this.damage = Math.floor((Math.random() * 50) + 150)
// };
// MechCombat.Vehicle.Rotor.prototype = new MechCombat.Vehicle.Mech();
