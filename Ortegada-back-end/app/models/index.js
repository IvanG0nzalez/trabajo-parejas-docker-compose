"use strict";
// Cargar las variables de entorno
require('dotenv').config();

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config");

console.log('\x1b[33m%s\x1b[0m', `NODE_ENV actual: ${env}`);

// Inicialización de Sequelize con la configuración 
const sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    {
        host: config[env].host,
        dialect: config[env].dialect,
        port: config[env].port,
        dialectOptions: config[env].ssl ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {},
        logging: console.log,
        operatorsAliases: config[env].operatorsAliases
    }
);

// Leer los archivos del directorio actual y definir los modelos
const db = {};
fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js");
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

// Definir las asociaciones de los modelos
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Exportar la instancia de Sequelize y los modelos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;