import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000';
export const config_env = { PORT, NODE_ENV,IDENTITY_SERVICE_URL,REDIS_URI };