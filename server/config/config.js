// using different path since call to `npm migrate` is run in server directory, not root
require("dotenv").config({ path: "../.env" });
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
    // using connection uri for prod since that is directly supported in dokku
    // eg. DATABASE_URL=postgres://user:password@host:port/dbname
    // http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
    use_env_variable: "DATABASE_URL"
  }
};
