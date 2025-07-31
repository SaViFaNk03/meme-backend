import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assicurati che la cartella uploads esista (percorso assoluto)
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurazione dello storage per Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Genera un nome file unico con timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname).toLowerCase();
        cb(null, `meme-${uniqueSuffix}${fileExtension}`);
    }
});

// Filtro per validare il tipo di file
const fileFilter = (req, file, cb) => {
    // Lista dei tipi MIME accettati per le immagini
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo di file non supportato. Sono accettati solo: JPEG, PNG, GIF, WebP'), false);
    }
};

// Configurazione di Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1 // Solo un file per volta
    }
});

// Middleware per gestire errori di upload
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File troppo grande. Dimensione massima: 5MB' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                error: 'Troppi file. È possibile caricare un solo file per volta' 
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Campo file non previsto. Utilizzare il campo "image"' 
            });
        }
    }
    
    if (err.message) {
        return res.status(400).json({ error: err.message });
    }
    
    next(err);
};

// Middleware per upload singolo
export const uploadSingle = upload.single('image');

// Utility per eliminare un file
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File eliminato: ${filePath}`);
        }
    } catch (error) {
        console.error(`Errore nell'eliminazione del file ${filePath}:`, error);
    }
};

// Middleware per validare che sia stato caricato un file
export const requireFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ 
            error: 'È necessario caricare un file immagine' 
        });
    }
    next();
};
