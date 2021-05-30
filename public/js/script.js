const video = document.getElementById('video')


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.recognizeFaceExpressions
  ]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults
        (detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

      //console.log(detections);
      this.yourExpression(detections);

    }, 100)
})

function yourExpression(detections){
  detections.forEach(element => {
    //console.log(element.expressions.happy);
    if(element.expressions.happy > 0.9){
      //console.log("You Are Happy");
      controller.faceListener("happy");
    }
    else if(element.expressions.surprised > 0.9){
      //console.log("You Are Happy");
      controller.faceListener("surprised");
    }
    else if(element.expressions.angry > 0.9){
      //console.log("You Are Happy");
      controller.faceListener("angry");
    }else {
      controller.faceListener("Et eller andet");
    }

    

  });

}


// CANVAS GAME
//___________________________________________________________

/*const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let context, controller, rectangle, loop;

square();
line();


function square(){
    ctx.beginPath();
    ctx.rect(20, 20, 80, 80);
    ctx.stroke();   
}


function line(){
    ctx.beginPath();
    ctx.rect(0, 600, 1000, 20);
    ctx.stroke(); 
}*/


var context, controller, rectangle, loop, obstacle;

context = document.querySelector("canvas").getContext("2d");

context.canvas.height = 180;
context.canvas.width = 320;

obstacle = {

  height:32,
  width:32,
  x:144, // center of the canvas
  x_velocity:0,
  y:0,
  y_velocity:0

};


rectangle = {

  height:32,
  jumping:true,
  width:32,
  x:144, // center of the canvas
  x_velocity:0,
  y:0,
  y_velocity:0

};

controller = {

  left:false,
  right:false,
  up:false,
  keyListener:function(event) {

    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {

      case 37:// left key
        controller.left = key_state;
      break;
      case 38:// up key
        controller.up = key_state;
      break;
      case 39:// right key
        controller.right = key_state;
      break;

    }
    },

    faceListener:function(expression) {
      console.log(expression);
        switch(expression) {
          
          case "surprised":// left key
            controller.left = true;
          break;
          case "happy":// up key
            controller.up = true;
          break;
          case "angry":// right key
            controller.right = true;
          break;
          
          default: 
            controller.left = false;
            controller.up = false;
            controller.right = false;
          break;
        }
    }
  };

loop = function() {

  if (controller.up && rectangle.jumping == false) {

    rectangle.y_velocity -= 100;
    rectangle.jumping = true;

  }

  if (controller.left) {

    rectangle.x_velocity -= 0.5;

  }

  if (controller.right) {

    rectangle.x_velocity += 0.5;

  }

  rectangle.y_velocity += 0.3;// gravity
  rectangle.x += rectangle.x_velocity;
  rectangle.y += rectangle.y_velocity;
  rectangle.x_velocity *= 0.1;// friction
  rectangle.y_velocity *= 0.1;// friction

  // if rectangle is falling below floor line
  if (rectangle.y > 180 - 16 - 32) {

    rectangle.jumping = false;
    rectangle.y = 180 - 16 - 32;
    rectangle.y_velocity = 0;

  }

  // if rectangle is going off the left of the screen
  if (rectangle.x < -32) {

    rectangle.x = 320;

  } else if (rectangle.x > 320) {// if rectangle goes past right boundary

    rectangle.x = -32;

  }

  if (obstacle.x < -32) {

    obstacle.x = 320;

  }

  context.fillStyle = "#202020";
  context.fillRect(0, 0, 320, 180);// x, y, width, height
  context.fillStyle = "#ff0000";// hex for red
  context.beginPath();
  context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  context.fill();
  context.strokeStyle = "#202830";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, 164);
  context.lineTo(320, 164);
  context.stroke();


  //Obstacle
  context.beginPath();
  context.rect(obstacle.x, 130, obstacle.width, obstacle.height);  
  context.stroke();


  // call update when the browser is ready to draw again
  window.requestAnimationFrame(loop);

};

window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);
