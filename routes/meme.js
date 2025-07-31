import express from 'express';

import {
    getAllMemes,
    getMemeById,
    createMeme,
    voteMeme,
    getMemeOfTheDay,
    getAllTags,
    createMemeWithUpload,
    deleteMeme,
    getUserVoteOnMeme
} from '../controllers/handleMeme.js';

import {
    getCommentsByMeme,
    createComment,
    deleteComment,
    voteComment
} from '../controllers/handleComment.js';

import { authVerification } from '../middleware/authentication.js';
import { uploadSingle, handleUploadError, requireFile } from '../middleware/upload.js';

const memeRouter = express.Router();

/**
 * @swagger
 * /memes/{id}:
 *   get:
 *     summary: Get a meme by ID
 *     description: Retrieve a specific meme with all its details including author, tags, and vote statistics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meme to retrieve
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Meme details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Funny Cat Meme"
 *                 description:
 *                   type: string
 *                   example: "A very funny cat doing something hilarious"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://example.com/cat.jpg"
 *                 uploadDate:
 *                   type: string
 *                   format: date-time
 *                 views:
 *                   type: integer
 *                   example: 42
 *                 likes:
 *                   type: integer
 *                   example: 15
 *                 downloadCount:
 *                   type: integer
 *                   example: 5
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     surname:
 *                       type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       color:
 *                         type: string
 *                 votes:
 *                   type: object
 *                   properties:
 *                     upvotes:
 *                       type: integer
 *                     downvotes:
 *                       type: integer
 *                     score:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       '400':
 *         description: Invalid meme ID
 *       '404':
 *         description: Meme not found
 *       '500':
 *         description: Internal server error
 */

// Routes per i meme
memeRouter.get('/memes', getAllMemes); // Ottieni tutti i meme con filtri
memeRouter.get('/memes/meme-of-the-day', getMemeOfTheDay); // Ottieni il meme del giorno
memeRouter.get('/memes/:id', getMemeById); // Ottieni un meme specifico per ID
memeRouter.post('/memes', authVerification, createMeme); // Crea un nuovo meme con URL (autenticato)
memeRouter.post('/memes/upload', authVerification, uploadSingle, handleUploadError, requireFile, createMemeWithUpload); // Crea meme con upload file (autenticato)
memeRouter.delete('/memes/:id', authVerification, deleteMeme); // Elimina un meme (solo proprietario)
memeRouter.post ('/memes/:id/vote', authVerification, voteMeme); // Vota un meme (autenticato)
memeRouter.get('/memes/:id/vote', authVerification, getUserVoteOnMeme); // Ottieni il voto dell'utente per un meme (autenticato)

// Routes per i commenti
memeRouter.get('/memes/:id/comments', getCommentsByMeme); // Ottieni tutti i commenti per un meme specifico
memeRouter.post('/memes/:id/comments', authVerification, createComment); // Crea un nuovo commento (solo per utenti autenticati)
memeRouter.delete('/comments/:id', authVerification, deleteComment); // Elimina un commento (solo proprietario) 
memeRouter.post('/comments/:commentId/vote', authVerification, voteComment); // Vota un commento (autenticato)

// Route per ottenere tutti i tag
memeRouter.get('/tags', getAllTags); // Ottieni tutti i tag disponibili

export { memeRouter };

