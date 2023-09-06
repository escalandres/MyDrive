const fs = require('fs');
const path = require('path');

var icons = {
    // base icons
    'default': 'unknown-icon',
    'folder': 'folder-icon',

    // tipos de archivo de imagen
    '.jpg': 'img-icon',
    '.jpeg': 'img-icon',
    '.png': 'img-icon',
    '.gif': 'gif-icon',
    '.bmp': 'img-icon',
    '.tiff': 'img-icon',
    '.svg': 'svg-icon',
    '.webp': 'img-icon',

    // tipos de archivo de audio
    '.mp3': 'audio-icon',
    '.m4a': 'audio-icon',
    '.wav': 'audio-icon',
    '.flac': 'audio-icon',

    // tipos de archivo de video
    '.mp4': 'video-icon',
    '.avi': 'video-icon',
    '.mov': 'video-icon',
    '.mkv': 'video-icon',

    // tipos de archivo de programación
    '.js': 'js-icon',
    '.json': 'code-icon',
    '.css': 'css-icon',
    '.html': 'html-icon',
    '.php': 'code-icon',
    '.py': 'code-icon',
    '.java': 'code-icon',
    '.cpp': 'code-icon',
    '.cs': 'code-icon',
    '.rb': 'code-icon',
    '.pl': 'code-icon',
    '.sh': 'code-icon',
    '.sql': 'sql-icon',
    '.c': 'code-icon',
    '.scss': 'code-icon',

    // otros tipos de archivo comunes
    '.doc': 'word-icon',
    '.docx': 'word-icon',
    '.pdf': 'pdf-icon',
    '.postscript': 'svg-icon',
    '.rtf': 'word-icon',
    '.xls': 'excel-icon',
    '.xlsx': 'excel-icon',
    '.ppt': 'ppt-icon',
    '.pptx': 'ppt-icon',
    '.7z': 'compressed-icon',
    '.tar': 'compressed-icon',
    '.xz': 'compressed-icon',
    '.zip': 'compressed-icon',
    '.rar': 'compressed-icon',
    '.xml': 'xml-icon',
    '.txt': 'txt-icon',
    // tipos de archivo de fuente de texto
    '.ttf': 'font-icon',
    '.otf': 'font-icon',
    '.woff': 'font-icon',
    '.woff2': 'font-icon',

    // specific mime type icons
    '.rtf': 'word-icon',

    // other, extension-specific icons
    '.accdb': 'database-icon',
    '.apk': 'apk-icon',
    '.app': 'unknown-icon',
    '.as': 'page_white_actionscript-icon',
    '.asp': 'code-icon',
    '.aspx': 'code-icon',
    '.bat': 'terminal-icon',
    '.bz2': 'compressed-icon',

    '.cab': 'compressed-icon',
    '.cfm': 'code-icon',
    '.clj': 'code-icon',
    '.cc': 'code-icon',
    '.cgi': 'terminal-icon',
    '.db': 'database-icon',
    '.dbf': 'database-icon',
    '.deb': 'compressed-icon',
    '.dll': 'gear-icon',
    '.dmg': 'drive-icon',
    '.erb': 'code-icon',
    '.exe': 'exe-icon',
    '.fnt': 'font-icon',
    '.gam': 'controller-icon',
    '.gz': 'compressed-icon',
    '.h': 'code-icon',
    '.ini': 'gear-icon',
    '.iso': 'cd-icon',
    '.jar': 'compressed-icon',
    '.jsp': 'code-icon',
    '.lua': 'code-icon',
    '.lz': 'compressed-icon',
    '.lzma': 'compressed-icon',
    '.m': 'code-icon',
    '.map': 'map-icon',
    '.msi': 'compressed-icon',
    '.otf': 'font-icon',
    '.pdb': 'database-icon',
    '.php': 'code-icon',
    '.pl': 'code-icon',
    '.pkg': 'compressed-icon',
    '.psd': 'img-icon',
    '.py': 'code-icon',
    '.rb': 'code-icon',
    '.rm': 'video-icon',
    '.rom': 'controller-icon',
    '.rpm': 'compressed-icon',
    '.sass': 'code-icon',
    '.sav': 'controller-icon',

    '.srt': 'txt-icon',
    '.tbz2': 'compressed-icon',
    '.tgz': 'compressed-icon',
    '.tlz': 'compressed-icon',
    '.vb': 'code-icon',
    '.vbs': 'code-icon',
    '.xcf': 'img-icon',
    '.yaws': 'code-icon'
};

function getFileIcon(fileExtension) {

    if(fileExtension === "") return 'folder-icon'
    // Busca el tipo de archivo en el objeto icons
    const fileType = icons[fileExtension];

    // Si se encuentra el tipo de archivo, devuelve su nombre de clase
    if (fileType) {
        return fileType;
    } else {
        // Si no se encuentra, devuelve 'unknown-icon' por defecto
        return 'unknown-icon';
    }
}

var iconClassSvg = {
    ".android-icon": path.join(__dirname,'icons','android.svg'),
    ".apk-icon": path.join(__dirname,'icons','apk.svg'),
    
    ".audio-icon": path.join(__dirname,'icons','audio.svg'),
    ".code-icon": path.join(__dirname,'icons','code.svg'),
    ".compressed-icon": path.join(__dirname,'icons','compressed.svg'),
    ".css-icon": path.join(__dirname,'icons','css.svg'),
    ".csv-icon": path.join(__dirname,'icons','csv.svg'),
    ".excel-icon": path.join(__dirname,'icons','excel.svg'),
    ".exe-icon": path.join(__dirname,'icons','exe.svg'),
    ".folder-icon": path.join(__dirname,'icons','folder.svg'),
    ".gif-icon": path.join(__dirname,'icons','gif2.svg'),
    ".html-icon": path.join(__dirname,'icons','html.svg'),
    ".img-icon": path.join(__dirname,'icons','img.svg'),
    ".js-icon": path.join(__dirname,'icons','js.svg'),
    ".music-icon": path.join(__dirname,'icons','music.svg'),
    ".pdf-icon": path.join(__dirname,'icons','pdf-light.svg'),
    ".ppt-icon": path.join(__dirname,'icons','ppt.svg'),
    ".python-icon": path.join(__dirname,'icons','python.svg'),
    ".ppt-icon": path.join(__dirname,'icons','ppt.svg'),
    ".python-icon": path.join(__dirname,'icons','python.svg'),
    ".svg-icon": path.join(__dirname,'icons','svg.svg'),
    ".txt-icon": path.join(__dirname,'icons','txt.svg'),
    ".unknown-icon": path.join(__dirname,'icons','unknown.svg'),
    ".video-icon": path.join(__dirname,'icons','video.svg'),
    ".word-icon": path.join(__dirname,'icons','word.svg'),
    ".xml-icon": path.join(__dirname,'icons','xml.svg'),
    ".zip-icon": path.join(__dirname,'icons','zip.svg'),
}

function generateIconClasses(){
    // Lee el archivo CSS
    const archivo = path.join(__dirname,'public','template.css')
    fs.readFile(archivo, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        for (var clase in iconClassSvg) {
            if (iconClassSvg.hasOwnProperty(clase)) {
                var svg = iconClassSvg[clase];
                // console.log(clase,svg)
                // Busca la clase que deseas modificar
                let css = data.replace(`${clase} {`, `${clase} {\n  background-image: url('${svg}');\n`);

                // Escribe los cambios en el archivo CSS
                fs.writeFile(archivo, css, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            }
        }
    });
    // printCss(archivo)
}


module.exports = {
    getFileIcon,
    generateIconClasses
};