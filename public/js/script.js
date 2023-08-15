document.addEventListener("DOMContentLoaded", function() {
    // Código a ejecutar cuando el DOM ha sido cargado completamente
    // mostrarPanel();
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;

    // if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    //     themeToggle.click();
    // }
});

// Función para mostrar el panel
function showLoading() {
    panel.style.display = "";
}

// Función para ocultar el panel
function hideLoading() {
    panel.style.display = "none";
}

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto
    showLoading();
    // Obtener los datos del formulario
    const form = event.target;
    // const url = form.elements.videoUrl.value;
    // toast(url)
    const data = {
        email: form.elements.email.value,
        password: form.elements.password.value
    }
    console.log(JSON.stringify(data))
    // Realizar la solicitud POST
    fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: form.elements.email.value,
            password: form.elements.password.value})
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta:', data);
        hideLoading()
        // if(data.estatus){
        //     // Hacer algo con la respuesta recibida
        //     document.getElementById('downloadBtn').disabled = false;
        //     document.getElementById('option1').checked = true;
        //     document.getElementById('options-container').style.display = '';
        //     document.getElementById('audio-options-container').style.display = '';
        //     document.getElementById('video-options-container').style.display = '';
        // }
        // toast(data.message);
    })
    .catch(error => {
        hideLoading()
        console.log(error)
        console.error('Error al hacer la solicitud POST: ' + error);
        // Manejar el error
        // toast(error);
    });
});