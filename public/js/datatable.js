
        function eliminarEtiquetasI(inputString) {
            return inputString.replace(/<i[^>]*>.*?<\/i>/g, '');
        }
 // Agregar evento de entrada de búsqueda personalizado
 $('#search').on('keyup', function() {
    console.log('search', this.value)
    $('#fileTable').DataTable().search(this.value).draw();
});
        $(document).ready(function() {
            // Extiende el sistema de ordenamiento de DataTables con el tipo 'folder-first'
            $.fn.dataTable.ext.order['folder-first'] = function (settings, col) {
                return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
                    const icon = $(td).find('i').first(); // Encuentra el primer icono en la celda
                    const isFolder = icon.hasClass('folder-icon'); // Verifica si el icono es de una carpeta

                    if (isFolder) {
                        return 'a' + $(td).text(); // Las carpetas se ordenan primero
                    } else {
                        return 'b' + $(td).text(); // Otros elementos se ordenan después
                    }
                });
            };

            var table = $('#fileTable').DataTable({
                "ordering": true,
                // "order": [[0, "asc"]],
                "order": [[0, "folder-first"]],
                "searching": true,
                "lengthChange": false,
                "language": {
                "search": "Buscar:",
                "searchPlaceholder": "Buscar en la tabla"
                },
                "paging": false, // Deshabilitar la paginación de DataTables
                "columns": [
                    { "width": "70%", "data": "name" },
                    { "width": "20%", "data": "date_modified" },
                    { "width": "10%", "data": "size" }
                ],
                "columnDefs": [
                    { "targets": 0, "className": "text-left" },
                    { "targets": [1,2], "className": "text-center", "searchable": false },
                    {
                        "targets": 0, // La columna que deseas ordenar de manera personalizada
                        "type": 'folder-first' // Usa el tipo de ordenamiento personalizado 'folder-first'
                    }
                ]
            });
        });

        // Manejo del doble clic en DataTables
        $('#fileTable tbody').on('dblclick', 'tr', function () {
            var data = $('#fileTable').DataTable().row(this).data();
            var selected = data["name"]; // Obtener el contenido de la primera columna
            var currentURL = window.location.href;
            var _url = currentURL + selected;
            var newUrl = eliminarEtiquetasI(_url);
            // alert(newUrl);
            window.location.href = newUrl;
        });

        

        document.addEventListener("DOMContentLoaded", function() {
            var tbody = document.querySelector("tbody"); // Selecciona el tbody en lugar de todas las filas
            var rows = tbody.querySelectorAll("tr"); // Selecciona solo las filas dentro del tbody
            
            rows.forEach(function(row) {
                row.addEventListener("click", function() {
                    // Remover la clase 'selected-row' de todas las filas
                    rows.forEach(function(row) {
                        row.classList.remove("selected-row");
                    });
                    
                    // Agregar la clase 'selected-row' a la fila clicada
                    this.classList.add("selected-row");
                });
            });
        });
