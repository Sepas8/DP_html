// Funcionalidad común para todas las páginas

// Manejar el envío del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí podrías agregar código para enviar el formulario
            alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
            contactForm.reset();
        });
    }

    // Manejar botones "Añadir al carrito" en el catálogo
    const addToCartButtons = document.querySelectorAll('.btn');
    addToCartButtons.forEach(button => {
        if (button.textContent === 'Añadir al carrito') {
            button.addEventListener('click', function() {
                const pinTitle = this.closest('.pin-info').querySelector('.pin-title').textContent;
                alert(`Has añadido "${pinTitle}" a tu carrito.`);
            });
        }
    });
});