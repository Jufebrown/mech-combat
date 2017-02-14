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
let victory = false
let explosions
let explosionSound


function enemyMoveType() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    if (enemySquad.children[i].hasMoved === false) {
      let currentlyMovingEnemy = enemySquad.children[i]
      if (enemySquad.children[i].movePattern === "patrol") {
        patrol(currentlyMovingEnemy)
      } else if (enemySquad.children[i].movePattern === "sentinel") {
        sentinel(currentlyMovingEnemy)
      } else if (enemySquad.children[i].movePattern === "alert") {
        chargeAtPlayer(currentlyMovingEnemy)
      } else if (enemySquad.children[i].movePattern === "objective") {
        objectiveMove(currentlyMovingEnemy)
      }
    }
  }
}

function chargeAtPlayer(currentlyMovingEnemy) {
  let nearestPlayer = findNearestPlayer(currentlyMovingEnemy)
  enemyMove(currentlyMovingEnemy, nearestPlayer)
}

function enemyMove(currentlyMovingEnemy, destinationSprite) {
  getEnemyMoveRange(currentlyMovingEnemy)
}

function getEnemyMoveRange(currentlyMovingEnemy) {
  currentSprite = this
  let startCubePosition = offsetToCube(hexPositionFromSpriteCoordinates(currentlyMovingEnemy.x, currentlyMovingEnemy.y))
  let nRange = currentlyMovingEnemy.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'eMove'
  highlightERange(cubeMoveRange, nextAction, currentlyMovingEnemy)
}

function highlightERange(cubeRange, nextAction, currentlyMovingEnemy) {
  highlightGroup = game.add.group()
  highlightGroup.x = hexagonGroup.x
  highlightGroup.y = hexagonGroup.y
  highlightGroup.z = 1
  targetFound = false
  for(var i = 0, length1 = cubeRange.length; i < length1; i++){
    let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
    let startX = hexToPixelX(currentHex.col)
    let startY = hexToPixelY(currentHex.col,currentHex.row)
    new Highlight(game, startX, startY)
    highlightGroup.children[i].inputEnabled = true
    game.physics.enable(highlightGroup.children[i], Phaser.Physics.ARCADE)
    highlightGroup.children[i].body.setSize(16, 16, 0, 0)
    if (nextAction === 'eMove') {
      highlightGroup.children[i].events.onInputDown.add(checkHex, highlightGroup.children[i])
    } else if (nextAction === 'eFire') {
      eTargetCheck(highlightGroup.children[i])
    }
  }
}



function findNearestPlayer(currentlyMovingEnemy) {
  let nearestPlayerDistance = 5000
  let nearestPlayer
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++) {
    if (game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i]) < nearestPlayerDistance) {
      nearestPlayerDistance = game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i])
      nearestPlayer = playerSquad.children[i]
    }
  }
  // console.log('nearestPlayer', nearestPlayer)
  return nearestPlayer
}

function patrol(currentlyMovingEnemy) {

}

function sentinel(currentlyMovingEnemy) {

}

function objectiveMove(currentlyMovingEnemy) {

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
