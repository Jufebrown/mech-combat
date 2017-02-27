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

firebase.auth().onAuthStateChanged(() => {
  if (firebase.auth().currentUser !== null) {
  var email = firebase.auth().currentUser.email
  $('.main-page h1').text(`Welcome ${email}`)
  $('.login-page').addClass('hidden')
  $('.main-page').removeClass('hidden')
//starts new canvas
  game = new Phaser.Game(640, 480, Phaser.CANVAS, "game-div", {
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
  } else {
    $('.login-page').removeClass('hidden')
    $('.main-page').addClass('hidden')
  }
})

let game
let groupOffset = {x: 10, y: 10}

//sets up hex width and height. height should be sqrt(3)/2 of width but need to tweek to get spacing right
const hexagonHeight = 55;
const hexagonWidth = 64;
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
let enemyHighlightGroup
let playerSquad
let enemySquad
let currentSprite
let currentHex
let turnCounter = 1
let targetFound = false
let enemyTargetFound = false
let moveToCubePos
let victory = false
let explosions
let explosionSound
let playerTurn = true
let gameOver = false


function onUpdate() {

}

function gameOverCheck() {
  if (enemySquad.children.length === 0) {
    gameOver = true
    playerWin()
  } else if (playerSquad.children.length === 0) {
    gameOver = true
    playerDefeat()
  }
}



function playerWin() {
  let playerWinText = game.add.text(300, 200, "You Win!");

  //  Centers the text
  playerWinText.anchor.set(0.5);
  // playerWinText.align = 'center';

  //  Our font + size
  playerWinText.font = 'Arial';
  playerWinText.fontWeight = 'bold';
  playerWinText.fontSize = 40;
  playerWinText.fill = '#ffffff';
  playerWinText.fixedToCamera = true

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
  enemyWinText.align = 'center';

  //  Our font + size
  enemyWinText.font = 'Arial';
  enemyWinText.fontWeight = 'bold';
  enemyWinText.fontSize = 40;
  enemyWinText.fill = '#ffffff';
  enemyWinText.fixedToCamera = true
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
    let currentlyMovingEnemy = enemySquadMember

        game.time.events.add(1000 + (enemyMoveTime * 1000), chargeAtPlayer, this, currentlyMovingEnemy);
        enemyMoveTime++;

    });
}

function enemyRangeTo(shooter, target) {
  let targetHexPos = hexPositionFromSpriteCoordinates(target.x, target.y)
  let targetCubePos = offsetToCube(targetHexPos.x, targetHexPos.y)
  let shooterHexPos = hexPositionFromSpriteCoordinates(shooter.x, shooter.y)
  let shooterCubePos = offsetToCube(shooterHexPos.x, shooterHexPos.y)
  let distanceBetween = cubeDistance(shooterCubePos, targetCubePos)
  return distanceBetween
}

function checkForTargetInWeaponsRange(currentlyMovingEnemy) {
  for(let i = 0, length1 = playerSquad.children.length; i < length1; i++){
    if (!currentlyMovingEnemy.hasFired) {
      let targetDistance = enemyRangeTo(currentlyMovingEnemy, playerSquad.children[i])
      if (targetDistance <= currentlyMovingEnemy.weaponRange) {
        console.log('checkForTargetInWeaponsRange running')
        let targetCandidate = playerSquad.children[i]
        enemyCombat(currentlyMovingEnemy, targetCandidate)
      } else {
        currentlyMovingEnemy.hasFired = true
        checkEndEnemyTurn()
      }
    }
  }
}


$('.login-page form').submit((e) => {
  e.preventDefault()
  var email = $('input[type="email"]').val()
  var password = $('input[type="password"]').val()
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
  alert(errorMessage)
})
  .then(() => {
    $('form')[0].reset()
  })
})

//sign-out button
$('.sign-out').click(()=>{
  firebase.auth().signOut()
})

//register button
$('.register').click(()=>{
  var email = $('input[type="email"]').val()
  var password = $('input[type="password"]').val()
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    alert(errorMessage)
  })
  .then(() => {
    $('form')[0].reset()
  })
})

$('.main-page form').submit((e) => {
  e.preventDefault()
  var task = $('.main-page input[type="text"]').val()
  var uid = firebase.auth().currentUser.uid
  $.post(
    `https://c17-firebase-auth-jufe.firebaseio.com/${uid}.json`,
    JSON.stringify({task : task})
  ).then(console.log)
})



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
