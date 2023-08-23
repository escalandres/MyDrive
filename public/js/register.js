
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

const reg = document.getElementById('registerForm');

reg.addEventListener('submit', async (event) => {
    event.preventDefault();
    // showLoading();
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: reg.elements.name.value,
            lastname: reg.elements.lastname.value,
            email: reg.elements.email.value,
            password: reg.elements.password.value
        })
    });
    // hideLoading();
    const data = await response.json();
    if (!data.success) {
        // Mostrar un mensaje de error si el inicio de sesión falla
        showAlert('Ocurrió un error al crear su usuario','danger');
    }else{
        window.location.href = '/mydrive'
    }
});

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

document.getElementById('repeat').addEventListener('change',()=>{
    const passwordInput = document.getElementById('password');
    const repeatInput = document.getElementById('repeat');
    console.log(repeatInput.value)
    if(repeatInput.value != passwordInput.value){
        showAlert('La contraseña es diferente','danger')
        document.getElementById('b-registro').disabled = true;
    }
    else{
        document.getElementById('b-registro').disabled = false;
    }
})