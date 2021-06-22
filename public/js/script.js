// Get the video element
const video = document.getElementById('video')

// When models load, then it uses the start video function
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.recognizeFaceExpressions
]).then(startVideo)


// Gets video object (webcam)
function startVideo() {
  navigator.getUserMedia({
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

// Creates the "AI Face Recognition overlay"
video.addEventListener('play', () => {

  // Creates canvas from webcam
  const canvas = faceapi.createCanvasFromMedia(video)

  //Output canvas onto html
  document.body.append(canvas)

  // Size object
  const displaySize = {
    width: video.width,
    height: video.height
  }

  // Matches overlay to canvas
  faceapi.matchDimensions(canvas, displaySize)

  //Draws the outline and dots around your face every 100 ms. This is done with the AI's dectection, landmark and expression logic.
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    //console.log(detections); if u want to know the dectections it creates

    //Calls yourExpression function
    this.yourExpression(detections);

  }, 100)
})

// Decides your expression
function yourExpression(detections) {

  // Each time it dections your expression with 90% certainty, it calls the "controller"
  detections.forEach(element => {
    if (element.expressions.happy > 0.9) {
      controller.faceListener("happy");
    } else if (element.expressions.surprised > 0.9) {
      controller.faceListener("surprised");
    } else if (element.expressions.angry > 0.9) {
      controller.faceListener("angry");
    } else if (element.expressions.neutral > 0.9) {
      controller.faceListener("neutral");
    } else {
      controller.faceListener("Something")
    }
  });
}

// Declare variables
let context, controller, rectangle, loop, enemy;

// Finds canvas
context = document.querySelector("canvas").getContext("2d");

//Sets heights and width
context.canvas.height = 180;
context.canvas.width = 320;

// Creates player rectangle
rectangle = {
  height: 32,
  jumping: true,
  width: 32,
  x: 30,
  x_velocity: 0,
  y: 80,
  y_velocity: 0
};

// Creates enemy rectangle
enemy = {
  height: 32,
  width: 32,
  x: 320, // center of the canvas
  x_velocity: 0,
  y: 0,
  y_velocity: 0
};

//Controller logic
controller = {

  // Predefine everything to false
  left: false,
  right: false,
  up: false,
  down: false,

  //Key-Controller
  keyListener: function (event) {

    let key_state = (event.type == "keydown") ? true : false;

    switch (event.keyCode) {

      case 37: // left key
        controller.left = key_state;
        break;
      case 38: // up key
        controller.up = key_state;
        break;
      case 39: // right key
        controller.right = key_state;
        break;
      case 40: // right down
        controller.down = key_state;
        //console.log(key_state);
        break;

    }
  },

  // Face-Controller
  faceListener: function (expression) {
    console.log(expression);
    switch (expression) {
      case "surprised": // left key
        // Sets every other direction to false, since it messes up the controlling by not being able to "undo" and expression
        controller.left = true;
        controller.right = false;
        controller.up = false;
        controller.down = false;
        break;
      case "happy": // up key
        controller.left = false;
        controller.right = false;
        controller.up = true;
        controller.down = false;
        break;
      case "angry": // right key
        controller.left = false;
        controller.right = true;
        controller.up = false;
        controller.down = false;
        break;
      case "neutral": // up key
        controller.left = false;
        controller.right = false;
        controller.up = false;
        controller.down = true;
        break;

        //We set every controller to false, because it would keep the expression without reseting.
      default:
        controller.left = false;
        controller.up = false;
        controller.right = false;
        controller.down = false;
        break;
    }
  }
};




// Declare counter varible
let counter = 0;

//Inside the game
loop = function () {
  //Bug: There was two trues at the same time, that made the controlling of the player buggy when moving up and down. The solution was to set everything else to false inside of the case inside the switch.
  console.log(controller);

  // Secures that the player doesn't go out of sight (in the "up" direction)
  if (controller.up && rectangle.y > 0) {
    rectangle.y -= 0.5;
    console.log(rectangle.y);
    //147.5
  }

  
  if (controller.left) {
    rectangle.x -= 0.5;
  }

  if (controller.right) {
    rectangle.x += 0.5;
  }

  if (controller.down && rectangle.y < 148) {
    rectangle.y += 0.5;
    console.log(rectangle.y);
    //148
  }


  // if enemy is going off the left of the screen
  enemy.x -= 0.5
  if (enemy.x < -32) {
    enemy.y = Math.floor(Math.random() * 179);
    enemy.x = 320
  }

  //Scoreboard counter
  counter++;
  document.getElementById("score").innerHTML = "Your score: " + counter;

  //Movement showcaser
  document.getElementById("movement").innerHTML = "<br /><br />Up: Be Happy!<br />Down: Be neutral!<br />Right: Be Angry!<br />Left: Be Suprised!";

  //Background
  context.fillStyle = "#38556b";
  context.fillRect(0, 0, 320, 180); // x, y, width, height

  //Player
  context.fillStyle = "#c2d3e4";
  context.beginPath();
  context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  context.fill();
  context.stroke();

  //Enemy
  context.fillStyle = "#4c646c";
  context.beginPath();
  context.rect(enemy.x, enemy.y, enemy.width, enemy.height);
  context.fill();
  context.stroke();

  //Calls all the functions
  hitLeftWall(rectangle);
  hitReg(rectangle, enemy);
  hitFloor(rectangle);
  hitTop(rectangle);





  // Call update when the browser is ready to draw again
  window.requestAnimationFrame(loop);

};

// Collision
function hitReg(player, enemy) {
  //Player should not be inside the range of enemy
  if (player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y) {
    endgameAlert("U got Smashed!");
    enemy.x = 320;
    player.x = 0;
  }

  console.log("hitReg");

}

// Shouldn't go out of sight on the left side of the canvas
function hitLeftWall(player) {
  if (player.x < 0) {
    player.x = 0
  }
}

// Player dies when hitting the floor
function hitFloor(player) {
  if (player.y > 147) {
    endgameAlert("The Floor is Lava... ")
    player.y = 30;
    enemy.x = 320;
  }
}

// Player dies when hitting the roof
function hitTop(player) {
  if (player.y <= 0) {
    endgameAlert("The roof is on fire!")
    player.y = 30;
    enemy.x = 320;

  }
}

// Gives an alert when player dies of its highscore
function endgameAlert(text) {
  alert(text + "Your Score Was " + counter);
  counter = 0;
}

// Keyboard support
window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);

// Updates the loop
window.requestAnimationFrame(loop);