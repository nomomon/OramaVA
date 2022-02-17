$("#find").addEventListener("click", () => {
    $("#object_list").style.display = "block";
});

function fillInObjectsList(){
    for(let objectClass of CLASSES.sort()){
        if(objectClass in {"неиспользованный":"", "unused":""}) continue;
        
        $("#list").innerHTML += `\n<li>${objectClass}</li>`;
    }
    
    $("#list").querySelectorAll("li").forEach(li => {
        li.addEventListener("click", () => {
            const objectClass = li.innerText; 
            find(objectClass);
        });
    });
}

function find(objectClass){
    console.log(objectClass);
    $("#object_list").style.display = "none";
}

function loadModel(){
    const modelPath = "./model/model.json";
    return tf.loadGraphModel(modelPath);
}

async function performDetections(model, camera, [ctx, imgHeight, imgWidth]) {
    const cameraInputTensor = tf.browser.fromPixels(camera);
    const singleBatch = tf.expandDims(cameraInputTensor, 0);
    
    const size = 200;
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

    const maxBoxes = 20;
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

    chosen.forEach((detection) => {
        const detectedIndex = maxIndices[detection]; 
        const detectedClass = CLASSES[detectedIndex]; 
        const detectedScore = scores[detection];

        console.log(detectedClass, detectedScore);

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