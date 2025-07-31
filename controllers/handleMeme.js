import { Meme, Tag, MemeTag, MemeVote, User, Comment } from '../models/database.js';
import { Op } from 'sequelize';

//Ottieni tutti i meme con filtri e paginazione
export const getAllMemes = async (req, res) => {
    try {
        console.log('=== GET /api/memes ===');
        console.log('Query parameters:', req.query);
        
    const{
        page = 1,
        limit = 10,
        tags,
        sortBy = 'uploadDate', // 'uploadDate', 'score', 'upvotes'
        order = 'DESC', // 'ASC' or 'DESC'
        startDate,
        endDate,
        authorId,
        username,
        title
    } = req.query;

        const offset = (page - 1) * limit;

        // Costruzione della query
        const whereConditions = {};

        //Filtraggio per data
        if (startDate || endDate) {
            whereConditions.uploadDate = {};
            if (startDate) {
                whereConditions.uploadDate[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereConditions.uploadDate[Op.lte] = new Date(endDate);
            }
        }

        //Filtraggio per autore
        if (authorId) {
            whereConditions.authorId = authorId;
        }

        //Filtraggio per titolo
        if (title) {
            whereConditions.title = {
                [Op.iLike]: `%${title}%` // Case-insensitive search
            };
        }

        //Include per i tag se specificati
        let includeOptions = [
            {
                model: Tag,
                through: { attributes: [] }, // Esclude gli attributi della tabella di join
                attributes: ['id', 'name', 'color']
            },
            {
                model: User,
                attributes: ['id', 'username'],
                ...(username && { where: { username } }) // Filtro per username se specificato
            }
        ];

        //Filtraggio per tag
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            includeOptions[0].where = {
                name: {
                    [Op.in]: tagArray
                }
            };
        }

        // Ordinamento
        let orderBy;
        switch(sortBy) {
            case 'score':
                orderBy = [['upvotes', order], ['downvotes', order === 'DESC' ? 'ASC' : 'DESC']];
                break;
            case 'upvotes':
                orderBy = [['upvotes', order]];
                break;
            case 'downvotes':
                orderBy = [['downvotes', order]];
                break;
            default:
                orderBy = [['uploadDate', order]];
        }

        //Conteggio Commenti per meme

        const { count, rows: memes } = await Meme.findAndCountAll({
            where: whereConditions,
            include: includeOptions,
            order: orderBy,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            attributes: {
                include: [
                    [
                        Meme.sequelize.literal('(SELECT count(*) FROM Comments WHERE Comments.memeId = Meme.id)'),
                        'commentCount'
                    ]
                ]
            }
        });

        res.json({
            memes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching memes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Ottieni un meme specifico per ID con tutti i dettagli
export const getMemeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validazione ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID meme non valido' });
        }

        const meme = await Meme.findOne({
            where: { 
                id: id,
                isActive: true 
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'name', 'surname']
                },
                {
                    model: Tag,
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description', 'color']
                }
            ]
        });

        if (!meme) {
            return res.status(404).json({ error: 'Meme non trovato' });
        }

        // Incrementa il contatore delle visualizzazioni
        await meme.increment('views');

        // Ricarica il meme dal database per ottenere i voti più aggiornati
        await meme.reload();

        // Utilizza i valori di upvotes e downvotes già memorizzati nel database
        // (aggiornati automaticamente dagli hook)
        const upvotes = meme.upvotes || 0;
        const downvotes = meme.downvotes || 0;
        const score = upvotes - downvotes;

        // Prepara la risposta
        const response = {
            id: meme.id,
            title: meme.title,
            description: meme.description,
            imageUrl: meme.imageUrl,
            uploadDate: meme.uploadDate,
            views: meme.views + 1, // Include la visualizzazione appena incrementata
            likes: meme.likes,
            downloadCount: meme.downloadCount,
            isPublic: meme.isPublic,
            // Aggiungi i voti sia come proprietà dirette che nell'oggetto votes
            upvotes: upvotes,
            downvotes: downvotes,
            author: {
                id: meme.User.id,
                username: meme.User.username,
                name: meme.User.name,
                surname: meme.User.surname
            },
            tags: meme.Tags.map(tag => ({
                id: tag.id,
                name: tag.name,
                description: tag.description,
                color: tag.color
            })),
            votes: {
                upvotes: upvotes,
                downvotes: downvotes,
                score: score,
                total: upvotes + downvotes
            },
            createdAt: meme.createdAt,
            updatedAt: meme.updatedAt
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching meme by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Crea un nuovo meme (Solo per utenti autenticati)
export const createMeme = async (req, res) => {
    try {
        const { title, description, imageUrl, tags } = req.body;
        const userId = req.user.id; // Assicurati che l'utente sia autenticato

        if (!title || !imageUrl) {
            return res.status(400).json({ error: 'Titolo e URL immagine obbligatori' });
        }

        // Crea il nuovo meme
        const newMeme = await Meme.create({
            title,
            description,
            imageUrl,
            authorId: userId,
            userId: userId,
            uploadDate: new Date()
        });

        // gestione dei tag associati
        if (tags && tags.length > 0) {
            const tagIds = [];

            for (const tagName of tags) {
                const [tag] = await Tag.findOrCreate({
                    where: { name: tagName.trim()},
                    defaults: {name: tagName.trim()}
                });
                tagIds.push(tag.id);
            }

            // Associa i tag al meme
            await newMeme.setTags(tagIds);
        }

        //Ricarica il meme con i tag associati
        const memeWithTags = await Meme.findByPk(newMeme.id, {
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }, // Esclude gli attributi della tabella di join
                    attributes: ['id', 'name', 'color']
                },
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ]
        });

        res.status(201).json(memeWithTags);
    } catch (error) {
        console.error('Error creating meme:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

// Vota un meme (Solo per utenti autenticati)
export const voteMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const { isUpvote } = req.body; // isUpvote: true per upvote, false per downvote
        const userId = req.user.id; // Assicurati che l'utente sia autenticato

        // Verifica se il meme esiste
        const meme = await Meme.findByPk(id);
        if (!meme) {
            return res.status(404).json({ error: 'Meme non trovato' });
        }

        // Verifica se l'utente ha già votato questo meme
        const existingVote = await MemeVote.findOne({
            where: {
                memeId: id,
                userId: userId
            }
        });

        let action = '';
        if (existingVote) {
            if (existingVote.isUpvote === isUpvote) {
                // Rimuovi il voto se l'utente ha già votato nello stesso modo
                await existingVote.destroy();
                action = 'removed';
            } else {
                // Aggiorna il voto
                await existingVote.update({ isUpvote });
                action = 'updated';
            }
        } else {
            // Crea un nuovo voto
            await MemeVote.create({
                userId,
                memeId: id,
                isUpvote
            });
            action = 'created';
        }

        // Ricalcola upvotes e downvotes
        const upvotes = await MemeVote.count({ where: { memeId: id, isUpvote: true } });
        const downvotes = await MemeVote.count({ where: { memeId: id, isUpvote: false } });
        meme.upvotes = upvotes;
        meme.downvotes = downvotes;
        await meme.save();

        return res.json({ 
            message: `Vote ${action}`,
            upvotes,
            downvotes
        });
    } catch (error) {
        console.error('Error voting meme:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

// Ottieni il meme del giorno (algoritmo semplice basato su data e punteggio)
export const getMemeOfTheDay = async (req, res) => {
    try {
        //Algortitmo semplice: prendi il meme con il punteggio più alto del giorno corrente
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const meme = await Meme.findOne({
            where: {
                uploadDate: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: endOfDay
                }
            },
            include: [
                {
                    model: Tag,
                    through: { attributes: [] }, // Esclude gli attributi della tabella di join
                    attributes: ['id', 'name', 'color']
                },
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['upvotes', 'DESC'], ['downvotes', 'ASC']], // Ordina per punteggio
            limit: 1
        });

        if (!meme) {
            // Se non c'è nessun meme per oggi, restituisci un messaggio
            const fallbackMeme = await Meme.findOne({
                include: [
                    {
                        model: Tag,
                        through: { attributes: [] }, // Esclude gli attributi della tabella di join
                        attributes: ['id', 'name', 'color']
                    },
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ],
                order: [['upvotes', 'DESC'], ['downvotes', 'ASC']], // Ordina per punteggio
                limit: 1
            });
            return res.json(fallbackMeme || { message: 'No memes available' });
        }

        res.json(meme);

    } catch (error) {
        console.error('Error fetching meme of the day:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

// Ottieni tutti i tag disponibili
export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            attributes: ['id', 'name', 'color'],
            order: [['name', 'ASC']] // Ordina i tag per nome
        });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
}

// === FUNZIONI PER UPLOAD DI MEME ===

// Crea un nuovo meme con upload di file
export const createMemeWithUpload = async (req, res) => {
    try {
        console.log('=== DEBUG createMemeWithUpload ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        console.log('req.user:', req.user);
        
        const { title, description, tags } = req.body;
        const userId = req.user.id;
        
        // Verifica che sia stato caricato un file
        if (!req.file) {
            return res.status(400).json({ error: 'È necessario caricare un file immagine' });
        }
        
        // Verifica che il titolo sia presente
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Il titolo è obbligatorio' });
        }
        
        // Costruisci l'URL completo dell'immagine
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
        // Crea il meme nel database
        const meme = await Meme.create({
            title: title.trim(),
            description: description?.trim() || null,
            imageUrl: imageUrl,
            authorId: userId,
            userId: userId,
            uploadDate: new Date()
        });
        
        // Gestisci i tag se presenti
        if (tags) {
            let parsedTags = [];
            
            try {
                // Prova a parsare come JSON
                parsedTags = JSON.parse(tags);
            } catch (error) {
                // Se fallisce, prova come stringa separata da virgole
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
            
            // Crea o trova i tag e associali al meme
            if (parsedTags.length > 0) {
                for (const tagName of parsedTags) {
                    const [tag] = await Tag.findOrCreate({
                        where: { name: tagName },
                        defaults: { name: tagName }
                    });
                    
                    await MemeTag.create({
                        memeId: meme.id,
                        tagId: tag.id
                    });
                }
            }
        }
        
        // Recupera il meme creato con tutte le relazioni
        const createdMeme = await Meme.findByPk(meme.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                },
                {
                    model: Tag,
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'color']
                }
            ]
        });
        
        res.status(201).json({
            message: 'Meme caricato con successo',
            meme: createdMeme
        });
        
    } catch (error) {
        console.error('Errore durante la creazione del meme:', error);
        
        // Se c'è un errore, elimina il file caricato
        if (req.file) {
            const { deleteFile } = await import('../middleware/upload.js');
            deleteFile(req.file.path);
        }
        
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

// Elimina un meme (solo il proprietario)
export const deleteMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Trova il meme
        const meme = await Meme.findByPk(id);
        
        if (!meme) {
            return res.status(404).json({ error: 'Meme non trovato' });
        }
        
        // Verifica che l'utente sia il proprietario del meme
        if (meme.userId !== userId) {
            return res.status(403).json({ error: 'Non hai i permessi per eliminare questo meme' });
        }
        
        // Elimina il file immagine se è un upload locale
        if (meme.imageUrl && meme.imageUrl.includes('/uploads/')) {
            const { deleteFile } = await import('../middleware/upload.js');
            const filename = meme.imageUrl.split('/uploads/')[1];
            const filePath = `uploads/${filename}`;
            deleteFile(filePath);
        }
        
        // Elimina il meme dal database (le relazioni vengono eliminate automaticamente con CASCADE)
        await meme.destroy();
        
        res.json({ message: 'Meme eliminato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del meme:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

// Ottieni il voto dell'utente per un meme specifico
export const getUserVoteOnMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Assicurati che l'utente sia autenticato

        // Verifica se il meme esiste
        const meme = await Meme.findByPk(id);
        if (!meme) {
            return res.status(404).json({ error: 'Meme non trovato' });
        }

        // Cerca il voto dell'utente per questo meme
        const userVote = await MemeVote.findOne({
            where: {
                memeId: id,
                userId: userId
            }
        });

        if (userVote) {
            return res.json({ 
                hasVoted: true,
                isUpvote: userVote.isUpvote
            });
        } else {
            return res.json({ 
                hasVoted: false,
                isUpvote: null
            });
        }

    } catch (error) {
        console.error('Error getting user vote:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};