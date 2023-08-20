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


const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoading();
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: form.elements.email.value,
            password: form.elements.password.value
        })
    });
    hideLoading();
    const data = await response.json();
    if (!data.success) {
        // Mostrar un mensaje de error si el inicio de sesión falla
        alert('Inicio de sesión fallido');
    }else{
        window.location.href = '/mydrive'
    }
});

function mostrarContrasena(){
    var pass = document.getElementById("password");
    if(pass.type == "password"){
        pass.type = "text";
    }else{
        pass.type = "password";
    }
}
function mostrarRepeat(){
    var tipo = document.getElementById("repeat");
    if(tipo.type == "password"){
        tipo.type = "text";
    }else{
        tipo.type = "password";
    }
}