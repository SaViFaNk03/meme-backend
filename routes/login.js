import express from 'express';
import { AuthentificationController } from '../controllers/auth.js';

const loginRouter = express.Router();

loginRouter.get ('/login', (req, res) => {
    res.send('Login');
});

/**
 *  @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: testpassword123
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Invalid credentials
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

loginRouter.post('/login', async (req, res) => {
    try {
        const usernameExists = await AuthentificationController.checkUsername(req, res);
        if (!usernameExists) {
            // Risposta coerente: solo stringa come richiesto
            return res.status(401).json('Credenziali non valide');
        }

        const isCredentialsValid = await AuthentificationController.validateLoginCredentials(req, res);
        if (!isCredentialsValid) {
            return res.status(401).json('Credenziali non valide');
        }

        // Ottieni l'id dell'utente per il token
        const user = await AuthentificationController.checkUsername(req, res);
        const token = await AuthentificationController.issueToken(user.id);
        return res.status(200).json(token);

    } catch (error) {
        console.error('Errore login:', error);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
});

export { loginRouter };