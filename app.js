const express = require('express')
const session = require('express-session');
const serveIndex = require('serve-index')
const path = require('path')
const fs = require('fs');
const fc = require('fs').promises;
const handlebars = require('handlebars');
const upload = require('./src/modules/upload');
const createRouter = require('./src/modules/create');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('./model/user');
const dirRender = require('./src/modules/DirRender')
const db = require('./src/modules/database');
// require('dotenv').config();
const app = express();
const port = 3001;

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
        //console.log('Usuario no autenticado. Redirigiendo a /login');
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

app.post('/login', async (req, res) => {
    console.log('iniciar login');
    try {
        const email = req.body.email;
        const password = req.body.password;
        const result = await db.getUserByEmail(email)

        if(!result.success){
            return res.status(404).json({success: false, message: "The user does not exist"})
        }
        if(!bcrypt.compareSync(password, result.user.hashedPassword)) {
            return res.status(404).json({success: false, message: "The password is invalid"})
        }
        req.session.user = { id: result.user.userId, email: result.user.email };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        // Enviar respuesta JSON indicando fallo
        res.status(401).json({ success: false });
    }
});

app.get('/register', (req,res)=>{
    //console.log(req.url)
    res.sendFile(path.join(__dirname, 'views/register.html'))
})

app.post('/register', async (req, res) => {
    //console.log('iniciar login');
    try {
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name + " "+ req.body.lastname;
        const lastname = req.body.lastname;
        const userID = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(email, password, name, lastname);
        // const response = await User.create({
        //     userId, email, name, hashedPassword
        // })1
        const response = await db.createNewUser(userID, email, name, hashedPassword)
        console.log('response',response)
        if(!response.success){
            return res.status(401).json({success: false, message: "Error al crear su cuenta de usuario. Inténtelo nuevamente"})
        }
        const userFolder = path.join(__dirname,'ftp',userID)
        fs.promises.mkdir(userFolder)
        req.session.user = {id: userID, email: email}
        res.status(200).json({success: true})
    } catch (error) {
        console.error(error);
        // Enviar respuesta JSON indicando fallo
        res.status(401).json({ success: false });
    }
});

app.post('/logout', (req, res) => {
    // Destruir la sesión y redirigir a la página de inicio de sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).json({success: false, message: "Ha ocurrido un error con su petición. Inténtelo nuevamente"})
        }
        return res.status(200).json({success: true})
    });
});

app.use('/mydrive2', (req, res, next) => {
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

app.use('/mydrive2', (req, res, next) => {
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
    // stylesheet: './public/css/ftp.css',
    stylesheet: './public/css/mydrive.css',
    template: './views/mydrive.html'
}));

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
}, dirRender(path.join(__dirname, 'ftp'), {
    icons: true,
    // stylesheet: './public/css/ftp.css',
    // stylesheet: './public/css/mydrive.css',
    // template: './views/mydrive.html' 
}));

// Middleware personalizado para agregar req.session.user.id al cuerpo de la solicitud
app.use('/upload', (req, res, next) => {
    req.userId = req.session.user.id;
    next();
});

  // Configura la ruta para manejar las subidas de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    // Handle the uploaded file
    res.json({ message: 'File uploaded successfully!' });
});

app.use('/create-folder', (req, res, next) => {
    req.folderName = req.body.folderName;
    next();
});

// Create Folder
app.use(createRouter);

app.use(handleNotFound);

app.listen(port, () => console.log(`App running on http://localhost:${port}`))