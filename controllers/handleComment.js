import { Comment, CommentVote, User, Meme} from '../models/database.js';

// Ottieni tutti i commenti per un meme specifico
export const getCommentsByMeme = async (req, res) => {
    try {
        const { id: memeId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        // Veridica se il meme esiste
        const meme = await Meme.findByPk(memeId);
        if (!meme) {
            return res.status(404).json({ error: "Meme non trovato" });
        }

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: { memeId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            },
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Crea un nuovo commento (solo per utenti autenticati)
export const createComment = async (req, res) => {
    try {
        const { id: memeId } = req.params;
        const { content } = req.body;
        const userId = req.user.id; // Assumendo che l'ID utente sia disponibile in req.user

        // Verifica se il meme esiste
        const meme = await Meme.findByPk(memeId);
        if (!meme) {
            return res.status(404).json({ error: "Meme non trovato" });
        }

        // Crea il commento
        const comment = await Comment.create({
            content,
            userId,
            memeId
        });

        // Ricarica il commento con i dettagli dell'utente
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ]
        });

        res.status(201).json(commentWithUser);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Vota un commento (solo per utenti autenticati)
export const voteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { isUpvote } = req.body; // true for upvote, false for downvote
        const userId = req.user.id; // Assumendo che l'ID utente sia disponibile in req.user

        // Verifica se il commento esiste
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Commento non trovato" });
        }

        // Verifica se l'utente ha già votato questo commento
        const existingVote = await CommentVote.findOne({
            where: {
                userId,
                commentId
            }
        });

        let action = '';
        if (existingVote) {
            if (existingVote.isUpvote === isUpvote) {
                // Rimuovi il voto se l'utente sta votando lo stesso tipo
                await existingVote.destroy();
                action = 'removed';
            } else {
                // Aggiorna il voto
                await existingVote.update({ isUpvote });
                action = 'updated';
            }
        } else {
            // Crea un nuovo voto
            await CommentVote.create({
                userId,
                commentId,
                isUpvote
            });
            action = 'created';
        }

        // Ricarica il commento aggiornato con l'utente
        const updatedComment = await Comment.findByPk(commentId, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ]
        });

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error("Error voting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Elimina un commento (solo per utenti autenticati e proprietari del commento o admin)
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Assumendo che l'ID utente sia disponibile in req.user

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ error: "Commento non trovato" });
        }

        // Verifica se l'utente è il proprietario del commento o un admin
        if (comment.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({ error: "Non hai permesso di eliminare questo commento" });
        }

        await comment.destroy();
        res.json({ message: "Commento eliminato con successo" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
