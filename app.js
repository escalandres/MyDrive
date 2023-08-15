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
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 15, // 15 minutos (en milisegundos)
        secure: false,             // Solo se envía la cookie en conexiones seguras (HTTPS)
        httpOnly: true,           // La cookie solo es accesible por el servidor (no por JavaScript en el navegador)
        sameSite: 'strict',       // Controla cómo se envía la cookie en las solicitudes del mismo sitio
        path: '/',                // Ruta base donde se aplica la cookie
        domain: 'example.com',    // Dominio para el que se aplicará la cookie
    }
}));
  app.use(express.static(path.join(__dirname, 'public')));
// Configura tu middleware para manejar rutas no existentes
// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, 'views/error.html'));
//     //console.log('error')
//     //res.redirect('/error')
// });


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    if (!req.session || !req.session.userId) {
        // Redirigir solo aquí, sin enviar otra respuesta
        return res.redirect('/login');
    }

    // Si hay una sesión de usuario iniciada, redirige a la ruta /ftp/:userId
    res.redirect(`/ftp/${req.session.userId}`);
});

app.use(express.json()); // Agrega esta línea para manejar JSON en el cuerpo de la solicitud

app.post('/login', (req,res)=>{
    // console.log(req.body)
    const user = {
        email: req.body.email,
        password: req.body.password,
        userId: ""
    }
    //Buscar en base de datos
    if(user.email == admin.email && user.password == admin.password){
        user.userId = admin.userId
        req.session.email = user.email
        req.session.password = user.password
        req.session.userId = user.userId
        console.log(user.userId)
        res.redirect(`/ftp/${user.userId}`);
    }
})

app.get('/login', (req,res)=>{
    console.log('login')
    res.sendFile(path.join(__dirname, 'views/login.html'))
})

app.get('/logout', (req, res) => {
    // Destruir la sesión y redirigir a la página de inicio de sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
        }
        res.redirect('/login');
    });
});




app.get('/error', (req,res)=>{
    res.sendFile(path.join(__dirname, 'views/error.html'))
})

// // Middleware para manejar la carpeta de FTP
// app.use('/ftp/:userId', (req, res, next) => {
//     const userId = req.params.userId;
//     console.log(userId)
//     if (!userId) {
//         // Si userId es nulo, redirigir a la página de inicio de sesión
//         return res.redirect('/login'); // Usar return para evitar que se envíe otra respuesta
//     }

//     const userFtpPath = path.join(__dirname, 'public/ftp', userId);

//     fs.access(userFtpPath, fs.constants.R_OK, (err) => {
//         if (err) {
//             // Si la carpeta no existe o no se puede acceder, enviar un error 404
//             res.status(404).send('Carpeta no encontrada');
//         } else {
//             next();
//         }
//     });
// });

// app.use('/ftp',express.static('public/ftp/0001'), serveIndex('public/ftp/0001', {icons:true}))
app.use('/ftp/:userId', express.static('public/ftp/:userId'), serveIndex('public/', { icons: true }));

app.listen(port, () => console.log(`App running on http://localhost:${port}`))