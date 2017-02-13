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


  let worldWidth = hexagonWidth * gridSizeX
  let worldHeight = (hexagonHeight * gridSizeY)/1.75
  this.game.world.setBounds(0, 0, worldWidth, worldHeight);


  addPlayerSquad()
  addEnemySquad()

  startPlayerTurn()

  // game.input.onDown.add(gofull, this);
  this.camera.flash('#000000', 2000);
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

function getWeaponRange() {
  let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
  let nRange = currentSprite.weaponRange
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'fire'
  highlightRange(cubeMoveRange, nextAction)
}

function targetCheck(highlightSprite) {
  game.physics.arcade.overlap(highlightSprite, enemySquad, this.spriteTint, null, this)
}

function spriteTint(highlightSprite) {
  highlightSprite.tint = 0xff2100
  highlightSprite.alpha = .3
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    let targetCandidate = enemySquad.children[i]
    game.physics.arcade.overlap(targetCandidate, highlightSprite, this.targetEnable, null, this)
  }
}

function targetEnable(targetCandidate) {
  game.world.bringToTop(enemySquad)
  targetCandidate.events.onInputDown.add(combat, targetCandidate)
  console.log('targetCandidate', targetCandidate)
}

function hitCalc() {
  let hitResolution = {hit: false, crit: false}
  let hitRoll = Math.floor(Math.random() * 100) + 1
  console.log('hitRoll', hitRoll)
  let toHitNumber = 20
  if (hitRoll >= 90) {
    hitResolution.hit = true
    hitResolution.crit = true
    return hitResolution
  } else if (hitRoll >= toHitNumber) {
    hitResolution.hit = true
    return hitResolution
  } else {
    return hitResolution
  }
}

function critDamage(target) {
  let damage = currentSprite.damage + currentSprite.critDamage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function damage(target) {
  let damage = currentSprite.damage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function miss(target) {
  console.log('miss')
}

function combat(targetCandidate) {
  let target = targetCandidate
  if (hitCalc().crit) {
    critDamage(target)
  } else if (hitCalc().hit) {
    damage(target)
  } else {
    miss(target)
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
