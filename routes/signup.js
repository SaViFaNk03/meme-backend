import express from 'express';
import { AuthentificationController } from '../controllers/auth.js';

export const signupRouter = express.Router();

signupRouter.get('/signup', (req, res) => {
    res.send('Signup');
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user and return user data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: 'NewUser'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *               name:
 *                 type: string
 *                 example: 'NewUser'
 *               surname:
 *                 type: string
 *                 example: 'User'
 *               email:
 *                 type: string
 *                 example: 'user@gmail.com'
 *     responses:
 *       200:
 *         description: Successfully registered user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataValues:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: 'NewUser'
 *                     password:
 *                       type: string
 *                       example: '4571f4c04205cce87bda02b544034ab309554f5d3a213e00ea582b35ed8ca556'
 *                     email:
 *                       type: string
 *                       example: 'user@gmail.com'
 *                     surname:
 *                       type: string
 *                       example: 'User'
 *                     name:
 *                       type: string
 *                       example: 'NewUser'
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2025-07-18T10:49:45.123Z'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2025-07-18T10:49:45.123Z'
 *       401:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Email already in use
 *       500:
 *         description: Could not save new user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Could not save new user
 */


signupRouter.post('/signup', async (req, res) => {
    console.log(req.body);
    try {
        const emailExists = await AuthentificationController.checkEmail(req, res);
        if (emailExists) {
            return res.status(401).json('Email already in use');
        }

        const usernameExists = await AuthentificationController.checkUsername(req, res);
        if (usernameExists) {
            return res.status(401).json('Username already in use');
        }

        const result = await AuthentificationController.saveUser(req, res);
        console.log(result);
        return res.json(result);

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Could not save new user' });
    }
});