import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'FJGBVXFDJKBVHFDLGVBKUDFSVBKJHDFVHJKDGFVJHKDFGHVKJGDKHJFGVLKJFTGHKHJGKLDHGLKDHFGHKGDVHJDJKHFVBKDFGKJHDFGDDGD';
const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://localhost:6000';
const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:7000';
export const config_env = { PORT, NODE_ENV,IDENTITY_SERVICE_URL,REDIS_URI,JWT_SECRET_KEY,POST_SERVICE_URL,MEDIA_SERVICE_URL };