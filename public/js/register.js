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