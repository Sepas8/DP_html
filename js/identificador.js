// Identificador de pines con Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/oGgbu9X51/";

let model, webcam, labelContainer, maxPredictions;

// Cargar el modelo de imagen y configurar la webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Cargar el modelo y metadatos
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configurar la webcam
    const flip = true; // si voltear la webcam
    webcam = new tmImage.Webcam(400, 400, flip); // ancho, alto, voltear
    await webcam.setup(); // solicitar acceso a la webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Añadir elementos al DOM
    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = ''; // Limpiar contenedor
    webcamContainer.appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ''; // Limpiar contenedor
    
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // actualizar el frame de la webcam
    await predict();
    window.requestAnimationFrame(loop);
}

// Ejecutar la imagen de la webcam a través del modelo de imagen
async function predict() {
    // predict puede tomar una imagen, video o elemento canvas
    const prediction = await model.predict(webcam.canvas);
    
    // Ordenar predicciones por probabilidad (de mayor a menor)
    prediction.sort((a, b) => b.probability - a.probability);
    
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `
            <strong>${prediction[i].className}</strong>: 
            ${(prediction[i].probability * 100).toFixed(2)}% de coincidencia
        `;
        labelContainer.childNodes[i].innerHTML = classPrediction;
        
        // Resaltar la predicción con mayor probabilidad
        if (i === 0 && prediction[i].probability > 0.5) {
            labelContainer.childNodes[i].style.backgroundColor = "#27ae60";
        } else {
            labelContainer.childNodes[i].style.backgroundColor = "#f39c12";
        }
    }
}