const models = require('../app/models');
const inicializarRoles = require('./inicializarRoles');
const bcrypt = require("bcrypt");

const cuentas = models.cuenta;
const roles = models.rol;
async function inicializarAdmin() {
    try {
        const cuentaAux = await cuentas.findAll({
            attributes: ['correo'],
            where: { correo: 'ivanalegonzalez3@gmail.com' }
        });

        if (cuentaAux.length === 0) {
            var uuid = require('uuid');

            let rolAux = await roles.findOne({where: {nombre: "Administrador"}});

            if(!rolAux) {
                inicializarRoles();
                rolAux = await roles.findOne({where: {nombre: "Administrador"}});
            }
            const claveCifrada = await bcrypt.hash('1405', 10);

            await models.cuenta.create(
                {
                    correo: "ivanalegonzalez3@gmail.com",
                    nombre_usuario: "Iván González",
                    estado: true,
                    clave: claveCifrada,
                    id_rol: rolAux.id,
                    external_id: uuid.v4(),
                }
            );
            console.log('\x1b[36m%s\x1b[0m', 'Administrador creado exitosamente.');
        } else {
            console.log('\x1b[35m%s\x1b[0m', 'El administrador ya existe en la base de datos.');
        }
    } catch (error) {
        console.error('Error al inicializar Adminisrador:', error);
    }
}

module.exports = inicializarAdmin;
