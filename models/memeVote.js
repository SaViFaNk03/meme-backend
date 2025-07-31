import { DataTypes } from "sequelize";

export function createModel(db) {
    const MemeVote = db.define('MemeVote', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        memeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Memes',
                key: 'id'
            }
        },
        isUpvote: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: "True for upvote, false for downvote"
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        // Indice unico per evitare duplicati
        indexes: [
            {
                unique: true,
                fields: ['userId', 'memeId']
            }
        ]       

    });

    return MemeVote;
}