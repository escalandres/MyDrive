function showAlert(message, type) {
    const alertsContainer = document.getElementById('alerts-container');

    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertDiv.role = 'alert';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertsContainer.appendChild(alertDiv);

    // Cierra automáticamente la alerta después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Función para mostrar el panel
function showLoading() {
    panel.style.display = "";
}

// Función para ocultar el panel
function hideLoading() {
    panel.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
    // Código a ejecutar cuando el DOM ha sido cargado completamente
    // mostrarPanel();
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;

    // if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    //     themeToggle.click();
    // }
});

function SendAlert(message, type){
    let bg = ""
    if(type === "success") bg = "linear-gradient(to right, #2ECC71, #27AE60)"
    else if(type === "error") bg = "linear-gradient(to right, #FF5733, #E74C3C)"
    else if(type === "info") bg = "linear-gradient(to right, #2c79ec, #3983f1)"
    else bg = "linear-gradient(to right, #2c79ec, #3983f1)"
    Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: bg,
        },
        onClick: function(){} // Callback after click
      }).showToast();
}