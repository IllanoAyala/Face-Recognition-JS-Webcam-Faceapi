const video = document.getElementById("video");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

video.addEventListener("play", async () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  const geral = document.getElementById("geral")
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender(); 

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const expressions = detection.expressions;
      const age = detection.age;
      const gender = detection.gender;

      const drawBox = new faceapi.draw.DrawBox(box, { boxColor: 'red' });
      drawBox.draw(canvas);

      const expressaoFacial = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
      
      geral.textContent = `${expressaoFacial}, ${Math.round(age)}, ${gender}`
      // console.log("Expressão facial predominante:", expressaoFacial);
      // console.log("Idade:", Math.round(age)); 
      // console.log("Gênero:", gender);
    });

    console.log(resizedDetections.length);
  }, 100);
});
