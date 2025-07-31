import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authVerification(req, res, next) {
    console.log('=== DEBUG authVerification ===');
    console.log('All headers:', req.headers);
    
    const token = req.headers['authorization'];
    console.log('Token from header:', token);

    if (!token) {
        console.log('❌ No token found in authorization header');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'meme-museum-secret';
        console.log('🔍 Verifying token with secret:', secret);
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret);
        console.log('✅ Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error);
        return res.status(401).json({ message: 'Access denied!', error:error.toString() });
    }
};