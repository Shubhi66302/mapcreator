"use strict";
module.exports = (sequelize, DataTypes) => {
  var Map = sequelize.define("Map", {
    name: DataTypes.STRING,
    map: DataTypes.JSON
  }, {});
  Map.associate = function(models) {
    // associations can be defined here
  };
  return Map;
};