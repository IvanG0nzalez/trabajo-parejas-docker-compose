"use strict";

const { DELETE } = require("sequelize/lib/query-types");

module.exports = (sequelize, DataTypes) => {
    const plato = sequelize.define('plato', {
        nombre: { type: DataTypes.STRING(100) },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        precio: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, { timestamps: false, freezeTableName: true });
    plato.associate = function (models) {
        plato.belongsToMany(models.cuenta, {
            through: models.cuenta_plato,
            foreignKey: 'id_plato',
            otherKey: 'id_cuenta',
            as: 'cuentas'
        });
        plato.belongsTo(models.tipo_plato, { foreignKey: 'id_tipo_plato' });
    };
    return plato;
};