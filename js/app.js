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

//preloads images
function onPreload() {
  game.load.image("hexagon", "images/map_tiles/hexagon.png");
  game.load.image("highlight", "images/map_tiles/highlight.png");
  game.load.image("player", "images/mechs/player_ph.png")
  game.load.image("enemy", "images/mechs/enemy_ph.png")
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
  hexagonGroup.y = 20
  hexagonGroup.x = 20
  //gives same position to playerSquad and enemySquad groups
  playerSquad.x = hexagonGroup.x
  playerSquad.y = hexagonGroup.y
  enemySquad.x = hexagonGroup.x
  enemySquad.y = hexagonGroup.y


  let worldWidth = hexagonWidth * gridSizeX - 100
  let worldHeight = (hexagonHeight * gridSizeY)/1.75
  this.game.world.setBounds(0, 0, worldWidth, worldHeight);


  addPlayerSquad()
  addEnemySquad()

  startPlayerTurn()

  drawHUD()

  // game.input.onDown.add(gofull, this);
  this.camera.flash('#000000', 2000);
}

function drawHUD() {
  let infoHUD = game.add.graphics(100, 100);

  // set a fill and line style again
  infoHUD.beginFill(0x2176ff, 1);

  // draw a rectangle
  infoHUD.drawRect(380, -60, 150, 200);
  infoHUD.endFill();

  // set a fill and line style again
  infoHUD.beginFill(0xd1250e, 1);

  // draw a rectangle
  infoHUD.drawRect(380, 150, 150, 200);
  infoHUD.endFill();

  infoHUD.alpha = .6
  infoHUD.fixedToCamera = true
  window.graphics = infoHUD;
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
