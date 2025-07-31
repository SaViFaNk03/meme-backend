import { User, Meme} from '../models/db.js';

export async function checkNotAuthor (req, res, next) {
    try {
        const memeId = req.params.id;
        const userId = req.user.id;

        // Trova il meme per ID
        const meme = await Meme.findByPk(memeId);

        if (!meme) {
            return res.status(404).json({ error: 'Meme not found' });
        }

        // Controlla se l'utente è l'autore del meme
        if (meme.userId === userId) {
            return res.status(403).json({ error: 'You cannot like your own meme' });
        }

        next();
    } catch (error) {
        console.error('Error in checkNotAuthor middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}