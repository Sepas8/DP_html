// Variables globales
let model, webcam, maxPredictions;
let isScanning = false;
let predictionLoop;
let lastPredictions = [];

// URL del modelo
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/oGgbu9X51/";

// Elementos del DOM
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const retryBtn = document.getElementById('retry-btn');
const scanResult = document.getElementById('scan-result');
const finalResult = document.getElementById('final-result');
const webcamContainer = document.getElementById('webcam-container');
const predictionContainer = document.getElementById('prediction-container');

// Event listeners
startBtn.addEventListener('click', init);
stopBtn.addEventListener('click', stopAndShowResult);
retryBtn.addEventListener('click', resetScanner);

function stopAndShowResult() {
    if (!isScanning) return;
    
    isScanning = false;
    window.cancelAnimationFrame(predictionLoop);
    
    if (webcam) {
        webcam.stop();
    }
    
    if (lastPredictions.length > 0) {
        // Ordenar predicciones
        lastPredictions.sort((a, b) => b.probability - a.probability);
        const bestMatch = lastPredictions[0];
        
        // Mostrar contenedor de resultados
        const resultContainer = document.getElementById('scan-result');
        const finalResult = document.getElementById('final-result');
        resultContainer.style.display = 'block';
        
        // Buscar la plantilla correspondiente al pin identificado
        const pinTemplate = document.querySelector(`.pin-info[data-pin-name="${bestMatch.className}"]`);
        
        if (pinTemplate) {
            // Clonar la plantilla para no perder la original
            const pinClone = pinTemplate.cloneNode(true);
            
            // Actualizar el porcentaje de confianza
            const confidenceBadge = pinClone.querySelector('.confidence-percent');
            confidenceBadge.textContent = (bestMatch.probability * 100).toFixed(1) + '%';
            
            // Insertar en el contenedor de resultados
            finalResult.innerHTML = '';
            finalResult.appendChild(pinClone);
        } else {
            // Si no encuentra la plantilla, mostrar mensaje básico
            finalResult.innerHTML = `
                <div class="basic-result">
                    <h3>${bestMatch.className}</h3>
                    <p>Probabilidad: ${(bestMatch.probability * 100).toFixed(1)}%</p>
                    <p>No tenemos más información sobre este pin.</p>
                    <a href="catalogo.html" class="btn">Buscar en catálogo</a>
                </div>
            `;
        }
    } else {
        finalResult.innerHTML = "<p>No se detectó ningún pin. Intenta nuevamente.</p>";
    }
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    webcamContainer.innerHTML = '<p class="camera-placeholder">Cámara detenida</p>';
}

// Inicializar el escáner
async function init() {
    if (isScanning) return;
    
    try {
        // Mostrar mensaje de carga
        finalResult.innerHTML = "Cargando modelo y cámara...";
        scanResult.classList.add("active");
        
        // Cargar el modelo
        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );
        maxPredictions = model.getTotalClasses();
        
        // Configurar la cámara
        webcam = new tmImage.Webcam(400, 400, true); // width, height, flip
        await webcam.setup();
        await webcam.play();
        
        // Limpiar contenedores
        webcamContainer.innerHTML = '';
        predictionContainer.innerHTML = '';
        
        // Agregar la cámara al contenedor
        webcamContainer.appendChild(webcam.canvas);
        
        // Cambiar estado
        isScanning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        scanResult.classList.remove("active");
        
        // Iniciar loop de predicción
        predictionLoop = window.requestAnimationFrame(loop);
        
    } catch (error) {
        console.error("Error al iniciar:", error);
        finalResult.innerHTML = "Error al iniciar la cámara. Asegúrate de dar permisos.";
        scanResult.classList.add("active");
        resetScanner();
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
    if (!isScanning || !webcam.canvas) return;
    
    try {
        const predictions = await model.predict(webcam.canvas);
        lastPredictions = predictions;
        
        // Ordenar predicciones por probabilidad
        predictions.sort((a, b) => b.probability - a.probability);
        
        // Mostrar solo la predicción principal si supera el 50%
        if (predictions[0].probability > 0.5) {
            predictionContainer.innerHTML = `
                <div class="prediction-result">
                    <strong>${predictions[0].className}</strong>: 
                    ${(predictions[0].probability * 100).toFixed(1)}% de coincidencia
                </div>
            `;
        } else {
            predictionContainer.innerHTML = "<div>Enfoca mejor el pin para identificarlo</div>";
        }
    } catch (error) {
        console.error("Error en predicción:", error);
        predictionContainer.innerHTML = "<div>Error al analizar la imagen</div>";
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
    if (lastPredictions && lastPredictions.length > 0) {
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
    
    // Actualizar UI
    startBtn.disabled = false;
    stopBtn.disabled = true;
    scanResult.classList.add("active");
    webcamContainer.innerHTML = '<p class="camera-placeholder">Cámara detenida</p>';
    predictionContainer.innerHTML = '';
}

// Reiniciar el escáner
function resetScanner() {
    isScanning = false;
    
    if (webcam) {
        webcam.stop();
    }
    
    webcamContainer.innerHTML = '<p class="camera-placeholder">La cámara aparecerá aquí</p>';
    predictionContainer.innerHTML = '';
    scanResult.classList.remove("active");
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    if (predictionLoop) {
        window.cancelAnimationFrame(predictionLoop);
    }
}
