document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const tagCheckboxes = document.querySelectorAll('input[name="tag"]');
    const sortSelect = document.getElementById('sortOptions');
    const resetBtn = document.getElementById('resetFilters');
    const catalogContainer = document.querySelector('.catalog');
    
    // Guardar el orden original de los pines
    const originalPinCards = Array.from(document.querySelectorAll('.pin-card'));
    let currentPinCards = [...originalPinCards];
    
    // Configuración inicial
    const maxPrice = 50000;
    priceRange.max = maxPrice;
    priceRange.value = maxPrice;
    updatePriceDisplay();
    
    // Event Listeners
    priceRange.addEventListener('input', function() {
        updatePriceDisplay();
        applyFilters();
    });
    
    tagCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    sortSelect.addEventListener('change', applySorting);
    resetBtn.addEventListener('click', resetFilters);
    
    // Funciones
    function updatePriceDisplay() {
        priceValue.textContent = `Hasta $${parseInt(priceRange.value).toLocaleString()}`;
    }
    
    function applyFilters() {
        const selectedPrice = parseInt(priceRange.value);
        const selectedTags = getSelectedTags();
        
        currentPinCards = originalPinCards.filter(card => {
            const cardPrice = parseInt(card.dataset.price);
            const cardTags = card.dataset.tags.toLowerCase().split(' ');
            
            const priceMatch = cardPrice <= selectedPrice;
            const tagMatch = selectedTags.length === 0 || 
                           selectedTags.some(tag => cardTags.includes(tag));
            
            return priceMatch && tagMatch;
        });
        
        applySorting();
        renderPins();
    }
    
    function applySorting() {
        const sortOption = sortSelect.value;
        
        switch(sortOption) {
            case 'price-asc':
                currentPinCards.sort((a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price));
                break;
            case 'price-desc':
                currentPinCards.sort((a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price));
                break;
            case 'name-asc':
                currentPinCards.sort((a, b) => {
                    const nameA = a.querySelector('.pin-title').textContent.toLowerCase();
                    const nameB = b.querySelector('.pin-title').textContent.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'name-desc':
                currentPinCards.sort((a, b) => {
                    const nameA = a.querySelector('.pin-title').textContent.toLowerCase();
                    const nameB = b.querySelector('.pin-title').textContent.toLowerCase();
                    return nameB.localeCompare(nameA);
                });
                break;
            default:
                // Restaurar orden original (sin clonar para mantener referencias)
                currentPinCards = originalPinCards.filter(pin => currentPinCards.includes(pin));
        }
        
        renderPins();
    }
    
    function renderPins() {
        // Limpiar el contenedor
        catalogContainer.innerHTML = '';
        
        // Agregar los pines filtrados y ordenados
        currentPinCards.forEach(card => {
            catalogContainer.appendChild(card);
            card.style.display = 'block'; // Asegurar que estén visibles
        });
    }
    
    function getSelectedTags() {
        return Array.from(tagCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value.toLowerCase());
    }
    
    function resetFilters() {
        // Restablecer controles
        priceRange.value = maxPrice;
        updatePriceDisplay();
        tagCheckboxes.forEach(checkbox => checkbox.checked = false);
        sortSelect.value = 'default';
        
        // Restablecer filtros
        currentPinCards = [...originalPinCards];
        renderPins();
    }
    
    // Inicialización
    applyFilters();
});