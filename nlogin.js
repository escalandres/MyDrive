
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
