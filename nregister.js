document.getElementById('passEye').addEventListener('click', () => {
    var pass = document.getElementById("password");
    if (pass.type === "password") {
        pass.type = "text";
        document.getElementById("eye").style.display = 'none';
        document.getElementById("eyeSlash").style.display = '';
    } else {
        pass.type = "password";
        document.getElementById("eye").style.display = '';
        document.getElementById("eyeSlash").style.display = 'none';
    }
});

document.getElementById('r-passEye').addEventListener('click', () => {
    var pass = document.getElementById("repeat");
    if (pass.type === "password") {
        pass.type = "text";
        document.getElementById("r-eye").style.display = 'none';
        document.getElementById("r-eyeSlash").style.display = '';
    } else {
        pass.type = "password";
        document.getElementById("r-eye").style.display = '';
        document.getElementById("r-eyeSlash").style.display = 'none';
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
    if(repeatInput.value != passwordInput.value){
        showAlert('La contraseña debe ser igual','danger')
        document.getElementById('b-registro').disabled = true;
        document.getElementById('repeat').classList.add('error')
        
    }
    else{
        document.getElementById('b-registro').disabled = false;
        document.getElementById('repeat').classList.remove('error')
        document.getElementById('repeat').classList.add('success')
        document.getElementById('password').classList.add('success')
    }
})

document.getElementById('password').addEventListener('change',()=>{
    document.getElementById('repeat').classList.remove('error')
    document.getElementById('repeat').classList.remove('success')
    document.getElementById('password').classList.remove('success')
    document.getElementById('password').classList.remove('error')
})