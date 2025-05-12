// Datos completos de los pines
const pinsDatabase = [
    {
        id: "fray",
        nombre: "Fray",
        imagen: "images/Fray.jpg",
        categoria: "Videojuegos",
        precio: "$15000 cop",
        descripcion: "Pin oficial de Fray, famoso personaje de Futurama",
        caracteristicas: [
            "Material: Metal esmaltado",
            "Tamaño: 3cm",
            "Disponible"
        ]
    },
    {
        id: "rana fuckyou",
        nombre: "Rana Fuck You",
        imagen: "images/rana_fuck.jpg",
        categoria: "Humor",
        precio: "$18,000 cop",
        descripcion: "Pin de la famosa rana con actitud rebelde",
        caracteristicas: [
            "Material: Metal esmaltado",
            "Tamaño: 3cm",
            "Diseño irreverente"
        ]
    },
    {
        id: "rana fancy",
        nombre: "Rana Fancy",
        imagen: "images/rana_fancy.jpg",
        categoria: "Moda",
        precio: "$16,000 cop",
        descripcion: "Elegante rana con estilo sofisticado",
        caracteristicas: [
            "Material: Aleación de zinc",
            "Tamaño: 2.8cm",
            "Acabado brillante",
            "actualmente el pin no esta disponible",
            "puedes visitar el catalogo y ver más opciones"
        ]
    },
    {
        id: "deadpool",
        nombre: "Deadpool",
        imagen: "images/deadpool.jpg",
        categoria: "Superhéroes",
        precio: "$20,000 cop",
        descripcion: "El antihéroe más sarcástico de Marvel",
        caracteristicas: [
            "Material: Metal esmaltado",
            "Tamaño: 3.2cm",
            "Edición limitada",
            "actualmente el pin no esta disponible",
            "puedes visitar el catalogo y ver más opciones"
        ]
    },
    {
        id: "picachu",
        nombre: "Pikachu",
        imagen: "images/pikachu.jpg",
        categoria: "Pokémon",
        precio: "$15,000 cop",
        descripcion: "El Pokémon eléctrico más popular",
        caracteristicas: [
            "Material: Metal esmaltado",
            "Tamaño: 2.5cm",
            "Color amarillo brillante",
            "actualmente el pin no esta disponible",
            "puedes visitar el catalogo y ver más opciones"
        ]
    },
    {
        id: "stitch",
        nombre: "Stitch",
        imagen: "images/stitch.jpg",
        categoria: "Disney",
        precio: "$17,000 cop",
        descripcion: "El adorable experimento 626 de Lilo y Stitch",
        caracteristicas: [
            "Material: Aleación de zinc",
            "Tamaño: 3cm",
            "de la famosa pelicula Lilo y Stitch",
            "actualmente el pin no esta disponible",
            "puedes visitar el catalogo y ver más opciones"
        ]
    }
];

// Variables globales
let model, webcam, maxPredictions;
let isScanning = false;
let predictionLoop;
let lastPredictions = [];

// Elementos del DOM
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const retryBtn = document.getElementById('retry-btn');
const scanResult = document.getElementById('scan-result');
const finalResult = document.getElementById('final-result');
const webcamContainer = document.getElementById('webcam-container');
const predictionContainer = document.getElementById('prediction-container');

// URL del modelo
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/oGgbu9X51/";

// Normalizar texto para comparación
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
}

// Buscar pin por predicción
function findPinByPrediction(predictedName) {
    const normalizedPredicted = normalizeText(predictedName);
    
    // Primero busca coincidencia exacta
    let pin = pinsDatabase.find(p => 
        normalizeText(p.id) === normalizedPredicted || 
        normalizeText(p.nombre) === normalizedPredicted
    );
    
    // Si no encuentra, busca coincidencia parcial
    if (!pin) {
        pin = pinsDatabase.find(p => 
            normalizedPredicted.includes(normalizeText(p.id)) ||
            normalizedPredicted.includes(normalizeText(p.nombre)) ||
            normalizeText(p.nombre).includes(normalizedPredicted)
        );
    }
    
    return pin;
}

