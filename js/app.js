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
let enemySquad
let highlightSpriteArray = []
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
  enemySquad = game.add.group()

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
  addEnemySquad()
  console.log(playerSquad)
}

function addPlayerSquad() {
  let startingPlayerSquadArray = [
    {positionX: 10, positionY: 13},
    {positionX: 4, positionY: 13},
    {positionX: 18, positionY: 13}
    ]

  for(var i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingPlayerSquadArray[i].positionX)
    let startY = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
    new Scout(game, startX, startY)
    playerSquad.children[i].inputEnabled = true
    playerSquad.children[i].events.onInputDown.add(getMoveRange, playerSquad.children[i])
  }
}

function addEnemySquad() {
  let startingEnemySquadArray = [
    {positionX: 10, positionY: 0},
    {positionX: 4, positionY: 0},
    {positionX: 18, positionY: 0}
    ]

  for(var i = 0, length1 = startingEnemySquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingEnemySquadArray[i].positionX)
    let startY = hexToPixelY(startingEnemySquadArray[i].positionX,startingEnemySquadArray[i].positionY)
    new EnemyScout(game, startX, startY)
  }
}


EnemyScout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, "enemy");
  this.name = "Scout";
  this.movePoints = 4
  this.weapon = "SMG"
  this.weaponRange = 2
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
  this.anchor.setTo(.25,.4);
  this.visible = true
  enemySquad.add(this);
};
EnemyScout.prototype = Object.create(Phaser.Sprite.prototype);
EnemyScout.prototype.constructor = EnemyScout;
