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
  update: onUpdate,
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
// let tween;
let currentSprite
let currentHex
let turnCounter = 1
let targetFound = false
let moveToCubePos
let victory = false
let explosions
let explosionSound
let playerTurn = true
let currentlyMovingEnemy

function onUpdate() {
  if (playerTurn) {
    checkEndPlayerTurn()
  } else {
    checkEndEnemyTurn()
  }
}

function enemyMoveType() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++) {
    // console.log('length1', length1)
    currentlyMovingEnemy = enemySquad.children[i]
    if (currentlyMovingEnemy.hasMoved === false) {
      if (currentlyMovingEnemy.movePattern === "patrol") {
        patrol()
      } else if (currentlyMovingEnemy.movePattern === "sentinel") {
        sentinel()
      } else if (currentlyMovingEnemy.movePattern === "alert") {
        chargeAtPlayer()
      } else if (currentlyMovingEnemy.movePattern === "objective") {
        objectiveMove()
      }
    }
  }
}



//moves sprite to specified hex
function moveEnemySprite(offsetNearestHex, nearestPlayer) {
  // console.log('offsetNearestHex', offsetNearestHex)
  currentlyMovingEnemy.hasMoved = true
  let hexEndX = offsetNearestHex.col + 1
  let hexEndY = offsetNearestHex.row + 2
  let endX = hexToPixelX(hexEndX)
  let endY = hexToPixelY(hexEndX, hexEndY)
  let tween
  // moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
  // currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)
  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentlyMovingEnemy).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(enemyAttack, this)
}

function enemyAttack() {
  let positionCurrentEnemy = hexPositionFromSpriteCoordinates(currentlyMovingEnemy.x, currentlyMovingEnemy.y)
  let cubePositionCurrentEnemy = offsetToCube(positionCurrentEnemy.x, positionCurrentEnemy.y)
  let cubeEnemyWeaponRange = getEnemyWeaponRange(cubePositionCurrentEnemy)
  const nextAction = "efire"
  enemyHighlightRange(cubeEnemyWeaponRange, nextAction)
}

function getEnemyWeaponRange(cubePositionCurrentEnemy) {
  let startCubePosition = cubePositionCurrentEnemy
  let nRange = currentlyMovingEnemy.movePoints
  let cubeWeaponRange = rangeCalc(startCubePosition, nRange)
  return cubeWeaponRange
}

function findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray) {
  let nearestHexDistance = 10000
  let nearestCubeHex
  for(var i = 0, length1 = enemyMoveCubeRangeArray.length; i < length1; i++){
    let distanceBetweenNearPlayerPosAndHex = cubeDistance(cubeNearestPlayerPos, enemyMoveCubeRangeArray[i])
    // console.log('distanceBetweenNearPlayerPosAndHex', distanceBetweenNearPlayerPosAndHex)
    if (nearestHexDistance > distanceBetweenNearPlayerPosAndHex) {
      nearestHexDistance = distanceBetweenNearPlayerPosAndHex
      nearestCubeHex = enemyMoveCubeRangeArray[i]
      // console.log('nearestHexDistance', nearestHexDistance)
    }
  }
  return nearestCubeHex
}


function getEnemyMoveRange(cubePositionCurrentEnemy) {
  let startCubePosition = cubePositionCurrentEnemy
  let nRange = currentlyMovingEnemy.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  return cubeMoveRange
}

function findNearestPlayer() {
  let nearestPlayerDistance = 10000
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

function patrol() {

}

function sentinel() {

}

function objectiveMove() {

}



// function lerp(a, b, displacement) {
//   return a + (b - a) * displacement
// }

// function cubeLerp(a, b, displacement){
//   let cube = {}

//   return Cube(lerp(a.x, b.x, displacement),
//                 lerp(a.y, b.y, displacement),
//                 lerp(a.z, b.z, displacement))
// }

// function cubeLinedraw(a, b):
//     var N = cube_distance(a, b)
//     var results = []
//     for each 0 ≤ i ≤ N:
//         results.append(cubeRound(cubeLerp(a, b, 1.0/N * i)))
//     return results


// function cube_round(h) {
//     let cube = {}
//     cube.rx = Math.round(h.x)
//     cube.ry = Math.round(h.y)
//     cube.rz = Math.round(h.z)

//     let xDiff = Math.abs(rx - h.x)
//     let yDiff = Math.abs(ry - h.y)
//     let zDiff = Math.abs(rz - h.z)

//     if (xDiff > yDiff && xDiff > zDiff) {
//         rx = -ry-rz
//     } else if (y_diff > z_diff) {
//         ry = -rx-rz
//     } else {
//         rz = -rx-ry
//     }
//     return cube
// }
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
