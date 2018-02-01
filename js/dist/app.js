(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/****************************************************
This is a turn-based strategy game that uses a hex
grid map. The map uses odd-q offset coodinates
****************************************************/

require("./game-state");
require("./math");
require("./combat");
require("./gui");
require("./movement");
require("./units");

//starts new canvas
const game = new Phaser.Game(640, 480, Phaser.CANVAS, "game-div", {
  init: function() {
    //initializes kinetic scrolling plugin
    this.game.kineticScrolling = this.game.plugins.add(
      Phaser.Plugin.KineticScrolling
    );
    this.game.kineticScrolling.configure({
      kineticMovement: true,
      timeConstantScroll: 250,
      horizontalScroll: true,
      verticalScroll: true,
      horizontalWheel: true,
      verticalWheel: false,
      deltaWheel: 40
    });
  },
  preload: onPreload,
  create: onCreate,
  update: onUpdate
});

let groupOffset = { x: 10, y: 10 };

//sets up hex width and height. height should be sqrt(3)/2 of width but need to tweak to get spacing right
const hexagonHeight = 55;
const hexagonWidth = 64;
//number of hexes x and y
const gridSizeX = 50;
const gridSizeY = 50;

//for mouse position tracking
const columns = [Math.ceil(gridSizeY / 2), Math.floor(gridSizeY / 2)];

let moveIndex;
let sectorWidth = hexagonWidth / 4 * 3;
let sectorHeight = hexagonHeight;
let gradient = hexagonWidth / 4 / (hexagonHeight / 2);
let hexagonGroup;
let highlightGroup;
let enemyHighlightGroup;
let enemySquad;
let playerSquad;
let craters;
let currentSprite;
let currentHex;
let turnCounter = 1;
let targetFound = false;
let enemyTargetFound = false;
let moveToCubePos;
let victory = false;
let explosions;
let explosionSound;
let playerTurn = true;
let gameOver = false;

function onUpdate() {}

function gameOverCheck() {
  if (enemySquad.children.length === 0) {
    gameOver = true;
    playerWin();
  } else if (playerSquad.children.length === 0) {
    gameOver = true;
    playerDefeat();
  }
}

function playerWin() {
  let playerWinText = game.add.text(300, 200, "You Win!");

  //  Centers the text
  playerWinText.anchor.set(0.5);
  // playerWinText.align = 'center';

  //  Our font + size
  playerWinText.font = "Arial";
  playerWinText.fontWeight = "bold";
  playerWinText.fontSize = 40;
  playerWinText.fill = "#ffffff";
  playerWinText.fixedToCamera = true;

  // playerWinText.cameraOffset.setTo(200, 500);
  // playerWinText.bringToTop()

  // let playerWinTextReflect = game.add.text(game.world.centerX, game.world.centerY + 50, "You Win!");

  // //  Centers the text
  // playerWinTextReflect.anchor.set(0.5);
  // playerWinTextReflect.align = 'center';
  // playerWinTextReflect.scale.y = -1;

  // //  Our font + size
  // playerWinTextReflect.font = 'Arial';
  // playerWinTextReflect.fontWeight = 'bold';
  // playerWinTextReflect.fontSize = 70;

  // //  Here we create a linear gradient on the Text context.
  // //  This uses the exact same method of creating a gradient as you do on a normal Canvas context.
  // let grd = playerWinTextReflect.context.createLinearGradient(0, 0, 0, 10);

  // //  Add in 2 color stops
  // grd.addColorStop(0, 'rgba(255,255,255,0)');
  // grd.addColorStop(1, 'rgba(255,255,255,0.08)');

  // //  And apply to the Text
  // playerWinTextReflect.fill = grd;
}

function playerDefeat() {
  let enemyWinText = game.add.text(300, 200, "You Have Been Defeated");

  //  Centers the text
  enemyWinText.anchor.set(0.5);
  enemyWinText.align = "center";

  //  Our font + size
  enemyWinText.font = "Arial";
  enemyWinText.fontWeight = "bold";
  enemyWinText.fontSize = 40;
  enemyWinText.fill = "#ffffff";
  enemyWinText.fixedToCamera = true;
  // game.lockRender = true
  // enemyWinText.bringToTop()

  // let enemyWinTextReflect = game.add.text(game.world.centerX, game.world.centerY + 50, "You Have Been Defeated");

  // //  Centers the text
  // enemyWinTextReflect.anchor.set(0.5);
  // enemyWinTextReflect.align = 'center';
  // enemyWinTextReflect.scale.y = -1;

  // //  Our font + size
  // enemyWinTextReflect.font = 'Arial';
  // enemyWinTextReflect.fontWeight = 'bold';
  // enemyWinTextReflect.fontSize = 70;

  // //  Here we create a linear gradient on the Text context.
  // //  This uses the exact same method of creating a gradient as you do on a normal Canvas context.
  // let grd = enemyWinTextReflect.context.createLinearGradient(0, 0, 0, enemyWinText.canvas.height);

  // //  Add in 2 color stops
  // grd.addColorStop(0, 'rgba(255,255,255,0)');
  // grd.addColorStop(1, 'rgba(255,255,255,0.08)');

  // //  And apply to the Text
  // enemyWinTextReflect.fill = grd;
}

function enemyMoveType() {
  let enemyMoveTime = 0;

  enemySquad.forEach(function(enemySquadMember) {
    let currentlyMovingEnemy = enemySquadMember;

    game.time.events.add(
      1000 + enemyMoveTime * 1000,
      chargeAtPlayer,
      this,
      currentlyMovingEnemy
    );
    enemyMoveTime++;
  });
}

function enemyRangeTo(shooter, target) {
  let targetHexPos = hexPositionFromSpriteCoordinates(target.x, target.y);
  let targetCubePos = offsetToCube(targetHexPos.x, targetHexPos.y);
  let shooterHexPos = hexPositionFromSpriteCoordinates(shooter.x, shooter.y);
  let shooterCubePos = offsetToCube(shooterHexPos.x, shooterHexPos.y);
  let distanceBetween = cubeDistance(shooterCubePos, targetCubePos);
  return distanceBetween;
}

function checkForTargetInWeaponsRange(currentlyMovingEnemy) {
  for (let i = 0, length1 = playerSquad.children.length; i < length1; i++) {
    if (!currentlyMovingEnemy.hasFired) {
      let targetDistance = enemyRangeTo(
        currentlyMovingEnemy,
        playerSquad.children[i]
      );
      if (targetDistance <= currentlyMovingEnemy.weaponRange) {
        console.log("checkForTargetInWeaponsRange running");
        let targetCandidate = playerSquad.children[i];
        enemyCombat(currentlyMovingEnemy, targetCandidate);
      } else {
        currentlyMovingEnemy.hasFired = true;
        checkEndEnemyTurn();
      }
    }
  }
}

$(".login-page form").submit(e => {
  e.preventDefault();
  var email = $('input[type="email"]').val();
  var password = $('input[type="password"]').val();
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      alert(errorMessage);
    })
    .then(() => {
      $("form")[0].reset();
    });
});

