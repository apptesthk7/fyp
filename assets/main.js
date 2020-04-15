// show start btn and hide new round btn
document.getElementById("start-btn").style.display = "initial";
document.getElementById("stop-btn").style.display = "none";
// for test only
// document.getElementById("new-round-btn").style.display = "none";
document.getElementById("visualize-data").style.display = "none";

var choiceImgList = ["bao.jpg", "zin.jpg", "dap.jpg"];


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "../my-model/";

let model, webcam, labelContainer, maxPredictions;
var globalID;


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
    globalID = window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("stop-btn").style.display = "initial";
    document.getElementById("new-round-btn").style.display = "initial";
    document.getElementById("visualize-data").style.display = "initial";

}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  globalID = window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    var barPercentage = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        barPercentage = Math.round(prediction[i].probability.toFixed(2)*100) + "%";
        document.querySelectorAll(".vis-bar")[i].style.width = barPercentage;
        document.querySelectorAll(".vis-bar")[i].innerText = barPercentage;
    }
}

function stopWebcam() {
  webcam.stop();
  cancelAnimationFrame(globalID);

  document.getElementById("start-btn").style.display = "initial";
  document.getElementById("stop-btn").style.display = "none";
  document.getElementById("visualize-data").style.display = "none";
  document.getElementById("webcam-container").innerHTML = "";
}

function newround() {
  var message = document.getElementById("new-round-btn");
  message.classList.remove("btn-primary");
  message.classList.add("btn-secondary");
  message.innerText = "Are you ready?";

  // set a timer with 3 seconds
  var timeleft = 1; //countdown seconds
  var countdown = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(countdown);
      comparison();
    } else {
      message.innerText = timeleft;
    }
    timeleft -= 1;
  }, 1000);
}

function comMakeChoice() {
  var comChoice = Math.floor(Math.random() * 3);
  var comImg = choiceImgList[comChoice];
  document.getElementById("com-img").src = "./images/" + comImg;
  return comChoice;
}

async function humanMakeChoie() {
  webcam.stop();
  cancelAnimationFrame(globalID);
  const predictions = await model.predict(webcam.canvas);
  var mostProbable = Math.max(predictions[0].probability, predictions[1].probability, predictions[2].probability);
  function findThatChoice(prediction) {
    return prediction.probability == mostProbable;
  }
  return predictions.findIndex(findThatChoice);
}



function comparison() {
  var comChoice = comMakeChoice();
  // var humanChoice = humanMakeChoie();
  var humanChoice = comMakeChoice();
  var name = ["bao", "zin", "dap"];
  var result = "e"; // default result is error
  if ((comChoice + 1)%3 == humanChoice) result = "h";
  if ((humanChoice + 1)%3 == comChoice) result = "c";
  if (comChoice == humanChoice) result = "d";

  displayResult(result);
}

function displayResult(r) {
  console.log(r);
}










