const express = require('express')
const session = require('express-session');
const serveIndex = require('serve-index')
const path = require('path')
const fs = require('fs');
const handlebars = require('handlebars');
require('dotenv').config(); 
const app = express();
const port = 3001;
const admin = {
    email: "admin@admin.com",
    password: "password",
    userId: "0001"
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
    console.log('url',req.url)
    if (req.url.startsWith("/mydrive")) {
      // Verificar si el usuario no está autenticado
      if (!req.session || !req.session.user) {
        console.log('sesion',req.session)
        console.log('Usuario no autenticado. Redirigiendo a /login');
        return res.redirect('/login');
      }
    }
    
    next();
};
  

  
//   // Middleware de redirección a '/ftp/:userId'
// const redirectToUserFtp = (req, res, next) => {
//     if (req.url === '/mydrive') {
//       // Redirige a '/ftp/:userId' si el usuario está autenticado
//         return res.redirect(`/ftp/${req.session.user.id}`);
//     }
//     next();
// };
  
// Middleware para manejar rutas no encontradas
const handleNotFound = (req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views/error.html'));
};

// Aplicar los middlewares en orden
app.use(express.static(path.join(__dirname, 'public')));
app.use(authenticationMiddleware);
// app.use(redirectToUserFtp);

app.get('/', (req, res) => {
    if (!req.session.user) {
        // Redirigir solo si el usuario no está autenticado
        return res.redirect('/login');
    }

    // Si hay una sesión de usuario iniciada, redirige a la ruta /ftp/:userId
    res.redirect(`/mydrive`);
});


app.get('/login', (req,res)=>{
    console.log(req.url)
    res.sendFile(path.join(__dirname, 'views/login.html'))
})


app.post('/login', (req, res) => {
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


// // Definir middleware para servir archivos estáticos
// app.use('/mydrive', (req, res, next) => {
//     console.log('servir drive')
//     console.log(req.session)
//     // Construir la ruta de la carpeta de FTP del usuario
//     const userFtpPath = path.join(__dirname, `ftp/${req.session.user.id}`);
//     console.log('userFtpPath',userFtpPath)
//     // Verificar si la ruta existe (carpeta de FTP del usuario)
//     if (fs.existsSync(userFtpPath)) {
//         // Servir contenido estático de la carpeta de FTP del usuario
//         express.static(userFtpPath)(req, res, next);
//     } else {
//         // Carpeta no encontrada
//         res.status(404).send('Carpeta no encontrada');
//     }
    
// });

// app.use('/mydrive', serveIndex(path.join(__dirname, 'ftp'), { 
//     icons: true,
//     stylesheet: './public/css/ftp.css'
// }));

// Definir middleware para servir el índice de la carpeta
// app.use('/ftp', serveIndex(path.join(__dirname, 'ftp'), { 
//     icons: true
// }));

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
    stylesheet: './public/css/ftp.css'
}));


app.use(handleNotFound);

app.listen(port, () => console.log(`App running on http://localhost:${port}`))