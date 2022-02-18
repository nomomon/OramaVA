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

function screenWasTouched(){
    stop = true;
    console.log("oops")
}

function find(objectClass){
    console.log(objectClass);
    $("#object_list").style.display = "none";
    setTimeout(() => {
        $("body").addEventListener("click", screenWasTouched, {once:true})
    }, 100)


    const camera = $('#camera')

    const interval = setInterval(() => {
        requestAnimationFrame(() => {
            performDetections(objectDetectionModel, camera).then(foundObjects => {
                console.log(objectClass, foundObjects);
                if(foundObjects.includes(objectClass)){
                    say("нашел!");
                }
                
                if(stop){
                    say("поиск остановлен");
                    stop = false;
                    // tf.dispose([objectDetectionModel]);
                    clearInterval(interval);
                }
            });
        })
    }, 300);

}

function loadModel(){
    const modelPath = "/models/objdet/model.json";
    return tf.loadGraphModel(modelPath);
}

async function performDetections(model, camera){
    const cameraInputTensor = tf.browser.fromPixels(camera);
    const singleBatch = tf.expandDims(cameraInputTensor, 0);

    const results = await model.executeAsync(singleBatch);

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
        results, 
        topDetections, 
        justBoxes, 
        justValues, 
        nmsDetections
    ]);

    return foundObjects;
}

var objectDetectionModel, stop = false;
(async function (){
    try {
        objectDetectionModel = await loadModel()
    } catch (e) {
        console.error(e)
    }
})();