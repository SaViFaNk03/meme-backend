import { DataTypes } from "sequelize";

export function createModel(db) {
    const MemeTag = db.define('MemeTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        memeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Memes',
                key: 'id'
            }
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',
                key: 'id'
            }
        }
    }, {
        // Indice unico per evitare duplicati
        indexes: [
            {
                unique: true,
                fields: ['memeId', 'tagId']
            }
        ]
    });
    return MemeTag;
}