// Mostrar información del pin
function displayPinInfo(pin, probability) {
    const featuresHTML = pin.caracteristicas.map(f => `<li>${f}</li>`).join('');
    
    finalResult.innerHTML = `
        <div class="pin-result">
            <div class="pin-image-container">
                <img src="${pin.imagen}" onerror="this.parentElement.style.display='none'" 
                     alt="${pin.nombre}" class="pin-image">
                <div class="confidence-badge">${(probability * 100).toFixed(1)}%</div>
            </div>
            <div class="pin-details">
                <h3>${pin.nombre}</h3>
                <div class="pin-meta">
                    <span class="category">${pin.categoria}</span>
                    <span class="price">${pin.precio}</span>
                </div>
                <p class="description">${pin.descripcion}</p>
                <ul class="features">${featuresHTML}</ul>
                <a href="catalogo.html" class="btn">Ver en Catálogo</a>
            </div>
        </div>`;
    
    // Asegurarse de que el contenedor sea visible
    scanResult.style.display = 'block';
}

// Inicializar el escáner
async function init() {
    if (isScanning) return;
    
    try {
        // Mostrar mensaje de carga
        finalResult.innerHTML = "Cargando modelo...";
        scanResult.style.display = 'block';
        
        // Cargar el modelo
        model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        
        // Configurar la cámara
        webcam = new tmImage.Webcam(400, 400, true);
        await webcam.setup();
        await webcam.play();
        
        // Limpiar contenedores
        webcamContainer.innerHTML = '';
        predictionContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        
        // Cambiar estado
        isScanning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Iniciar loop de predicción
        predictionLoop = window.requestAnimationFrame(loop);
        
    } catch (error) {
        console.error("Error al iniciar:", error);
        finalResult.innerHTML = "Error al iniciar la cámara. Asegúrate de dar permisos.";
        scanResult.style.display = 'block';
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
        const best = predictions.reduce((prev, current) => 
            (prev.probability > current.probability) ? prev : current);
        
        predictionContainer.innerHTML = `
            <div class="prediction-result">
                <strong>${best.className}</strong>: 
                ${(best.probability * 100).toFixed(1)}% de coincidencia
            </div>`;
    } catch (error) {
        console.error("Error en predicción:", error);
        predictionContainer.innerHTML = "<div>Error al analizar la imagen</div>";
    }
}

// Detener y mostrar resultado
function stopAndShowResult() {
    if (!isScanning || !lastPredictions.length) return;
    
    isScanning = false;
    window.cancelAnimationFrame(predictionLoop);
    
    if (webcam) webcam.stop();
    
    const bestPrediction = lastPredictions.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current);
    
    console.log("Predicción encontrada:", bestPrediction.className);
    const pin = findPinByPrediction(bestPrediction.className);
    
    if (pin) {
        console.log("Pin encontrado en DB:", pin.nombre);
        displayPinInfo(pin, bestPrediction.probability);
    } else {
        console.log("No se encontró pin para:", bestPrediction.className);
        finalResult.innerHTML = `
            <div class="basic-result">
                <h3>${bestPrediction.className}</h3>
                <p>Probabilidad: ${(bestPrediction.probability * 100).toFixed(1)}%</p>
                <p>No tenemos información detallada</p>
                <a href="catalogo.html" class="btn">Buscar en catálogo</a>
            </div>`;
        scanResult.style.display = 'block';
    }
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Reiniciar escáner
function resetScanner() {
    isScanning = false;
    if (webcam) webcam.stop();
    if (predictionLoop) cancelAnimationFrame(predictionLoop);
    
    webcamContainer.innerHTML = '<p class="camera-placeholder">La cámara aparecerá aquí</p>';
    predictionContainer.innerHTML = '';
    scanResult.style.display = 'none';
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Event listeners
startBtn.addEventListener('click', init);
stopBtn.addEventListener('click', stopAndShowResult);
retryBtn.addEventListener('click', resetScanner);