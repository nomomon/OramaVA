$("#find").addEventListener("click", () => {
    $("nav").ariaHidden = true;
    $("#object_list").style.display = "block";
    $("#object_list").focus();
});

function fillInObjectsList(){
    const objectClasses = [...CLASSES];
    objectClasses.sort();

    for(let objectClass of objectClasses){
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
    on.play();
    $("#object_list").style.display = "none";
    $("nav").ariaHidden = false;
    setTimeout(() => {
        $("body").addEventListener("click", screenWasTouched, {once:true})
    }, 100);
    
    
    const camera = $('#camera');
    const imgWidth = camera.clientWidth
    const imgHeight = camera.clientHeight
    
    const interval = setInterval(() => {
        requestAnimationFrame(() => {
            performDetections(objectDetectionModel, camera, [imgHeight, imgWidth])
            .then(foundObjects => {
                console.log(objectClass, foundObjects);
                if(foundObjects.includes(objectClass)){
                    pulse.play();
                }
                
                if(stop){
                    off.play();
                    stop = false;
                    // tf.dispose([objectDetectionModel]);
                    clearInterval(interval);
                }
            });
        })
    }, 500);

}

function loadModel(){
    const modelPath = "./models/objdet/model.json";
    return tf.loadGraphModel(modelPath);
}

async function performDetections(model, camera, [imgHeight, imgWidth]){
    const cameraInputTensor = tf.browser.fromPixels(camera);
    const singleBatch = tf.expandDims(cameraInputTensor, 0);

    const size = Math.min(400, imgHeight);
    const proccessedImage = tf.image.cropAndResize(
        singleBatch, 	        					
        [[0, 0, 1, 1]],				                
        [0],										
        [size, Math.floor(size * imgWidth/imgHeight)],
        'bilinear'
    );
    const proccessedImageInt = tf.cast(proccessedImage, "int32");

    const results = await model.executeAsync(proccessedImageInt);

    const justBoxes = results[1].squeeze();

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
    const foundObjects = [];

    chosen.forEach((detection) => {
        const detectedIndex = maxIndices[detection]; 
        const detectedClass = CLASSES[detectedIndex]; 
        const detectedScore = scores[detection];

        if(detectedScore > .5){
            foundObjects.push(detectedClass);
        }
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

    return foundObjects;
}

var objectDetectionModel;
(async function (){
    try {
        objectDetectionModel = await loadModel()
    } catch (e) {
        console.error(e)
    }
})();