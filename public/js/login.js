
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
        // alert(data.message);
        Toastify({
            text: "El usuario y/o contraseña no es válido",
            duration: 3000,
            destination: "https://github.com/apvarun/toastify-js",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #FF5733, #E74C3C)",
            },
            onClick: function(){} // Callback after click
          }).showToast();
    }else{
        window.location.href = '/mydrive'
    }
});