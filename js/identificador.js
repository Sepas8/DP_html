// Variables globales
let model, webcam, labelContainer, maxPredictions;
let isScanning = false;
let predictionLoop;
let lastPredictions = [];

// URL del modelo (reemplaza con tu modelo)
const URL = "https://teachablemachine.withgoogle.com/models/tu-modelo/";

// Elementos del DOM
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const retryBtn = document.getElementById('retry-btn');
const scanResult = document.getElementById('scan-result');
const finalResult = document.getElementById('final-result');
const webcamContainer = document.getElementById('webcam-container');
const labelsContainer = document.getElementById('label-container');

// Event listeners
startBtn.addEventListener('click', init);
stopBtn.addEventListener('click', stopAndShowResult);
retryBtn.addEventListener('click', resetScanner);

// Inicializar el escáner
async function init() {
    if (isScanning) return;
    
    try {
        // Mostrar mensaje de carga
        finalResult.innerHTML = "Cargando modelo y cámara...";
        
        // Cargar el modelo
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        // Configurar la cámara
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);
        await webcam.setup();
        await webcam.play();
        
        // Limpiar el contenedor y agregar la cámara
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        
        // Crear contenedor de etiquetas
        labelContainer = document.createElement("div");
        webcamContainer.appendChild(labelContainer);
        
        // Cambiar estado
        isScanning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        scanResult.classList.remove("active");
        labelsContainer.style.display = "none";
        
        // Iniciar loop de predicción
        predictionLoop = window.requestAnimationFrame(loop);
        
    } catch (error) {
        console.error("Error al iniciar:", error);
        finalResult.innerHTML = "Error al iniciar la cámara. Asegúrate de dar permisos.";
    }
}

// Loop de predicción
async function loop() {
    if (!isScanning) return;
    
    webcam.update();
    await predict();
    predictionLoop = window.requestAnimationFrame(loop);
}

// Realizar predicción
async function predict() {
    if (!isScanning) return;
    
    const prediction = await model.predict(webcam.canvas);
    lastPredictions = prediction;
    
    // Ordenar predicciones por probabilidad
    prediction.sort((a, b) => b.probability - a.probability);
    
    // Mostrar solo la predicción principal temporalmente
    if (prediction[0].probability > 0.5) {
        labelContainer.innerHTML = `
            <div class="prediction-main">
                <strong>${prediction[0].className}</strong>: 
                ${(prediction[0].probability * 100).toFixed(1)}% de coincidencia
            </div>
        `;
    } else {
        labelContainer.innerHTML = "<div>Enfoca un pin para identificarlo</div>";
    }
}

// Detener y mostrar resultado final
function stopAndShowResult() {
    if (!isScanning) return;
    
    // Cancelar el loop
    isScanning = false;
    window.cancelAnimationFrame(predictionLoop);
    
    // Detener la cámara
    if (webcam) {
        webcam.stop();
    }
    
    // Mostrar el mejor resultado
    if (lastPredictions.length > 0) {
        lastPredictions.sort((a, b) => b.probability - a.probability);
        const bestMatch = lastPredictions[0];
        
        finalResult.innerHTML = `
            <h3>${bestMatch.className}</h3>
            <p>Probabilidad: ${(bestMatch.probability * 100).toFixed(1)}%</p>
            <p>Descripción del pin...</p>
            <a href="catalogo.html" class="btn">Ver en catálogo</a>
        `;
    } else {
        finalResult.innerHTML = "<p>No se detectó ningún pin. Intenta nuevamente.</p>";
    }
    
    // Cambiar estado de los botones
    startBtn.disabled = false;
    stopBtn.disabled = true;
    scanResult.classList.add("active");
    webcamContainer.innerHTML = ''; // Limpiar la cámara
}

// Reiniciar el escáner
function resetScanner() {
    scanResult.classList.remove("active");
    labelsContainer.style.display = "none";
    webcamContainer.innerHTML = '';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    isScanning = false;
    
    if (webcam) {
        webcam.stop();
    }
}