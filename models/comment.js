import { DataTypes } from "sequelize";

export function createModel(db) {
    const Comment = db.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg : "Il contenuto non può essere vuoto"
                }
            },
            len: {
                args: [1, 500],
                msg: "Content must be between 1 and 500 characters"
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        upvotes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        downvotes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    });
    return Comment;
}