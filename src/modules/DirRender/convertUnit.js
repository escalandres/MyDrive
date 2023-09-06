function convertFileSize(fileSizeInBytes) {
    // console.log(fileSizeInBytes)
    if(fileSizeInBytes === ""){
        return "------";
    }
    else{
        if (fileSizeInBytes < 1024) {
            return fileSizeInBytes + " B";
        } else if (fileSizeInBytes < 1024 * 1024) {
            return (fileSizeInBytes / 1024).toFixed(2) + " kB";
        } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
            return (fileSizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
        } else {
            return (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        }
    }
}

function convertFileDate(fechaEnFormatoPersonalizado) {
    const meses = [
        "ene", "feb", "mar", "abr", "may", "jun",
        "jul", "ago", "sep", "oct", "nov", "dic"
    ];

    const partes = fechaEnFormatoPersonalizado.split(' ');
    if (partes.length === 2) {
        const [fecha, hora] = partes;
        const [dia, mes, año] = fecha.split('/');
        const fechaActual = new Date();
        const fechaFormateada = new Date(`${mes} ${dia}, ${año} ${hora}`);

        if (isNaN(fechaFormateada.getTime())) {
            return "Fecha inválida";
        }

        const esMismaFecha = fechaActual.toDateString() === fechaFormateada.toDateString();
        
        if (esMismaFecha) {
            // Si es la misma fecha que la actual, mostrar también la hora
            const horaFormateada = fechaFormateada.toLocaleTimeString();
            return `${dia} ${meses[parseInt(mes) - 1]} ${año} ${horaFormateada}`;
        } else {
            return `${dia} ${meses[parseInt(mes) - 1]} ${año}`;
        }
    } else {
        return "------";
    }
}

module.exports = {
    convertFileSize,
    convertFileDate
};

