const models = require('../app/models');
const TipoPlato = models.tipo_plato;

async function inicializarTiposPlato() {
    try {
        const tiposAux = await TipoPlato.findAll({ attributes: ['nombre'] });

        if (tiposAux.length === 0) {
            var uuid = require('uuid');

            const tiposDePlato = [
                'Almuerzo (Sopa)',
                'Almuerzo (Plato Fuerte)',
                'Merienda',
                'Desayuno'
            ];

            for (let nombre of tiposDePlato) {
                await TipoPlato.create({ nombre, external_id: uuid.v4() });
            }

            console.log('\x1b[36m%s\x1b[0m', 'Tipos de plato creados exitosamente.');
        } else {
            console.log('\x1b[35m%s\x1b[0m', 'Los tipos de plato ya existen en la base de datos.');
        }
    } catch (error) {
        console.error('Error al inicializar tipos de plato:', error);
    }
}

module.exports = inicializarTiposPlato;
