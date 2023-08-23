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



const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.border = '2px dashed #666';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

dropZone.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
        uploadFiles(files);
    });
    fileInput.click();
});

function uploadFiles(files) {
    const formData = new FormData();

    for (const file of files) {
        formData.append('file', file);
    }
    closeModal();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3001/upload', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Archivos subidos con éxito');
            showAlert('Archivos subidos con éxito','success')
            window.location.href = "/mydrive"
        } else {
            console.error('Error al subir archivos');
            showAlert('Ocurrió un error al subir los archivos','danger')
        }
    };

    xhr.send(formData);
}

// Función para cerrar el modal
function closeModal() {
    const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
    closeButton.click();
}

document.getElementById('logoutBtn').addEventListener('click',()=>{
    Swal.fire({
        title: '¿Quieres cerrar sesión?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cerrar sesión'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar una solicitud POST a '/logout'
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Aquí puedes agregar más encabezados según sea necesario
                },
              // Puedes enviar datos en el cuerpo de la solicitud si es necesario
              // body: JSON.stringify({ key: value })
            })
            .then(response => response.json())
            .then(data => {
                // Manejar la respuesta de la solicitud, si es necesario
                Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Cerrando sesión...',
                showConfirmButton: false,
                timer: 1500
                })
                window.location.href = "/"
            })
            .catch(error => {
              // Manejar errores, si los hay
                console.error('Error:', error);
                Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                })
            });
        }
    });
})

document.getElementById('createFolderBtn').addEventListener('click',()=>{
    // Supongamos que estás ejecutando esto en un navegador web

    // Datos para la solicitud POST
    const folderName = document.getElementById('folderName').value; // Reemplaza con el nombre de la carpeta que deseas crear
    alert(folderName)
    // Objeto FormData para enviar el nombre de la carpeta
    // Configuración de la solicitud POST
    const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({folderName: folderName}),
    };

    // Realizar la solicitud POST
    fetch('/create-folder', requestOptions)
    .then(response => response.json())
    .then(data => {
        console.log(data); // Mensaje de respuesta del servidor
        if(data.success){
            showAlert('Se ha creado la carpeta','success')
            window.location.href = "/mydrive"
        }
        else{
            showAlert('Ocurrió un error al crear la carpeta','danger')
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Ocurrió un error al crear la carpeta','danger')
    });

})