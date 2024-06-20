'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('cuenta_plato', 'total', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cuenta_plato', 'total');
  }
};
