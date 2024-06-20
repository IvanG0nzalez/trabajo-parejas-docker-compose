'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('plato', 'precio', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('plato', 'precio');
  }
};
