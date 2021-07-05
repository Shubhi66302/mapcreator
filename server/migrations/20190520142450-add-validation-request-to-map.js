'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
          'Maps', 
          'validationRequested', 
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
      ),
      queryInterface.addColumn(
          'Maps', 
          'sanity', 
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
