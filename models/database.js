import { Sequelize } from "sequelize";
import {createModel as createUserModel} from "./User.js";
import {createModel as createTagModel} from "./tag.js";
import {createModel as createMemeModel} from "./meme.js";
import {createModel as createMemeTagModel} from "./memeTag.js";
import {createModel as createMemeVoteModel} from "./memeVote.js";
import {createModel as createCommentModel} from "./comment.js";
import {createModel as createCommentVoteModel} from "./commentVote.js";

export const db = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_NAME || './meme_museum.sqlite',
    logging: false // Disabilita il logging per ridurre l'output
});

// Creazione dei modelli
createUserModel(db);
createTagModel(db);
createMemeModel(db);
createMemeTagModel(db);
createMemeVoteModel(db);
createCommentModel(db);
createCommentVoteModel(db);

export const {User, Meme, Tag, MemeTag, Comment, MemeVote, CommentVote} = db.models;

// Definizione delle relazioni tra i modelli

//User - Meme (Un utente può caricare molti meme)
User.hasMany(Meme, { foreignKey: 'userId', onDelete: 'CASCADE' });
Meme.belongsTo(User, { foreignKey: 'userId' });

//User - Comment (Un utente può scrivere molti commenti)
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

//Meme - Comment (Un meme può avere molti commenti)
Meme.hasMany(Comment, { foreignKey: 'memeId', onDelete: 'CASCADE' });
Comment.belongsTo(Meme, { foreignKey: 'memeId' });

//Relazione Many-to-Many tra Meme e Tag tramite MemeTag
Meme.belongsToMany(Tag, {
    through: MemeTag,
    foreignKey: 'memeId',
    otherKey: 'tagId',
    onDelete: 'CASCADE'
});

Tag.belongsToMany(Meme, {
    through: MemeTag,
    foreignKey: 'tagId',
    otherKey: 'memeId',
    onDelete: 'CASCADE'
});

//Relazioni per i voti dei meme
User.hasMany(MemeVote, { foreignKey: 'userId', onDelete: 'CASCADE' });
MemeVote.belongsTo(User, { foreignKey: 'userId' });

Meme.hasMany(MemeVote, { foreignKey: 'memeId', onDelete: 'CASCADE' });
MemeVote.belongsTo(Meme, { foreignKey: 'memeId' });

//Relazioni per i voti dei commenti
User.hasMany(CommentVote, { foreignKey: 'userId', onDelete: 'CASCADE' });
CommentVote.belongsTo(User, { foreignKey: 'userId' });

Comment.hasMany(CommentVote, { foreignKey: 'commentId', onDelete: 'CASCADE' });
CommentVote.belongsTo(Comment, { foreignKey: 'commentId' });

// Hook per aggiornare automaticamente i conteggi dei voti

MemeVote.addHook('afterCreate', async (vote, options) => {
    console.log('🔵 MemeVote afterCreate hook triggered for memeId:', vote.memeId);
    const meme = await Meme.findByPk(vote.memeId);
    if (meme) {
        const upvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: true } });
        const downvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: false } });
        console.log('📊 Updating meme votes:', { upvotes, downvotes });
        await meme.update({ upvotes, downvotes });
        console.log('✅ Meme votes updated successfully');
    }
});

MemeVote.addHook('afterDestroy', async (vote, options) => {
    console.log('🔴 MemeVote afterDestroy hook triggered for memeId:', vote.memeId);
    const meme = await Meme.findByPk(vote.memeId);
    if (meme) {
        const upvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: true } });
        const downvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: false } });
        console.log('📊 Updating meme votes after destroy:', { upvotes, downvotes });
        await meme.update({ upvotes, downvotes });
        console.log('✅ Meme votes updated successfully after destroy');
    }
});

MemeVote.addHook('afterUpdate', async (vote, options) => {
    console.log('🟡 MemeVote afterUpdate hook triggered for memeId:', vote.memeId);
    const meme = await Meme.findByPk(vote.memeId);
    if (meme) {
        const upvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: true } });
        const downvotes = await MemeVote.count({ where: { memeId: vote.memeId, isUpvote: false } });
        console.log('📊 Updating meme votes after update:', { upvotes, downvotes });
        await meme.update({ upvotes, downvotes });
        console.log('✅ Meme votes updated successfully after update');
    }
});

// Hook per aggiornare automaticamente i conteggi dei voti dei commenti
CommentVote.addHook('afterCreate', async (vote, options) => {
    const comment = await Comment.findByPk(vote.commentId);
    if (comment) {
        const upvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: true } });
        const downvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: false } });
        await comment.update({ upvotes, downvotes });
    }
});

CommentVote.addHook('afterDestroy', async (vote, options) => {
    const comment = await Comment.findByPk(vote.commentId);
    if (comment) {
        const upvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: true } });
        const downvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: false } });
        await comment.update({ upvotes, downvotes });
    }
});

CommentVote.addHook('afterUpdate', async (vote, options) => {
    const comment = await Comment.findByPk(vote.commentId);
    if (comment) {
        const upvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: true } });
        const downvotes = await CommentVote.count({ where: { commentId: vote.commentId, isUpvote: false } });
        await comment.update({ upvotes, downvotes });
    }
});



// Sincronizzazione del database con modalità sicura
db.sync({ force: false, alter: false }).then(() => {
    console.log("Database synchronized successfully.");
}).catch((error) => {
    console.error("Error synchronizing database:", error);
    // Se c'è un errore, proviamo con force: true per ricreare il database
    console.log("Attempting to recreate database...");
    return db.sync({ force: true });
}).then((result) => {
    if (result) {
        console.log("Database recreated successfully.");
    }
}).catch((finalError) => {
    console.error("Fatal database error:", finalError);
});

