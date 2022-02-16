function $(querySelector, element = document){
    return element.querySelector(querySelector);
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