//sign-out button
$(".sign-out").click(() => {
  firebase.auth().signOut();
});

//register button
$(".register").click(() => {
  var email = $('input[type="email"]').val();
  var password = $('input[type="password"]').val();
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      alert(errorMessage);
    })
    .then(() => {
      $("form")[0].reset();
    });
});

$(".main-page form").submit(e => {
  e.preventDefault();
  var task = $('.main-page input[type="text"]').val();
  var uid = firebase.auth().currentUser.uid;
  $.post(
    `https://c17-firebase-auth-jufe.firebaseio.com/${uid}.json`,
    JSON.stringify({ task: task })
  ).then(console.log);
});

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

},{"./combat":4,"./game-state":8,"./gui":13,"./math":18,"./movement":21,"./units":25}],2:[function(require,module,exports){
'use strict';

module.exports = function() {
  /**************************************
                  Player
  **************************************/
  
  function targetEnable(targetCandidate) {
    game.world.bringToTop(enemySquad)
    targetCandidate.events.onInputDown.add(combat, targetCandidate)
  }
  
  
  
  /**************************************
                  Enemy
  **************************************/
  
  function destroyCheck(target) {
    if (target.health <= 0) {
      explodeMech(target)
      target.kill()
      target.destroy()
      if (target.key === 'player') {
        playerSquad.remove(target)
      } else if (target.key === 'enemy') {
        enemySquad.remove(target)
      }
      gameOverCheck()
    }
  }
  
  function getWeaponRange() {
    let startCubePosition = moveToCubePos
    let nRange = currentSprite.weaponRange
    let cubeFireRange = rangeCalc(startCubePosition, nRange)
    const nextAction = 'fire'
    highlightRange(cubeFireRange, nextAction)
  }
  
  
  function targetDisable(targetCandidate) {
    targetCandidate.events.onInputDown.remove(combat, targetCandidate)
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
  
  function critDamage(shooter, target) {
    let damage = shooter.damage + shooter.critDamage
    console.log('damage', damage)
    console.log('target.health before hit', target.health)
    target.health = target.health - damage
    console.log('target.health after hit', target.health)
  }
  
  function damage(shooter, target) {
    let damage = shooter.damage
    console.log('damage', damage)
    console.log('target.health before hit', target.health)
    target.health = target.health - damage
    console.log('target.health after hit', target.health)
  }
  
  function miss(shooter, target) {
    console.log('miss')
  }
  
  function combat(targetCandidate) {
    currentSprite.rotation = game.physics.arcade.angleBetween(currentSprite, targetCandidate)
    currentSprite.hasFired = true
    killHighlight()
    targetDisable(targetCandidate)
    let shooter = currentSprite
    let target = targetCandidate
    if (hitCalc().crit) {
      critDamage(shooter, target)
    } else if (hitCalc().hit) {
      damage(shooter, target)
    } else {
      miss(shooter, target)
    }
    destroyCheck(target)
    enablePlayerMoves()
    checkEndPlayerTurn()
  }
  
  function enemyCombat(currentlyMovingEnemy, targetCandidate) {
    console.log('enemyCombat')
    currentlyMovingEnemy.rotation = game.physics.arcade.angleBetween(currentlyMovingEnemy, targetCandidate)
    let shooter = currentlyMovingEnemy
    let target = targetCandidate
    if (hitCalc().crit) {
      critDamage(shooter, target)
    } else if (hitCalc().hit) {
      damage(shooter, target)
    } else {
      miss(shooter, target)
    }
    destroyCheck(target)
    currentlyMovingEnemy.hasFired = true
    currentlyMovingEnemy = {}
    checkEndEnemyTurn()
  }
}

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function() {
  function chargeAtPlayer(currentlyMovingEnemy) {
    let xPos = currentlyMovingEnemy.x
    let yPos = currentlyMovingEnemy.y
    let positionCurrentEnemy = hexPositionFromSpriteCoordinates(xPos, yPos)
    let cubePositionCurrentEnemy = offsetToCube(positionCurrentEnemy.x, positionCurrentEnemy.y)
    //if nearest player is in weapon range => attack
    if (currentlyMovingEnemy.hasMoved === false) {
      let nearestPlayer = findNearestPlayer(currentlyMovingEnemy)
      //get position of nearest player
      let nearestPlayerHexPos = hexPositionFromSpriteCoordinates(nearestPlayer.x, nearestPlayer.y)
      let cubeNearestPlayerPos = offsetToCube(nearestPlayerHexPos.x, nearestPlayerHexPos.y)
      //get distance to nearest player
      let distanceBetweenEnemyAndNearestPlayer = cubeDistance(cubePositionCurrentEnemy, cubeNearestPlayerPos)
      if (distanceBetweenEnemyAndNearestPlayer <= currentlyMovingEnemy.weaponRange) {
        // fire on nearestPlayer
        currentlyMovingEnemy.hasMoved = true
        // enemyAttack()
        checkForTargetInWeaponsRange(currentlyMovingEnemy)
      } else { //else move to hex closest to nearest player
        //get enemy move range
        let enemyMoveCubeRangeArray = getEnemyMoveRange(currentlyMovingEnemy, cubePositionCurrentEnemy)
        // console.log('enemyMoveCubeRangeArray', enemyMoveCubeRangeArray)
        //test each range hex to see if it's closest to nearest player
        let cubeNearestHex = findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray)
        // console.log('cubeNearestHex', cubeNearestHex)
        let offsetNearestHex = cubeToOffset(cubeNearestHex.x, cubeNearestHex.z)
        moveEnemySprite(currentlyMovingEnemy, offsetNearestHex, nearestPlayer)
      }
    }
  }
  // function patrol() {
  
  // }
  
  // function sentinel() {
  
  // }
  
  // function objectiveMove() {
  
  // }
}


},{}],4:[function(require,module,exports){
'use strict';

const combat = require('./combat.js');
const enemyTactics = require('./enemy-tactics.js');
},{"./combat.js":2,"./enemy-tactics.js":3}],5:[function(require,module,exports){
'use strict';

module.exports = function() {
  function addEnemySquad() {
    let startingEnemySquadArray = [
      {positionX: 6, positionY: 0},
      {positionX: 4, positionY: 0},
      {positionX: 8, positionY: 0}
      ]
  
    for(let i = 0, length1 = startingEnemySquadArray.length; i < length1; i++){
      let startX = hexToPixelX(startingEnemySquadArray[i].positionX)
      let startY = hexToPixelY(startingEnemySquadArray[i].positionX,startingEnemySquadArray[i].positionY)
      new EnemyScout(game, startX, startY)
      enemySquad.children[i].inputEnabled = true
    }
  }
}

},{}],6:[function(require,module,exports){
'use strict';

module.exports = function() {
  function addPlayerSquad() {
    let startingPlayerSquadArray = [
      {positionX: 6, positionY: 6},
      {positionX: 4, positionY: 6},
      {positionX: 8, positionY: 6}
      ]
  
    for(let i = 0, length1 = startingPlayerSquadArray.length; i < length1; i++){
      let startX = hexToPixelX(startingPlayerSquadArray[i].positionX)
      let startY = hexToPixelY(startingPlayerSquadArray[i].positionX,startingPlayerSquadArray[i].positionY)
      new Scout(game, startX, startY)
      playerSquad.children[i].inputEnabled = true
    }
  }
}

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function () {
  function onCreate() {

    this.game.kineticScrolling.start();
    // adds hexagonGroup
    hexagonGroup = game.add.group()
    hexagonGroup.z = 0
    playerSquad = game.add.group()
    playerSquad.z = 3
    enemySquad = game.add.group()
    enemySquad.z = 3
    craters = game.add.group()
    craters.z = 1
  
    //background color for whole canvas element
    game.stage.backgroundColor = "#515863"
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
          let hexagon = game.add.sprite(hexagonX,hexagonY,"grassland");
          hexagonGroup.add(hexagon);
        }
      }
    }
  
    let music = game.add.audio('alertMusic');
    music.play();
  
    // positions hexagonGroup
    hexagonGroup.y = groupOffset.y
    hexagonGroup.x = groupOffset.x
    //gives same position to playerSquad and enemySquad groups
    playerSquad.x = groupOffset.x
    playerSquad.y = groupOffset.y
    enemySquad.x = groupOffset.x
    enemySquad.y = groupOffset.y
    // craters.x = groupOffset.x
    // craters.y = groupOffset.y
  
    highlightGroup = game.add.group()
    highlightGroup.x = groupOffset.x
    highlightGroup.y = groupOffset.y
    highlightGroup.z = 1
  
    let worldWidth = ((hexagonWidth * 1.5) * (gridSizeX/2)) + 50
    let worldHeight = (hexagonHeight * gridSizeY)/2 + 50
    this.game.world.setBounds(0, 0, worldWidth, worldHeight);
  
    addPlayerSquad()
    addEnemySquad()
  
    explosionSound = game.add.audio('mechExplosionSound');
    game.sound.setDecodedCallback(explosionSound, start, this);
  
    explosions = game.add.group();
    explosions.x = groupOffset.x
    explosions.y = groupOffset.y
    let numExplosions = enemySquad.children.length + playerSquad.children.length
    explosions.createMultiple(numExplosions, 'mechExplosion');
    explosions.forEach(setupExplosion, this);
  
    let playerTurnText = game.add.text(300, 200, "Player Turn Start");
    playerTurnText.anchor.set(0.5);
    playerTurnText.align = 'center';
    playerTurnText.font = 'Arial';
    playerTurnText.fontSize = 40;
    playerTurnText.fill = '#ffffff';
    playerTurnText.fixedToCamera = true
    game.time.events.add(Phaser.Timer.SECOND * 1, startPlayerTurn, this, playerTurnText);
  
    drawHUD()
  
    // game.input.onDown.add(gofull, this);
    this.camera.flash('#000000', 2000);
  }
}

},{}],8:[function(require,module,exports){
'use strict';

const addEnemies = require('./addEnemies');
const addPlayerMechs = require('./addPlayerMechs');
const create = require('./create.js');
const onPreload = require('./preload');
const turnManagement = require('./turn-management.js');
},{"./addEnemies":5,"./addPlayerMechs":6,"./create.js":7,"./preload":9,"./turn-management.js":10}],9:[function(require,module,exports){
'use strict';

module.exports = function() {
  function onPreload() {
    //preloads images and audio 
    game.load.image("grassland", "assets/images/map_tiles/grassland.png");
    game.load.image("highlight", "assets/images/map_tiles/highlight.png");
    game.load.image("crater", "assets/images/map_tiles/crater.png");
    // game.load.image("player", "assets/images/mechs/player_ph.png")
    game.load.spritesheet('player', 'assets/images/mechs/playerMech.png', 131, 152, 12);
    game.load.spritesheet('enemy', 'assets/images/mechs/enemyMech.png', 131, 152, 12);
    // game.load.image("enemy", "assets/images/mechs/enemy_ph.png")
    game.load.spritesheet('mechExplosion', 'assets/images/explosions/mech-explosion.png', 100, 100, 81)
    game.load.audio('mechExplosionSound', 'assets/sounds/big-explosion.mp3');
    game.load.audio('alertMusic', ['assets/sounds/Alert.mp3']);
  }
}

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function() {
  /**************************************
                  Player
  **************************************/
  
  function startPlayerTurn(playerTurnText) {
    playerTurnText.destroy()
    game.world.bringToTop(playerSquad)
    enablePlayerMoves()
  }
  
  function playerTurnSetup() {
    for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
      playerSquad.children[i].hasMoved = false
      playerSquad.children[i].hasFired = false
    }
  }
  
  function checkEndPlayerTurn() {
    let playerDone = checkPlayerDone()
    console.log('checking player turn end', playerDone)
    if (playerDone) {
      // gameOverCheck()
      if (!gameOver) {
        playerTurn = false
        enemyTurnSetup()
        let enemyTurnText = game.add.text(300, 200, "Enemy Turn Start");
        enemyTurnText.anchor.set(0.5);
        enemyTurnText.align = 'center';
        enemyTurnText.font = 'Arial';
        enemyTurnText.fontWeight = 'bold';
        enemyTurnText.fontSize = 40;
        enemyTurnText.fill = '#ffffff';
        enemyTurnText.fixedToCamera = true
        game.time.events.add(Phaser.Timer.SECOND * 1, startEnemyTurn, this, enemyTurnText);
      }
    }
  }
  
  function checkPlayerDone() {
    let allPlayersDone = true
    for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
      if(playerSquad.children[i].hasFired === false) {
        allPlayersDone = false
        return allPlayersDone
      }
    }
    return allPlayersDone
  }
  
  
  /**************************************
                  Enemy
  **************************************/
  
  function checkEndEnemyTurn() {
    let enemyDone = checkEnemyDone()
    console.log('enemyDone', enemyDone)
    if (enemyDone) {
      // gameOverCheck()
      if (!gameOver) {
        playerTurn = true
        playerTurnSetup()
        let playerTurnText = game.add.text(300, 200, "Player Turn Start");
        playerTurnText.anchor.set(0.5);
        playerTurnText.align = 'center';
        playerTurnText.font = 'Arial';
        playerTurnText.fontWeight = 'bold';
        playerTurnText.fontSize = 40;
        playerTurnText.fill = '#ffffff';
        playerTurnText.fixedToCamera = true
        game.time.events.add(Phaser.Timer.SECOND * 1, startPlayerTurn, this, playerTurnText);
      }
    }
  }
  
  function checkEnemyDone() {
    let allEnemiesDone = true
    for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
      if(enemySquad.children[i].hasFired === false) {
        allEnemiesDone = false
        return allEnemiesDone
      }
    }
    return allEnemiesDone
  }
  
  function enemyTurnSetup() {
    for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
      enemySquad.children[i].hasMoved = false
      enemySquad.children[i].hasFired = false
    }
  }
  
  
  function startEnemyTurn(enemyTurnText) {
    if (!victory) {
      enemyTurnText.destroy()
      game.world.bringToTop(enemySquad)
      enemyMoveType()
    }
  }
}

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function() {
  function drawHUD() {
    // let infoHUD = game.add.graphics(100, 100);
  
    // // set a fill and line style again
    // infoHUD.beginFill(0x2176ff, 1);
  
    // // draw a rectangle
    // infoHUD.drawRect(380, -60, 150, 200);
    // infoHUD.endFill();
  
    // // set a fill and line style again
    // infoHUD.beginFill(0xd1250e, 1);
  
    // // draw a rectangle
    // infoHUD.drawRect(380, 150, 150, 200);
    // infoHUD.endFill();
  
    // infoHUD.alpha = .6
    // infoHUD.fixedToCamera = true
    // window.graphics = infoHUD;
  }
}


},{}],12:[function(require,module,exports){
'use strict';

module.exports = function() {
  /**************************************
                  Player
  **************************************/
  function highlightRange(cubeRange, nextAction) {
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
      highlightGroup.children[i].body.setSize(32, 32, 0, 0)
      if (nextAction === 'move') {
        highlightGroup.children[i].events.onInputDown.add(checkHex, highlightGroup.children[i])
      } else if (nextAction === 'fire') {
        targetCheck(highlightGroup.children[i])
      }
    }
  }
  
  function killHighlight() {
    for(let i = 0, length1 = highlightGroup.children.length; i < length1; i++){
      highlightGroup.children[i].visible = false
    }
    highlightGroup.children = []
  }
  
  function spriteTint(highlightSprite) {
    targetFound = true
    highlightSprite.tint = 0xff2100
    highlightSprite.alpha = .3
    for(let i = 0, length1 = enemySquad.children.length; i < length1; i++){
      let targetCandidate = enemySquad.children[i]
      game.physics.arcade.overlap(targetCandidate, highlightSprite, this.targetEnable, null, this)
    }
  }
  
  function targetCheck(highlightSprite) {
    game.physics.arcade.overlap(highlightSprite, enemySquad, this.spriteTint, null, this)
    game.time.events.add(Phaser.Timer.SECOND * .5, resolveTargetNotFound, this)
  }
  
  Highlight = function(game,x,y) {
    Phaser.Sprite.call(this, game, x, y, 'highlight');
    this.anchor.setTo(0.5, 0.5);
    this.visible = true
    this.alpha = .3
    highlightGroup.add(this);
  };
  Highlight.prototype = Object.create(Phaser.Sprite.prototype);
  Highlight.prototype.constructor = Highlight;
  
  function resolveTargetNotFound() {
    if (targetFound === false) {
      currentSprite.hasFired = true
      killHighlight()
      enablePlayerMoves()
      checkEndPlayerTurn()
    }
  }
  /**************************************
                  Enemy
  **************************************/
  // function enemyHighlightRange(cubeRange) {
  //   targetFound = false
  //   for(var i = 0, length1 = cubeRange.length; i < length1; i++){
  //     let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
  //     let startX = hexToPixelX(currentHex.col)
  //     let startY = hexToPixelY(currentHex.col,currentHex.row)
  //     new EnemyHighlight(game, startX, startY)
  //     game.physics.enable(enemyHighlightGroup.children[i], Phaser.Physics.ARCADE)
  //     enemyHighlightGroup.children[i].body.setSize(16, 16, 0, 0)
  //     enemyTargetCheck(enemyHighlightGroup.children[i])
  //   }
  // }
  
  // function killEnemyHighlight() {
  //   for(var i = 0, length1 = enemyHighlightGroup.children.length; i < length1; i++){
  //     enemyHighlightGroup.children[i].visible = false
  //   }
  //   enemyHighlightGroup.children = []
  // }
  
  
  
  
  // function enemyResolveTargetNotFound() {
  //   if (enemyTargetFound === false) {
  //     console.log('is this working')
  //     currentlyMovingEnemy.hasFired = true
  //     killEnemyHighlight()
  //   }
  // }
  
  // function enemyTargetCheck(highlightSprite) {
  //   game.physics.arcade.overlap(highlightSprite, playerSquad, this.enemySpriteTint, null, this)
  //   game.time.events.add(Phaser.Timer.SECOND * .2, enemyResolveTargetNotFound, this)
  // }
  
  // function enemySpriteTint(highlightSprite) {
  //   enemyTargetFound = true
  //   highlightSprite.tint = 0xff2100
  //   highlightSprite.alpha = .3
  //   for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
  //     let targetCandidate = playerSquad.children[i]
  //     if(game.physics.arcade.overlap(targetCandidate, highlightSprite/*, this.enemyCombat, null, this*/)) {
  //       enemyCombat(targetCandidate)
  //     }
  //   }
  // }
  
  // EnemyHighlight = function(game,x,y) {
  //   Phaser.Sprite.call(this, game, x, y, 'highlight');
  //   this.anchor.setTo(0.5, 0.5);
  //   this.visible = true
  //   this.alpha = .3
  //   enemyHighlightGroup.add(this);
  // };
  // EnemyHighlight.prototype = Object.create(Phaser.Sprite.prototype);
  // EnemyHighlight.prototype.constructor = EnemyHighlight;
}

},{}],13:[function(require,module,exports){
'use strict';

const drawHUD = require('./drawHUD');
const highlight = require('./highlight');
const mechExplosion = require('./mech-explosion');
},{"./drawHUD":11,"./highlight":12,"./mech-explosion":14}],14:[function(require,module,exports){
'use strict';

module.exports = function() {
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
    explosion.reset(target.body.x + 10, target.body.y + 10);
    explosion.play('kaboom', 20, false, true);
    explosionSound.play()
    game.camera.shake(0.03, 500);
    let crater = game.add.sprite(target.body.x - 15, target.body.y - 10, "crater")
    craters.add(crater)
  }
}


},{}],15:[function(require,module,exports){
'use strict';

module.exports = function() {
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
}

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function() {
  function cubeDistance(a, b) {
    // console.log('a', a)
    // console.log('b', b)
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z))
  }
  
  function offset_distance(a, b){
    let ac = offsetToCube(a)
    let bc = offsetToCube(b)
    return cubeDistance(ac, bc)
  }
}


},{}],17:[function(require,module,exports){
'use strict';

module.exports = function() {
  // functions to convert odd-q hex coodinates to pixel coordinates
  
  function hexToPixelX(posX) {
    let pixelX = hexagonWidth/4*3*posX+hexagonWidth/2;
    return pixelX
  }
  
  function hexToPixelY(posX, posY) {
    let pixelY = hexagonHeight*posY;
    if(posX%2==0){
      pixelY += hexagonHeight/2;
    }
    else{
      pixelY += hexagonHeight;
    }
    return pixelY
  }
}


},{}],18:[function(require,module,exports){
'use strict';

const cubeOffsetConversions = require('./cubeOffsetConversions');
const distance = require('./distance');
const hexToPix = require('./hexToPix');
const position = require('./position');
const rangeCalc = require('./rangeCalc');
},{"./cubeOffsetConversions":15,"./distance":16,"./hexToPix":17,"./position":19,"./rangeCalc":20}],19:[function(require,module,exports){
'use strict';

module.exports = function() {
  //finds x,y odd-q coordinates based on mouse position returns object
  function hexPosition() {
    let hexPositionObj = {}
    hexPositionObj.x = Math.floor((game.input.worldX-hexagonGroup.x)/sectorWidth);
    hexPositionObj.y = Math.floor((game.input.worldY-hexagonGroup.y)/sectorHeight);
    let deltaX = (game.input.worldX-hexagonGroup.x)%sectorWidth;
    let deltaY = (game.input.worldY-hexagonGroup.y)%sectorHeight;
    if(hexPositionObj.x%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        hexPositionObj.x--;
        hexPositionObj.y--;
      }
      if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
        hexPositionObj.x--;
      }
    } else {
      if(deltaY>=hexagonHeight/2) {
        if(deltaX<(hexagonWidth/2-deltaY*gradient)){
          hexPositionObj.x--;
        }
      } else {
        if(deltaX<deltaY*gradient){
          hexPositionObj.x--;
        } else {
          hexPositionObj.y--;
        }
      }
    }
    // console.log('hexPositionObj', hexPositionObj)
    return hexPositionObj
  }
  
  function hexPositionFromSpriteCoordinates(spriteX, spriteY) {
    let hexPositionObj = {}
    hexPositionObj.x = Math.floor((spriteX-hexagonGroup.x)/sectorWidth);
    hexPositionObj.y = Math.floor((spriteY-hexagonGroup.y)/sectorHeight);
    let deltaX = (spriteX-hexagonGroup.x)%sectorWidth;
    let deltaY = (spriteY-hexagonGroup.y)%sectorHeight;
    if(hexPositionObj.x%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        hexPositionObj.x--;
        hexPositionObj.y--;
      }
      if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
        hexPositionObj.x--;
      }
    } else {
      if(deltaY>=hexagonHeight/2) {
        if(deltaX<(hexagonWidth/2-deltaY*gradient)){
          hexPositionObj.x--;
        }
      } else {
        if(deltaX<deltaY*gradient){
          hexPositionObj.x--;
        } else {
          hexPositionObj.y--;
        }
      }
    }
    // console.log('hexPositionObj', hexPositionObj)
    return hexPositionObj
  }
}

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function() {
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
}


},{}],21:[function(require,module,exports){
'use strict';

const movement = require('./movement');
const togglePlayerMoves = require('./toggle-player-moves');
},{"./movement":22,"./toggle-player-moves":23}],22:[function(require,module,exports){
'use strict';

module.exports = function () {
  /**************************************
                  Player
  **************************************/
  //moves sprite to specified hex
  function moveSprite (posX,posY) {
    currentSprite.hasMoved = true
    let tween
    let endX = hexToPixelX(posX)
    let endY = hexToPixelY(posX,posY)
    moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
    //let facingAngle = Math.round((game.physics.arcade.angleToPointer(currentSprite)*180/Math.PI)/60)*60
    //console.log('pointer angle', game.physics.arcade.angleToPointer(currentSprite))
    currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)//facingAngle
    currentSprite.animations.play('walk', 30, true)
    //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
    var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
    tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(clearMoveListeners, this)
  }
  
  
  
  /**************************************
                  Enemy
  **************************************/
  
  function clearMoveListeners() {
    game.input.onDown.remove(checkHex, currentHex);
    currentSprite.animations.stop('walk')
    currentSprite.events.onInputDown.remove(getMoveRange, currentSprite)
    killHighlight()
    getWeaponRange()
  }
  
  
  //checks to see what hex the mouse pointer is over and sends info to moveSprite()
  function checkHex(){
    currentHex = this
    disablePlayerMoves()
    moveSprite (hexPosition().x, hexPosition().y, currentSprite)
  }
  
  function getMoveRange(posX,posY) {
    currentSprite = this
    let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
    let nRange = currentSprite.movePoints
    let cubeMoveRange = rangeCalc(startCubePosition, nRange)
    const nextAction = 'move'
    highlightRange(cubeMoveRange, nextAction)
  }
  
  //moves sprite to specified hex
  function moveEnemySprite(currentlyMovingEnemy, offsetNearestHex, nearestPlayer) {
    currentlyMovingEnemy.hasMoved = true
    let hexEndX = offsetNearestHex.col
    let hexEndY = offsetNearestHex.row
    let endX = hexToPixelX(hexEndX)
    let endY = hexToPixelY(hexEndX, hexEndY)
    // let tween
    var duration = 1000
    let tween = game.add.tween(currentlyMovingEnemy).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(checkForTargetInWeaponsRange, this)
  }
  
  function getEnemyMoveRange(currentlyMovingEnemy, cubePositionCurrentEnemy) {
    let startCubePosition = cubePositionCurrentEnemy
    let nRange = currentlyMovingEnemy.movePoints
    let cubeMoveRange = rangeCalc(startCubePosition, nRange)
    return cubeMoveRange
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
  
  function findNearestPlayer(currentlyMovingEnemy) {
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
}

},{}],23:[function(require,module,exports){
'use strict';

module.exports = function() {
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
}


},{}],24:[function(require,module,exports){
'use strict';

module.exports = function () {
  /***************************************
  MECHS
  ***************************************/
  
  EnemyScout = function(game,x,y) {
    Phaser.Sprite.call(this, game, x, y, "enemy", 0);
  
    this.frame = 0
    this.name = "Scout";
    this.scale.setTo(.25, .25);
    this.movePoints = 4
    this.weapon = "SMG"
    this.weaponRange = 3
    this.health = Math.floor((Math.random() * 50) + 200)
    this.damage = Math.floor((Math.random() * 50) + 200)
    this.critDamage = 20
    this.hasMoved = false
    this.hasFired = false
    this.movePattern = "alert"
    this.animations.add('walk', [0,1,2,3,4,5,6,7])
    this.animations.add('fire', [8,9,10,11])
  
    game.physics.arcade.enable(this)
    this.body.setSize(128, 128, 0, 0)
    this.visible = true
    this.anchor.setTo(0.5, .5);
    this.angle = 90
    enemySquad.add(this);
  };
  EnemyScout.prototype = Object.create(Phaser.Sprite.prototype);
  EnemyScout.prototype.constructor = EnemyScout;
}


},{}],25:[function(require,module,exports){
'use strict';

const enemyMechs = require('./enemyMechs');
const playerMechs = require('./playerMechs');
},{"./enemyMechs":24,"./playerMechs":26}],26:[function(require,module,exports){
'use strict';

module.exports = function() {
  Scout = function(game,x,y) {
    Phaser.Sprite.call(this, game, x, y, 'player', 0);
  
    this.name = "Scout";
    this.frame = 0
    this.scale.setTo(.25, .25);
    this.movePoints = 4
    this.weapon = "SMG"
    this.weaponRange = 3
    this.health = Math.floor((Math.random() * 50) + 200)
    this.damage = Math.floor((Math.random() * 50) + 200)
    this.critDamage = 20
    this.hasMoved = false
    this.hasFired = false
    this.animations.add('walk', [0,1,2,3,4,5,6,7])
    this.animations.add('fire', [8,9,10,11])
  
    game.physics.arcade.enable(this)
    this.body.setSize(16, 16, 0, 0)
    this.anchor.setTo(0.5, 0.5);
    this.angle = -90
    this.visible = true
    playerSquad.add(this);
  };
  Scout.prototype = Object.create(Phaser.Sprite.prototype);
  Scout.prototype.constructor = Scout;
}


},{}]},{},[1]);
