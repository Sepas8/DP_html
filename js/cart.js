document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const cartIcon = document.querySelector('.cart-icon-container');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Carrito en memoria
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Abrir modal del carrito
    cartIcon.addEventListener('click', function() {
        cartModal.style.display = 'block';
        renderCart();
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // Añadir al carrito (debes llamar esta función cuando se haga clic en "Añadir al carrito")
    function addToCart(pinCard) {
        const pinId = pinCard.dataset.id || Date.now().toString();
        const pinTitle = pinCard.querySelector('.pin-title').textContent;
        const pinPrice = parseFloat(pinCard.dataset.price);
        const pinImage = pinCard.querySelector('.pin-image').src;
        
        const existingItem = cart.find(item => item.id === pinId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: pinId,
                title: pinTitle,
                price: pinPrice,
                image: pinImage,
                quantity: 1
            });
        }
        
        updateCart();
        showAddToCartFeedback();
    }
    
    // Mostrar feedback visual al añadir al carrito
    function showAddToCartFeedback() {
        const feedback = document.createElement('div');
        feedback.textContent = '¡Añadido al carrito!';
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = '#27ae60';
        feedback.style.color = 'white';
        feedback.style.padding = '10px 20px';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '1000';
        feedback.style.animation = 'fadeInOut 2s ease-in-out';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
    
    // Renderizar el carrito
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            cartTotal.textContent = '$0.00';
            return;
        }
        
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                removeFromCart(itemId);
            });
        });
    }
    
    // Eliminar del carrito
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart();
    }
    
    // Actualizar el carrito (contador y almacenamiento)
    function updateCart() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
    
    // Procesar compra
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        alert('¡Gracias por tu compra! Total: ' + cartTotal.textContent);
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
    });
    
    // Inicializar carrito
    updateCart();
    
    // Añadir este script a los botones "Añadir al carrito"
    document.querySelectorAll('.pin-card .btn').forEach(button => {
        button.addEventListener('click', function() {
            const pinCard = this.closest('.pin-card');
            addToCart(pinCard);
        });
    });
    
    // Añadir animación al CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(20px); }
        }
    `;
    document.head.appendChild(style);
});