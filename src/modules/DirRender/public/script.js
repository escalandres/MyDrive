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
$(document).ready(function() {
var table = $('#fileTable').DataTable({
"ordering": true,
"order": [[0, "asc"]],
"searching": true,
"lengthChange": false,
"language": {
"search": "Buscar:",
"searchPlaceholder": "Buscar en la tabla"
},
"paging": false, // Deshabilitar la paginación de DataTables
"columns": [
    { "width": "60%", "data": "name" },
    { "width": "10%", "data": "size" },
    { "width": "30%", "data": "date_modified" }
],
"columnDefs": [
    { "targets": 0, "className": "text-left" },
    { "targets": [1,2], "className": "text-center", "searchable": false }
]
});

// Manejo del doble clic en DataTables
$('#fileTable tbody').on('dblclick', 'tr', function () {
var data = table.row(this).data();
var selected = data["name"]; // Obtener el contenido de la primera columna
var currentURL = window.location.href;
var newUrl = currentURL + selected;
window.location.href = newUrl;
});

// Agregar evento de entrada de búsqueda personalizado
$('#custom-search').on('keyup', function() {
    table.search(this.value).draw();
});
});
