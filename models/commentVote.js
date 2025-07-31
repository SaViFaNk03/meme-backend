import { DataTypes } from 'sequelize';

export function createModel(db) {
    const commentVote = db.define('CommentVote', {
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
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Comments',
                key: 'id'
            }
        },
        isUpvote: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true, // true for upvote, false for downvote
            validate: {
                notNull: {
                    msg: "isUpvote cannot be null"
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        // Indice unico per permettere un solo voto per utente e commento
        indexes: [
            {
                unique: true,
                fields: ['userId', 'commentId']
            }
        ]
    });

    return commentVote;
}