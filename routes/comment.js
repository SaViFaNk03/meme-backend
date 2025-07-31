import express from 'express';
import { 
    getCommentsByMeme, 
    createComment, 
    voteComment, 
    deleteComment 
} from '../controllers/handleComment.js';
import { authVerification } from '../middleware/authentication.js';

const commentRouter = express.Router();

/**
 * @swagger
 * /memes/{memeId}/comments:
 *   get:
 *     summary: Get all comments for a specific meme
 *     description: Retrieve all comments for a given meme with pagination
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         description: The ID of the meme
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of comments per page
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
commentRouter.get('/memes/:memeId/comments', getCommentsByMeme);

/**
 * @swagger
 * /memes/{memeId}/comments:
 *   post:
 *     summary: Create a new comment on a meme
 *     description: Add a comment to a specific meme (requires authentication)
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         description: The ID of the meme
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a funny meme!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
commentRouter.post('/memes/:memeId/comments', authVerification, createComment);

/**
 * @swagger
 * /comments/{commentId}/vote:
 *   post:
 *     summary: Vote on a comment
 *     description: Upvote or downvote a comment (requires authentication)
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: The ID of the comment
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isUpvote:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *       201:
 *         description: Vote created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
commentRouter.post('/comments/:commentId/vote', authVerification, voteComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a comment (only comment owner or admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not comment owner or admin)
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
commentRouter.delete('/comments/:id', authVerification, deleteComment);

export { commentRouter };
