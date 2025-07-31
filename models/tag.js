import { DataTypes } from "sequelize";

export function createModel(db) {
    const Tag = db.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Il nome del tag non può essere vuoto"
                },
                len: {
                    args: [1, 50],
                    msg: "Tag name must be between 1 and 50 characters"
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 500],
                    msg: "Description must be less than 500 characters"
                }
            }
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '#6B7280', // Colore grigio predefinito
            validate: {
                is: {
                    args: /^#([0-9A-F]{3}|[0-9A-F]{6})$/i,
                    msg: "Must be a valid hex color code"
                }
            }
        }
    });
    return Tag;
}
// Questo modello rappresenta i tag che possono essere associati ai meme
// Include validazioni per il nome, la descrizione e il colore
// Il nome del tag deve essere unico e non vuoto
// La descrizione è opzionale ma deve essere breve
// Il colore deve essere un codice esadecimale valido, con un colore predefinito se non specificato
// Il modello include anche un indice unico per il nome del tag per evitare duplicati
// Il colore predefinito è grigio (#6B7280), ma può essere personalizzato
// Il modello è pronto per essere utilizzato in associazione con i meme tramite il modello MemeTag
// Le validazioni assicurano che i dati siano coerenti
// Il modello può essere esteso in futuro per includere funzionalità aggiuntive come
// conteggio dei meme associati o timestamp di creazione/aggiornamento
