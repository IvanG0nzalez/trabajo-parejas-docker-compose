"use strict";

module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta',{
        correo: {type: DataTypes.STRING(100), unique:true},
        nombre_usuario: {type: DataTypes.STRING(100)},
        clave: {type: DataTypes.STRING(100), allowNull:false},
        estado: {type: DataTypes.BOOLEAN, defaultValue:false},
        external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
    }, {timestamps: false, freezeTableName: true});
    cuenta.associate = function(models){
        cuenta.belongsTo(models.rol, {foreignKey: 'id_rol'});
        cuenta.belongsToMany(models.plato, {
            through: models.cuenta_plato,
            foreignKey: 'id_cuenta',
            otherKey: 'id_plato',
            as: 'platos'
        });
    };
    return cuenta;
};