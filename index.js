import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { db } from './models/database.js';
import { signupRouter } from './routes/signup.js';
import { loginRouter } from './routes/login.js';
import { memeRouter } from './routes/meme.js';
import { commentRouter } from './routes/comment.js';


const app = express();


const PORT = 3000;

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Meme Museum API',
            version: '1.0.0',
            description: 'API documentation for the Meme Museum project'
        },

    },
    apis: ['./routes/*.js'], // Path to the API docs
});



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors({
  origin: [
    'http://mememuseum.altervista.org',
    'https://mememuseum.altervista.org'
  ],
  credentials: true
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Servizio file statici per le immagini caricate
app.use('/uploads', express.static('uploads'));

// Servi il file di test HTML per upload
app.get('/test-upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-upload.html'));
});



// Routes
app.use(signupRouter);
app.use(loginRouter);
app.use('/api', memeRouter);
app.use('/api', commentRouter);

// Route di benvenuto
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Meme Museum API!',
        documentation: '/api-docs'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});


