import { User } from '../models/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export class AuthentificationController {
    static async validateLoginCredentials(req, res) {
        try {
            let checkUser = new User ({username: req.body.username, password: req.body.password});
            const userLogin = await AuthentificationController.getUserByCredentials(checkUser);
            return userLogin ? true : false;
        } catch (error) {
            console.error('Error validating login credentials:', error);
            return false;
        }
    }

    static async getUserByCredentials(checkUser) {
        return User.findOne({
            where: {
                username: checkUser.username,
                password: checkUser.password
            }
        });
    }

    static async checkUsername(req, res) {
        return User.findOne({
            where: {
                username: req.body.username
            }
        });
    }

    static async checkEmail(req, res) {
        return User.findOne({
            where: {
                email: req.body.email
            }
        });
    }

    static async saveUser(req, res) {
        let newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        return await newUser.save({validators: true});
    }

    static async issueToken(userId) {
        const user = await User.findByPk(userId);
        const secret = process.env.JWT_SECRET || 'meme-museum-secret';
        return jwt.sign({
            id: userId,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                surname: user.surname
            }
        }, secret, {expiresIn: '24h'});
    }
}