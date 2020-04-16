// show start btn and hide new round btn
$("#start-btn").show();
$("#stop-btn").hide();
$("#new-round-btn").hide();
$("#visualize-data").hide();

let choiceImgList = ["bao.jpg", "zin.jpg", "dap.jpg"];
let message = document.querySelector("#new-round-btn");


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "../my-model/";

let model, webcam, labelContainer, maxPredictions;
let updateWebcam;


// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    $("#start-btn").hide();
    $("#stop-btn").show();
    $("#new-round-btn").show();
    $("#visualize-data").show();
    message.removeAttribute("disabled");

}

async function loop() {
  updateWebcam = setInterval(async function() {
    await webcam.update(); // update the webcam frame
    await predict();
  }, 1000/10);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    let barPercentage = "";

    for (let i = 0; i < maxPredictions; i++) {
        // const classPrediction =
        //     prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        // labelContainer.childNodes[i].innerHTML = classPrediction;
        barPercentage = Math.round(prediction[i].probability.toFixed(2)*100) + "%";
        document.querySelectorAll(".vis-bar")[i].style.width = barPercentage;
        document.querySelectorAll(".vis-bar")[i].innerText = barPercentage;
    }
}

function stopWebcam() {
  webcam.stop();
  clearInterval(updateWebcam);
  $("#start-btn").show();
  $("#stop-btn").hide();
  message.disabled = "true";

}

function newround() {
  message.classList.remove("btn-primary");
  message.classList.add("btn-secondary");
  message.innerText = "Are you ready?";

  // set a timer with 3 seconds
  let timeleft = 3; //countdown seconds
  let countdown = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(countdown);
      comparison();
    } else {
      message.innerText = timeleft;
    }
    timeleft -= 1;
  }, 700);
}

function comMakeChoice() {
  let comChoice = Math.floor(Math.random() * 3);
  let comImg = choiceImgList[comChoice];
  console.log("comChoice = " + comChoice);
  console.log("comImg = " + comImg);
  document.getElementById("com-img").src = "./images/" + comImg;
  return comChoice;
}

async function humanMakeChoice() {
  
  const predictions = await model.predict(webcam.canvas);
  let mostProbable = Math.max(predictions[0].probability, predictions[1].probability, predictions[2].probability);
  function findThatChoice(prediction) {
    return prediction.probability == mostProbable;
  }
  let humanChoice = predictions.findIndex(findThatChoice);
  stopWebcam();
  return humanChoice;
}



async function comparison() {
  let comChoice = comMakeChoice();
  let humanChoice = await humanMakeChoice();
  console.log("com" + comChoice);
  console.log("human" + humanChoice);
  let result = "e"; // default result is error
  if ((comChoice + 1)%3 == humanChoice) result = "h";
  if ((humanChoice + 1)%3 == comChoice) result = "c";
  if (comChoice == humanChoice) result = "d";

  displayResult(result);
}

function displayResult(r) {
  console.log(r);
  switch (r) {
    case 'h':
      message.innerText = "You win!";
      confetti();
      break;
    case 'c':  
      message.innerText = "Computer wins!";
      break;
    case 'd':
      message.innerText = "Draw!";
      break;
    default:
      message.innerText = "Default message";
  }

  let resetGame = setInterval(function(){
    init();
    message.innerText = "Another Round!";
    message.classList.add("btn-primary");
    message.classList.remove("btn-secondary");
    message.removeAttribute("disabled");
    clearInterval(resetGame);
  }, 4000);
}










