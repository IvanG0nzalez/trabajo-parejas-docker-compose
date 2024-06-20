"use strict";

module.exports = (sequelize, DataTypes) => {
    const cuenta_plato = sequelize.define('cuenta_plato',{
        cantidad: {type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0},
        total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
    }, {timestamps: false, freezeTableName: true});
    cuenta_plato.associate = function(models){
        cuenta_plato.belongsTo(models.cuenta, { foreignKey: 'id_cuenta' });
        cuenta_plato.belongsTo(models.plato, { foreignKey: 'id_plato' });
    };
    return cuenta_plato;
};