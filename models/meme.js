import { DataTypes } from 'sequelize';

export function createModel(db) {
    const Meme = db.define('Meme', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Il titolo non può essere vuoto"
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isValidUrl(value) {
                    try {
                        const url = new URL(value);
                        if (!['http:', 'https:'].includes(url.protocol)) {
                            throw new Error("URL must use http or https protocol");
                        }
                        return true;
                    } catch (error) {
                        throw new Error("Must be a valid URL");
                    }
                },
                notEmpty: {
                    msg: "L'URL dell'immagine non può essere vuoto"
                }
            }
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        uploadDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        upvotes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        downvotes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        // Campo per calcolare il punteggio totale
        score: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.upvotes - this.downvotes;
            }
        },
        
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: "Likes cannot be negative"
                }
            }
        },

        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: "Views cannot be negative"
                }
            }
        },

        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        downloadCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: "Download count cannot be negative"
                }
            }
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
    return Meme;
}