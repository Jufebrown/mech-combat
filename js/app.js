/****************************************************
This is a turn-based strategy game that uses a hex
grid map. The map uses odd-q offset coodinates
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
const game = new Phaser.Game(640, 480, Phaser.CANVAS, "game-div", {
  init: function () {
    //initializes kinetic scrolling plugin
    this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
    this.game.kineticScrolling.configure({
      kineticMovement: true,
      timeConstantScroll: 250,
      horizontalScroll: true,
      verticalScroll: true,
      horizontalWheel: true,
      verticalWheel: false,
      deltaWheel: 40
    })
  },
  preload: onPreload,
  create: onCreate,
  // update: onUpdate,
});

let groupOffset = {x: 20, y: 20}

//sets up hex width and height. height should be sqrt(3)/2 of width but need to tweek to get spacing right
const hexagonHeight = 32;
const hexagonWidth = 34;
//number of hexes x and y
const gridSizeX = 50;
const gridSizeY = 50;

//for mouse position tracking
const columns = [Math.ceil(gridSizeY/2),Math.floor(gridSizeY/2)];

let moveIndex;
let sectorWidth = hexagonWidth/4*3;
let sectorHeight = hexagonHeight;
let gradient = (hexagonWidth/4)/(hexagonHeight/2);
let hexagonGroup;
let highlightGroup
let playerSquad
let enemySquad
let tween;
let currentSprite
let currentHex
let turnCounter = 1
let targetFound = false
let moveToCubePos


let explosions
let explosionSound

//preloads images
function onPreload() {
  game.load.image("hexagon", "assets/images/map_tiles/hexagon.png");
  game.load.image("highlight", "assets/images/map_tiles/highlight.png");
  game.load.image("player", "assets/images/mechs/player_ph.png")
  game.load.image("enemy", "assets/images/mechs/enemy_ph.png")
  game.load.spritesheet('mechExplosion', 'assets/images/explosions/mech-explosion.png', 100, 100)
  game.load.audio('mechExplosionSound', 'assets/sounds/big-explosion.mp3');
}

function onCreate() {

  this.game.kineticScrolling.start();
  // adds hexagonGroup
  hexagonGroup = game.add.group()
  hexagonGroup.z = 0
  playerSquad = game.add.group()
  playerSquad.z = 3
  enemySquad = game.add.group()
  enemySquad.z = 3

  //background color for whole canvas element
  game.stage.backgroundColor = "#b3c2d8"
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


  // loops through and adds rows and columns of hexes to hexagonGroup
  for(let i = 0; i < gridSizeX/2; i ++) {
    for(let j = 0; j < gridSizeY; j ++) {
      if(gridSizeX%2==0 || i+1<gridSizeX/2 || j%2==0){
        //x position for hex group
        let hexagonX = hexagonWidth*i*1.5+(hexagonWidth/4*3)*(j%2);
        //y position for hex group
        let hexagonY = hexagonHeight*j/2;
        let hexagon = game.add.sprite(hexagonX,hexagonY,"hexagon");
        hexagonGroup.add(hexagon);
      }
    }
  }


  // positions hexagonGroup
  hexagonGroup.y = groupOffset.y
  hexagonGroup.x = groupOffset.x
  //gives same position to playerSquad and enemySquad groups
  playerSquad.x = groupOffset.x
  playerSquad.y = groupOffset.y
  enemySquad.x = groupOffset.x
  enemySquad.y = groupOffset.y


  let worldWidth = hexagonWidth * gridSizeX - 100
  let worldHeight = (hexagonHeight * gridSizeY)/1.75
  this.game.world.setBounds(0, 0, worldWidth, worldHeight);


  addPlayerSquad()
  addEnemySquad()

  explosionSound = game.add.audio('mechExplosionSound');
  game.sound.setDecodedCallback(explosionSound, start, this);


  explosions = game.add.group();
  explosions.createMultiple(enemySquad.children.length, 'mechExplosion');
  explosions.forEach(setupExplosion, this);

  startPlayerTurn()

  drawHUD()

  // game.input.onDown.add(gofull, this);
  this.camera.flash('#000000', 2000);
}

function setupExplosion (explosions) {

    explosions.anchor.x = 0.5;
    explosions.anchor.y = 0.5;
    explosions.animations.add('kaboom');

}

function start() {
  console.log('explosion sound is ready')
}

function explodeMech(target) {
  game.world.bringToTop(explosions)
  let explosion = explosions.getFirstExists(false);
  explosion.reset(target.body.x+20, target.body.y+20);
  explosion.play('kaboom', 20, false, true);
  explosionSound.play()
}

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

function startPlayerTurn() {
  enablePlayerMoves()
}

function checkEndPlayerTurn() {
  if (checkPlayerDone) {
    enemyTurnSetup()
    startEnemyTurn()
  }
}

function enemyTurnSetup() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    enemySquad.children[i].hasMoved = false
    enemySquad.children[i].hasFired = false
  }
}

function checkPlayerDone() {
  let allPlayersDone = true
  for(var i = 0, length1 = playerSquad.chidren.length; i < length1; i++){
    if(playerSquad.chidren[i].hasFired === false) {
      allPlayersDone = false
    }
  }
  return allPlayersDone
}

function startEnemyTurn() {
  if (!victory) {
    enemyMoveType()
  }
}

function enemyMoveType() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    if (enemySquad.children[i].hasMoved === false) {
      if (enemySquad.children[i].movePattern === "patrol") {
        patrol()
      } else if (enemySquad.children[i].movePattern === "sentinel") {
        sentinel()
      } else if (enemySquad.children[i].movePattern === "alert") {
        chargeAtPlayer()
      } else if (enemySquad.children[i].movePattern === "objective") {
        objectiveMove()
      }
    }
  }
}

function chargeAtPlayer() {
  let nearestPlayer = findNearestPlayer(enemySquad.children[i])
  enemyMove(nearestPlayer)
}

function enemyMove(destinationSprite) {
  // body...
}

function findNearestPlayer(enemySquadMember) {
  let nearestPlayerDistance = 5000
  let nearestPlayer
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++) {
    if (game.physics.arcade.distanceBetween(enemySquadMember, playerSquad.children[i]) < nearestPlayerDistance) {
      nearestPlayerDistance = game.physics.arcade.distanceBetween(enemySquadMember, playerSquad.children[i])
      nearestPlayer = playerSquad.children[i]
    }
  }
  return nearestPlayer
}

function patrol() {

}

function sentinel() {

}


// //fullscreen function
// function gofull() {
//     if (game.scale.isFullScreen)
//     {
//         game.scale.stopFullScreen();
//     }
//     else
//     {
//         game.scale.startFullScreen(false);
//     }
// }
