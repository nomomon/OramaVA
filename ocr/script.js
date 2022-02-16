const img = document.querySelector("img");
// const url = './tweet.png';

const worker = Tesseract.createWorker({
    logger: m => console.log(m)
});

(async () => {
    await worker.load();
    await worker.loadLanguage('rus');
    await worker.initialize('rus');

    console.time("recognize")
    const {
        data:{text}
    } = await worker.recognize(img); 
//  } = await worker.recognize(url); 
    console.timeEnd("recognize")

    console.log(text);
    await worker.terminate();
})();