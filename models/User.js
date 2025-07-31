import { DataTypes } from "sequelize";
import { createHash } from "crypto";

export function createModel(db) {
    const User = db.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Il nome non può essere vuoto"
                }
            }
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Il cognome non può essere vuoto"
                }
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "Username must be unique"
            },
            validate: {
                notEmpty: {
                    msg: "Lo username non può essere vuoto"
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "Email must be unique"
            },
            validate: {
                isEmail: {
                    msg: "Must be a valid email address"
                },
                notEmpty: {
                    msg: "L'email non può essere vuota"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "La password non può essere vuota"
                }
            },
            set(value) {
                // Hash the password before saving
                const hash = createHash('sha256').update(value).digest('hex');
                this.setDataValue('password', hash);
            }
        },
    });

    return User;
}