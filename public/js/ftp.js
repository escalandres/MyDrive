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
        handleFiles(files);
      });
      fileInput.click();
    });

    function handleFiles(files) {
        uploadFiles(files)
    //   for (const file of files) {
    //     console.log('File:', file.name);
    //     showAlert(`¡El archivo ${file.name} ha sido guardado con éxito!`, "success");
    //     // Aquí puedes realizar las acciones que necesites con cada archivo, como subirlo o procesarlo.
    //   }
    }
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
      function uploadFiles(files) {
        const formData = new FormData();
    
        for (const file of files) {
            formData.append('file', file);
        }
    
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