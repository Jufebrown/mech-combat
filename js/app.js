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
let currentlyMovingEnemy

function onUpdate() {
  if (playerTurn) {
    checkEndPlayerTurn()
  } else if (!playerTurn) {
    checkEndEnemyTurn()
  }
}


let enemyCounter = 0;                     //  set your counter to 1

function enemyMoveType() {           //  create a loop function
  currentlyMovingEnemy = enemySquad.children[enemyCounter]
  setTimeout(function() {    //  call a 3s setTimeout when the loop is called
  console.log('currentlyMovingEnemy', currentlyMovingEnemy)
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
    enemyCounter++;                     //  increment the counter
    if (enemyCounter < enemySquad.children.length) {
      enemyMoveType();       //  ..  again which will trigger another
    }                        //  ..  setTimeout()
  }, 3000)
}

function enemyRangeTo(shooter, target) {
  let targetHexPos = hexPositionFromSpriteCoordinates(target.x, target.y)
  let targetCubePos = offsetToCube(targetHexPos.x, targetHexPos.y)
  let shooterHexPos = hexPositionFromSpriteCoordinates(shooter.x, shooter.y)
  let shooterCubePos = offsetToCube(shooterHexPos.x, shooterHexPos.y)
  let distanceBetween = cubeDistance(shooterCubePos, targetHexPos)
  return distanceBetween
}

function checkForTargetInWeaponsRange() {
  for(let i = 0, length1 = playerSquad.children.length; i < length1; i++){
    if (!currentlyMovingEnemy.hasFired) {
      let targetDistance = enemyRangeTo(currentlyMovingEnemy, playerSquad.children[i])
      if ( <= currentlyMovingEnemy.weaponRange) {
        let targetCandidate = playerSquad.children[i]
        enemyCombat(targetCandidate)
      }
    }
  }
}


// function enemyMoveType() {
//   for(var i = 0, length1 = enemySquad.children.length; i < length1; i++) {
//     // console.log('length1', length1)
//   }
// }

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
