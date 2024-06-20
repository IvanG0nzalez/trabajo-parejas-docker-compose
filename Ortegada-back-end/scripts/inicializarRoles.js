const models = require('../app/models');
const roles = models.rol;
async function inicializarRoles() {
    try {
        const rolesAux = await roles.findAll({ attributes: ['nombre'] });

        if (rolesAux.length === 0) {
            var uuid = require('uuid');

            await models.rol.bulkCreate([
                { nombre: 'Administrador', external_id: uuid.v4() },
                { nombre: 'Organizador', external_id: uuid.v4() },
                { nombre: 'Usuario', external_id: uuid.v4() }
            ]);
            console.log('\x1b[36m%s\x1b[0m', 'Roles creados exitosamente.');
        } else {
            console.log('\x1b[35m%s\x1b[0m', 'Los roles ya existen en la base de datos.');
        }
    } catch (error) {
        console.error('Error al inicializar roles:', error);
    }
}

module.exports = inicializarRoles;
