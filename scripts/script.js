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
                const imgWidth = videoRef.clientWidth
                const imgHeight = videoRef.clientHeight
                resolve([imgHeight, imgWidth])
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
        
        if(!window.speechSynthesis.speaking){
            return window.speechSynthesis.speak(tts);
        }
    }
}

let stop = false;
function screenWasTouched(){
    stop = true;
}