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
        domain: 'localhost:3001',    // Dominio para el que se aplicará la cookie
    },
    user: {
        id: "",
        email: "",
        token:""
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

app.post('/login', (req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password)
        // Verificar si las credenciales son válidas
        if (email === admin.email && password === admin.password) {
            // Iniciar sesión
            console.log(req.session)

            req.session.user = {id: admin.userId, email: admin.email};
            // Enviar respuesta JSON indicando éxito
            console.log(req.session)
            res.json({ success: true, userId: req.session.user.id });
        } else {
            // Enviar respuesta JSON indicando fallo
            res.status(401).json({ success: false });
        }
    }
    catch(error){
        console.error(error)
        // Enviar respuesta JSON indicando fallo
        res.status(401).json({ success: false });
    }
    
});

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
// app.use('/ftp',express.static('public/ftp/0001'), serveIndex('public/ftp/0001', {icons:true}))
// app.use('/ftp/:userId', express.static('public/ftp/:userId'), serveIndex('public/', { icons: true }));

app.get('/ftp/:userId', (req, res, next) => {
    // const session = req
    // const userId = req.params.userId;
    // console.log(req.session)
    // console.log(req.params.userId)
    // // Verificar si el usuario está autenticado y tiene el mismo ID
    // if (req.session.userId && req.session.userId === userId) {
    //     // Construir la ruta de la carpeta de FTP del usuario
    //     const userFtpPath = path.join(__dirname, `ftp/${userId}`);
        
    //     // Servir contenido estático de la carpeta de FTP del usuario
    //     express.static(userFtpPath)(req, res, next);
    // } else {
    //     // Acceso no autorizado
    //     res.status(403).send('Acceso no autorizado');
    // }
    // Cargar sesión
    const session = req.session;
    console.log(session)
    // Verificar si el usuario ha iniciado sesión
    if (!session.userId) {
        // Si no ha iniciado sesión, redirigir a la ruta /login
        res.redirect('/login');
        return;
    }
    // Si ha iniciado sesión, renderizar la página FTP
    res.render(__dirname+'/ftp', { userId: session.userId });
});


app.listen(port, () => console.log(`App running on http://localhost:${port}`))