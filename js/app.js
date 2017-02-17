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
  } else if (!playerTurn) {
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
