function $(querySelector, element = document){
    return element.querySelector(querySelector);
}

function loadModel(){
    const modelPath = "./model/model.json";
    return tf.loadGraphModel(modelPath);
}

async function setupWebcam(videoRef) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'environment', // 'user' or 'environment'
            },
        })
        if ('srcObject' in videoRef) {
            videoRef.srcObject = webcamStream
        } else {
            videoRef.src = window.URL.createObjectURL(webcamStream)
        }
        return new Promise((resolve, _) => {
            videoRef.onloadedmetadata = () => {
                const detection = document.getElementById('detection')
                const ctx = detection.getContext('2d')
                const imgWidth = videoRef.clientWidth
                const imgHeight = videoRef.clientHeight
                detection.width = imgWidth
                detection.height = imgHeight
                ctx.font = '16px sans-serif'
                ctx.textBaseline = 'top'
                resolve([ctx, imgHeight, imgWidth])
            }
        })
    } else {
        alert('Нет вебкамеры - извините!')
    }
}

async function performDetections(model, camera, [ctx, imgHeight, imgWidth]) {
    const cameraInputTensor = tf.browser.fromPixels(camera);
    const singleBatch = tf.expandDims(cameraInputTensor, 0);

	const proccessedImage = tf.image.cropAndResize(
		singleBatch, 	        					// image [batch,imageHeight,imageWidth, depth]
		[[0, 0, 1, 1]],				                // standartized boxes [numBoxes, 4]
		[0],										// image that the i-th box refers to
		[size, Math.floor(size*imgWidth/imgHeight)],// cropSize [num, num]
        'bilinear'
	);
    const proccessedImageInt = tf.cast(proccessedImage, "int32");

    const results = await model.executeAsync(proccessedImageInt);

    const justBoxes = results[1].squeeze();
    const boxes = await justBoxes.array();

    const topDetections = tf.topk(results[0]);
    const maxIndices = await topDetections.indices.data();

    const justValues = topDetections.values.squeeze();
    const scores = await justValues.data();

    const maxBoxes = 5;
    const iouThreshold = 0.2;
    const detectionThreshold = 0.6;

    const nmsDetections = await tf.image.nonMaxSuppressionWithScoreAsync(
        justBoxes,          // shape [numBoxes, 4]
        justValues,         // shape [numBoxes]
        maxBoxes,           // Stop making boxes when this number is hit 
        iouThreshold,       // Allowed overlap value 0 to 1
        detectionThreshold, // Minimum detection score allowed
        1                   // 0 is normal NMS, 1 is max Soft-NMS 
    );

    const chosen = await nmsDetections.selectedIndices.data();

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    chosen.forEach((detection) => {
        ctx.strokeStyle = "#0F0";
        ctx.lineWidth = 4;
        ctx.globalCompositeOperation='destination-over'; 
        const detectedIndex = maxIndices[detection]; 
        const detectedClass = CLASSES[detectedIndex]; 
        const detectedScore = scores[detection];
        const dBox = boxes[detection];

        console.log(detectedClass, detectedScore);

        // No negative values for start positions
        const startY = dBox[0] > 0 ? dBox[0] * imgHeight : 0;
        const startX = dBox[1] > 0 ? dBox[1] * imgWidth : 0;
        const height = (dBox[2] - dBox[0]) * imgHeight;
        const width = (dBox[3] - dBox[1]) * imgWidth;
        ctx.strokeRect(startX, startY, width, height);

        // Draw the label background.
        ctx.globalCompositeOperation='source-over'; 
        ctx.fillStyle = "#0F0";
        const textHeight = 16;
        const textPad = 4;
        const label = `${detectedClass} ${Math.round(detectedScore * 100)}%`; 
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(
            startX,
            startY,
            textWidth + textPad,
            textHeight + textPad
        );
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(label, startX + textPad/2, startY + textPad/2);

        say(detectedClass);
    });

    tf.dispose([
        cameraInputTensor, 
        singleBatch,
        proccessedImage,
        proccessedImageInt,
        results, 
        topDetections, 
        justBoxes, 
        justValues, 
        nmsDetections
    ]);
}

var model;

async function doStuff() {
    try {
        model = await loadModel()
        const camera = document.getElementById('camera')
        const camDetails = await setupWebcam(camera)

        const interval = setInterval(() => {
            requestAnimationFrame(() => {
                performDetections(model, camera, camDetails).then(() => {
                    if(stop){
                        tf.dispose([model]);
                        clearInterval(interval);
                    }
                });
            })
        }, 1500);

    } catch (e) {
        console.error(e)
    }
}



function getRusVoice(voices){
	for(let i in voices){
		if(voices[i].lang.indexOf("ru") + 1){
			return voices[i];
		}
	}
	return null;
}

function say(text, lang="ru"){
    
    const voices = speechSynthesis.getVoices();
    if(voices.length > 0){
        const tts = new SpeechSynthesisUtterance(text);
    
        if(lang == "ru"){
            tts.lang = "ru-RU";
        }
        return window.speechSynthesis.speak(tts);
    }
}


let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    document.querySelector("#install").style.display = "block";
    document.querySelector("#install").addEventListener('click', (e) => {
        // Hide the app provided install promotion
        document.querySelector("#install").style.display = "none";
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            } else {
            console.log('User dismissed the install prompt');
            }
        })
    });
});

let size = 200;
$("input").addEventListener("input", (e) => {
    size = e.srcElement.value;
    $("#rangeValue").innerText = e.srcElement.value;
});

let stop = false;
window.onload = () => {
    function begin(){
        $('#begin').removeEventListener('click', begin);
        $("#begin > center:nth-child(6)").innerText = 'Модель загружается...\nэто может занять некоторое время';
        
        doStuff().then(() => {
            $('#cameraBox').style.transform = "translateY(0)";
            $('#begin').style.display = "none";
        });
    }
    window.scrollTo(0, 0);
    $('#cameraBox').style.transform = "translateY(100vh)";
    $('#begin').addEventListener('click', begin);
};