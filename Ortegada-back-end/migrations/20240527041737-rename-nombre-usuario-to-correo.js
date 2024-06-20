'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('cuenta', 'nombre_usuario', "correo");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('cuenta', 'correo', 'nombre_usuario');
  }
};
