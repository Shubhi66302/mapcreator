require("dotenv").config();

module.exports = {
  development: {
    username: process.env.POSTGRES_DEV_USER,
    password: process.env.POSTGRES_DEV_PASSWORD,
    database: "mapcreator_react_dev",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false
  },
  test: {
    username: process.env.POSTGRES_TEST_USER,
    password: process.env.POSTGRES_TEST_PASSWORD,
    database: process.env.POSTGRES_TEST_DB,
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false
  },
  production: {
    username: "mapcreator_user",
    password: "apj0702",
    database: "mapcreator_react",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false
  }
};
