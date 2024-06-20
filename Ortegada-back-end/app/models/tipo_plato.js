"use strict";

module.exports = (sequelize, DataTypes) => {
  const tipo_plato = sequelize.define('tipo_plato', {
    nombre: { type: DataTypes.STRING(100), unique: true },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
  }, { timestamps: false, freezeTableName: true });
  return tipo_plato;
};