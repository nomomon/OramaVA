$("#ocr").addEventListener("click", () => {
    read();
});

async function loadOCRModel(worker){
    await worker.load();
    await worker.loadLanguage('rus'); // mult lang eng+rus
}

async function deleteOCRModel(worker){
    return await worker.terminate();
}

function cleanResults(results, threshold = 30){
    return (results.data.confidence > threshold)? results.data.text : "";
}

async function performOCR(worker, img){
    const c = document.createElement('canvas');
    let w = img.clientWidth,
        h = img.clientHeight;
    c.width = w;
    c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);

    ocrInProgress = true;
    const results = await worker.recognize(c);
    const cleaned = cleanResults(results)
    console.log(results, cleaned);

    return cleaned;
}

function read(){
    on.play();
    setTimeout(() => {
        $("body").addEventListener("click", screenWasTouched, {once:true})
    }, 100)
    
    
    const camera = $('#camera');
    
    const interval = setInterval(() => {
        requestAnimationFrame(() => {
            if(window.speechSynthesis.speaking || ocrInProgress) return 0;

            performOCR(tesseractWorker, camera).then(text => {
                ocrInProgress = false;
                say(text);
                
                if(stop){
                    off.play();
                    stop = false;
                    // deleteOCRModel(tesseractWorker);
                    clearInterval(interval);
                }
            });
        })
    }, 500);
}

let ocrInProgress = false;
const tesseractWorker = Tesseract.createWorker({
    // logger: m => console.log(m) // log detection progress
});
(async function (){
    try {
        await loadOCRModel(tesseractWorker);
    } catch (e) {
        console.error(e)
    }
})();