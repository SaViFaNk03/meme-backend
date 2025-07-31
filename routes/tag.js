import express from 'express';
import { MemeTag } from '../models/memeTag.js'; // Assicurati che il modello sia corretto

const router = express.Router();

// Endpoint GET /api/tags
router.get('/tags', async (req, res) => {
  try {
    // Recupera tutti i tag dal database
    const tags = await MemeTag.findAll();
    res.json(tags);
  } catch (error) {
    console.error('Errore nel recupero dei tag:', error);
    res.status(500).json({ error: 'Errore nel recupero dei tag' });
  }
});

export { router as tagRouter };
