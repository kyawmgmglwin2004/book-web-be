import dotenv from "dotenv";

dotenv.config(); // Load .env variables
console.log("Config : ", {
  PORT: process.env.PORT,
  DB_PORT: process.env.DB_PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DOMAIN: process.env.DOMAIN
})

export const config = {
  PORT: process.env.PORT,
  DB_PORT: process.env.DB_PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DOMAIN: process.env.DOMAIN,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_PASS: process.env.GMAIL_PASS,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
};
