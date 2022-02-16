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