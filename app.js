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

//settings
app.use(express.json());
app.use(express.urlencoded({extended: false}));



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
//app.use(express.static(path.join(__dirname, 'public')));
// Configura tu middleware para manejar rutas no existentes
// app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, 'views/error.html'));
//     //console.log('error')
//     //res.redirect('/error')
// });


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    console.log('/')
    console.log(req.session)
    if (!req.session || !req.session.user) {
        // Redirigir solo aquí, sin enviar otra respuesta
        console.log('no hay sesion')
        return res.redirect('/login');
    }

    // Si hay una sesión de usuario iniciada, redirige a la ruta /ftp/:userId
    res.redirect(`/ftp/${req.session.user.id}`);
});


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
            // res.redirect('/prueba')
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

app.get('/prueba',(req,res)=>{
    console.log('prueba')
    const sesion = req.session
    console.log(sesion)
    console.log('----------------------------------------------------------------')
    res.send('hola')
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
// app.use('/ftp',express.static('public/ftp/0001'), serveIndex('public/ftp/0001', {icons:true}))
// app.use('/ftp/:userId', express.static('public/ftp/:userId'), serveIndex('public/ftp/:userId', { icons: true }));

// app.get('/ftp/:userId', (req, res, next) => {
//     const userId = req.params.userId;
//     console.log(req.session)
//     console.log(req.params.userId)
//     // Verificar si el usuario está autenticado y tiene el mismo ID
//     if (req.session.user && req.session.user.id === userId) {
//         // Construir la ruta de la carpeta de FTP del usuario
//         const userFtpPath = path.join(__dirname, `ftp/${userId}`);
        
//         // Servir contenido estático de la carpeta de FTP del usuario
//         express.static(userFtpPath)(req, res, next);
//     } else {
//         // Acceso no autorizado
//         res.status(403).send('Acceso no autorizado');
//     }
//     // Cargar sesión
//     // const session = req.session;
//     // console.log('FTP')
//     // console.log(session)
//     // // Verificar si el usuario ha iniciado sesión
//     // if (!session.user.id) {
//     //     // Si no ha iniciado sesión, redirigir a la ruta /login
//     //     res.redirect('/login');
//     //     return;
//     // }
//     // // Si ha iniciado sesión, renderizar la página FTP
//     // res.render(__dirname+'/ftp', { userId: session.user.id });
// });

// Definir middleware para servir archivos estáticos
app.use('/ftp/:userId', (req, res, next) => {
    const userId = req.params.userId;

    // Verificar si el usuario está autenticado y tiene el mismo ID
    if (req.session.user && req.session.user.id === userId) {
        // Construir la ruta de la carpeta de FTP del usuario
        const userFtpPath = path.join(__dirname, `ftp/${userId}`);

        // Verificar si la ruta existe (carpeta de FTP del usuario)
        if (fs.existsSync(userFtpPath)) {
            // Servir contenido estático de la carpeta de FTP del usuario
            express.static(userFtpPath)(req, res, next);
        } else {
            // Carpeta no encontrada
            res.status(404).send('Carpeta no encontrada');
        }
    } else {
        // Acceso no autorizado
        res.status(403).send('Acceso no autorizado');
    }
});

// Definir middleware para servir el índice de la carpeta
app.use('/ftp/:userId', serveIndex(path.join(__dirname, 'ftp'), { icons: true }));


app.listen(port, () => console.log(`App running on http://localhost:${port}`))