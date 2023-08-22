const express = require('express')
const session = require('express-session');
const serveIndex = require('serve-index')
const path = require('path')
const fs = require('fs');
const fc = require('fs').promises;
const handlebars = require('handlebars');
const upload = require('./upload');
require('dotenv').config(); 
const app = express();
const port = 3001;
const database = [
    { email: "admin@admin.com", password: "password", userId: "0001" },
    { email: "test@test.com", password: "1234567890", userId: "0002" },
    { email: "prueba@prueba.com", password: "holamundo", userId: "0003" },
    { email: "user@user.com", password: "usuario", userId: "0004" },
]

function findUser(email) {
    return database.find(item => item.email === email);
  }


// Configuración de express-session
app.use(session({
    secret: process.env.KEY, // Cambia esto a una clave secreta fuerte en producción
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 1000 * 60 * 15, // 15 minutos (en milisegundos)
    //     secure: false,             // Solo se envía la cookie en conexiones seguras (HTTPS)
    //     httpOnly: true,           // La cookie solo es accesible por el servidor (no por JavaScript en el navegador)
    //     sameSite: 'strict',       // Controla cómo se envía la cookie en las solicitudes del mismo sitio
    //     path: '/',                // Ruta base donde se aplica la cookie
    //     domain: 'localhost:3001',    // Dominio para el que se aplicará la cookie
    // },
}));

//settings
app.use(express.json());
app.use(express.urlencoded({extended: false}));


//Middlewares
const authenticationMiddleware = (req, res, next) => {
    if (req.url.startsWith("/mydrive")) {
      // Verificar si el usuario no está autenticado
    if (!req.session || !req.session.user) {
        console.log('Usuario no autenticado. Redirigiendo a /login');
        return res.redirect('/login');
    }
    }
    next();
};

// Middleware para manejar rutas no encontradas
const handleNotFound = (req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views/error.html'));
};

// Aplicar los middlewares en orden
app.use(express.static(path.join(__dirname, 'public')));
app.use(authenticationMiddleware);

app.get('/', (req, res) => {
    if (!req.session.user) {
        // Redirigir solo si el usuario no está autenticado
        return res.redirect('/login');
    }

    // Si hay una sesión de usuario iniciada, redirige a la ruta /ftp/:userId
    res.redirect(`/mydrive`);
});

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, 'views/login.html'))
})

app.post('/login', (req, res) => {
    console.log('iniciar login');
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password);
        const result = findUser(email)
        console.log('result', result)
        // Verificar si las credenciales son válidas
        if (email === result.email && password === result.password) {
            if (req.session) {
                // Actualizar la sesión existente con la información del usuario
                console.log('si')
                req.session.user = { id: result.userId, email: result.email };
            } else {
                // Si no existe una sesión, crear una nueva
                console.log('no')
                req.session = { user: { id: result.userId, email: result.email } };
            }
            
            console.log(req.session);
            //return res.redirect('/mydrive');
            res.status(200).json({ success: true });
        } else {
            // Enviar respuesta JSON indicando fallo
            res.status(401).json({ success: false });
        }
    } catch (error) {
        console.error(error);
        // Enviar respuesta JSON indicando fallo
        res.status(401).json({ success: false });
    }
});

app.get('/register', (req,res)=>{
    console.log(req.url)
    res.sendFile(path.join(__dirname, 'views/register.html'))
})

app.post('/register', (req, res) => {
    console.log('iniciar login');
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password);
        
        // Verificar si las credenciales son válidas
        if (email === admin.email && password === admin.password) {
            if (req.session) {
                // Actualizar la sesión existente con la información del usuario
                console.log('si')
                req.session.user = { id: admin.userId, email: admin.email };
            } else {
                // Si no existe una sesión, crear una nueva
                console.log('no')
                req.session = { user: { id: admin.userId, email: admin.email } };
            }
            
            console.log(req.session);
            //return res.redirect('/mydrive');
            res.status(200).json({ success: true });
        } else {
            // Enviar respuesta JSON indicando fallo
            res.status(401).json({ success: false });
        }
    } catch (error) {
        console.error(error);
        // Enviar respuesta JSON indicando fallo
        res.status(401).json({ success: false });
    }
});

app.get('/logout', (req, res) => {
    // Destruir la sesión y redirigir a la página de inicio de sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
        }
        res.redirect('/login');
    });
});

app.use('/mydrive', (req, res, next) => {
    if (req.session && req.session.user) {
        const userId = req.session.user.id;
        const userFtpPath = path.join(__dirname, `ftp/${userId}`);
        
        // Verifica si la carpeta de FTP del usuario existe
        if (fs.existsSync(userFtpPath)) {
            // Servir contenido estático de la carpeta de FTP del usuario
            express.static(userFtpPath)(req, res, next);
        } else {
            // Carpeta no encontrada
            res.status(404).send('Carpeta no encontrada');
        }
    } else {
        // Usuario no autenticado
        res.status(401).redirect('/login');
    }
});

app.use('/mydrive', (req, res, next) => {
    if (req.session && req.session.user) {
        const userId = req.session.user.id;
        const userFtpPath = path.join(__dirname, `ftp/${userId}`);
        
        // Redirigir la solicitud a la carpeta del usuario
        req.url = `/${userId}${req.url}`;
        next();
    } else {
        // Usuario no autenticado
        res.status(401).redirect('/login');
    }
}, serveIndex(path.join(__dirname, 'ftp'), {
    icons: true,
    stylesheet: './public/css/ftp.css',
    template: './test.html'
})); 

// async function generatePageContent(userId) {
//     try {
//         const userFtpPath = path.join(__dirname, `ftp/${userId}`);
//         const files = await fc.readdir(userFtpPath);

//         // Generar el contenido HTML con la lista de archivos
//         let fileList = '';
//         files.forEach(file => {
//             fileList += `<li><a href="/mydrive/${userId}/${file}">${file}</a></li>`;
//         });

//         const pageContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <!-- Agrega tus encabezados de estilo y metadatos aquí -->
//             </head>
//             <body>
//                 <h1>Archivos en tu carpeta de usuario</h1>
//                 <ul>${fileList}</ul>
//                 <!-- Agrega otros elementos HTML según sea necesario -->
//             </body>
//             </html>
//         `;

//         return pageContent;
//     } catch (error) {
//         console.error('Error al generar el contenido de la página:', error);
//         return '';
//     }
// }

// app.get('/mydrive', (req, res) => {
//     if (req.session && req.session.user) {
//         const userId = req.session.user.id;

//         generatePageContent(userId)
//             .then(pageContent => {
//                 res.send(pageContent);
//             })
//             .catch(error => {
//                 res.status(500).send('Error al generar la página');
//             });
//     } else {
//         res.status(401).redirect('/login');
//     }
// });




// Middleware personalizado para agregar req.session.user.id al cuerpo de la solicitud
app.use('/upload', (req, res, next) => {
    console.log('/middlewar',req.session)
    req.userId = req.session.user.id;
    console.log('req.',req.userId)
    next();
});

  // Configura la ruta para manejar las subidas de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('/upload');
    // Handle the uploaded file
    res.json({ message: 'File uploaded successfully!' });
});

app.use(handleNotFound);

app.listen(port, () => console.log(`App running on http://localhost:${port}`))