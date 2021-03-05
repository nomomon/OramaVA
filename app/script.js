var good = 1;
document.getElementById('begin').addEventListener('click', function(){
    document.getElementById('begin').lastElementChild.innerText = 'Loading...\nIt may take sometime';
    if(good == 1){
        init();
        good = 0;
    }
})

var plate = new Audio('/app/audio/plate.mp3');
var cup = new Audio('/app/audio/cup.mp3');
var hat = new Audio('/app/audio/hat.mp3');
var slipper = new Audio('/app/audio/slipper.mp3');

const URL = "model/";

// const URL = 'https://teachablemachine.withgoogle.com/models/GRjAN-Le/'

let model, webcam, labelContainer, maxPredictions;

var constraints = {
    facingMode:"environment"
};

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = false; 
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(constraints);
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById('begin').style.display = 'none';

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        if(prediction[i].probability > 0.9)try{
            eval(prediction[i].className +'.play()')
        }catch(err){}
    }
}

// init();