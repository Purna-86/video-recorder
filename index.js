let video = document.querySelector("video");
let recordBtnCont=document.querySelector(".record-btn-cont");
let recordBtn=document.querySelector(".record-btn");
let captureBtnCont=document.querySelector(".capture-btn-cont");
let captureBtn=document.querySelector(".capture-btn");
let pauseBtnCont = document.querySelector(".pause-btn-cont");
let pauseBtn = document.querySelector(".pause-btn");
let isPaused = false;
let recordFlag=false;
let transparentColor="transparent";
let recorder;
let chunks=[];
let mediaStream;
let recordCanvas = document.createElement("canvas");
let ctx = recordCanvas.getContext("2d");
let constrains={
    audio:true,
    video:true,
} 
navigator.mediaDevices.getUserMedia(constrains)
.then((stream) => {
   video.srcObject=stream;
   mediaStream=stream;
   video.addEventListener("loadedmetadata", () => {
        drawToCanvas();
    });

    let canvasStream = recordCanvas.captureStream(30);

    // add audio track to canvas stream
    stream.getAudioTracks().forEach(track => {
        canvasStream.addTrack(track);
    });
      recorder = new MediaRecorder(canvasStream, {
        mimeType: "video/mp4"
    });
   recorder.addEventListener("start",(e)=>{
    chunks=[];
   })
   recorder.addEventListener("dataavailable",(e)=>{
    chunks.push(e.data);
   })
   recorder.addEventListener("stop",(e)=>{
    let blob =new Blob(chunks,{type:("video/mp4")});
    let videoURL=URL.createObjectURL(blob);
    let a=document.createElement("a");
    a.href=videoURL;
    a.download="stream.mp4";
    a.click();
   })
   recordBtnCont.addEventListener("click",(e)=>{
    if(!recorder) return;
    recordFlag=!recordFlag;
    if(recordFlag){
        recorder.start();
        recordBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        recordBtn.classList.add(("scale-record"));
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        pauseBtnCont.style.pointerEvents = "auto";
        isPaused = false;
        startTimer();
    }
    else{
        recorder.stop();
        recordBtn.innerHTML = '<i class="fa-solid fa-circle"></i>';
        recordBtn.classList.remove("scale-record");
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        pauseBtnCont.style.pointerEvents = "none";
        isPaused = false;
        mediaStream.getTracks().forEach(track => track.enabled = true);
        video.play();  
        stopTimer();
    }
   })
});

pauseBtnCont.addEventListener("click", () => {
    if (!recorder || recorder.state === "inactive") return;

    if (!isPaused) {
        recorder.pause();
        video.pause();
        mediaStream.getTracks().forEach(track => track.enabled = false);
        pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        pauseTimer();
        isPaused = true;
    } else {
        recorder.resume();
        video.play();
        mediaStream.getTracks().forEach(track => track.enabled = true);
        pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        isPaused = false;
        startTimer(); // resume timer
    }
});
function drawToCanvas() {
    recordCanvas.width = video.videoWidth;
    recordCanvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, recordCanvas.width, recordCanvas.height);

    if (transparentColor !== "transparent") {
        ctx.fillStyle = transparentColor;
        ctx.fillRect(0, 0, recordCanvas.width, recordCanvas.height);
    }

    requestAnimationFrame(drawToCanvas);
}
captureBtnCont.addEventListener('click',(e)=>{
    captureBtnCont.classList.add("scale-capture");
    let canvas =document.createElement("canvas");
    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;
    let tool=canvas.getContext("2d");
    tool.drawImage(video,0,0,canvas.width,canvas.height);
    tool.fillStyle=transparentColor;
    tool.fillRect(0,0,canvas.width,canvas.height);
    canvas.toBlob((blob)=>{
        let imageURL=URL.createObjectURL(blob);
        let a=document.createElement('a');
        a.href=imageURL;
        a.download="Image.jpg";
        a.click();

        URL.revokeObjectURL(imageURL);
    },"image/jpeg",0.9);
    
    setTimeout(()=>{
        captureBtn.classList.remove("scale-capture");
    },100);
})
let filter=document.querySelector(".filter-layer");
let allfilter=document.querySelectorAll(".filter");
allfilter.forEach(filterEle => {
    filterEle.addEventListener("click",(e)=>{
        transparentColor=getComputedStyle(filterEle).getPropertyValue("background-color");
        filter.style.backgroundColor=transparentColor;
    })
    
});

let timerId;
let counter=0;
let timer=document.querySelector(".timer");
function displayTimer(){
        let totalSeconds=counter;
        let hours=Number.parseInt(totalSeconds/3600);
        totalSeconds=totalSeconds%3600;
        let minutes=Number.parseInt(totalSeconds/60);
        totalSeconds=totalSeconds%60;
        let seconds=totalSeconds;
        hours=(hours<10)? `0${hours}`:hours;
        minutes=(minutes<10)?`0${minutes}`:minutes;
        seconds=(seconds<10)?`0${seconds}`:seconds;
        timer.innerText=`${hours}:${minutes}:${seconds}`;
        counter++;
    }
function startTimer(){
    clearInterval(timerId);
     timer.style.display = "block";
    timerId = setInterval(displayTimer, 1000);
}
function pauseTimer(){
    clearInterval(timerId);
}
function  stopTimer(){
    clearInterval(timerId);
    counter=0;
    timer.innerText="00:00:00";
    timer.style.display="none";
}

