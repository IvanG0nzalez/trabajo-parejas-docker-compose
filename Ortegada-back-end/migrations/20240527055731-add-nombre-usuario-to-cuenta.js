'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('cuenta', 'nombre_usuario', {
      type: Sequelize.STRING(100),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cuenta', 'nombre_usuario');
  }
};
