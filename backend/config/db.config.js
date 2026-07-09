require("dotenv").config();

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
  port: Number(process.env.DB_PORT || 3306),
  tablePrefix: process.env.DB_TABLE_PREFIX || "",
};
