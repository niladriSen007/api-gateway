import { NextFunction } from 'express';
import cors from 'cors'; // Import the cors middleware
import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';
import { RedisReply, RedisStore } from 'rate-limit-redis';
import { config } from './config';
import { errorResponse } from './utils/common/error-response';
import proxy from "express-http-proxy"
import { errorHandler } from './middleware/error-handler';
import { IncomingMessage } from 'http';


const { config_env } = config;
const { PORT, NODE_ENV, REDIS_URI, IDENTITY_SERVICE_URL } = config_env;


const app = express();


app.use(helmet());
app.use(cors({
  origin: '*'
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisClient = new Redis(REDIS_URI);

//Ip based rate limiter for sensitive routes
const sensitiveRoutesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    config.logger.error(`Too many requests from IP so rate limit exceeded from Express rate limiter: ${req?.ip}`)
    errorResponse.message = "Too many requests"
    errorResponse.error.message = "Too many requests"
    errorResponse.error.status = StatusCodes.TOO_MANY_REQUESTS
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(errorResponse)
  },
  store: new RedisStore({
    sendCommand: async (...args: [command: string, ...args: string[]]): Promise<RedisReply> => {
      const result = await redisClient.call(...args);
      return result as RedisReply;
    },
    prefix: 'rate-limit:'
  }),
})

app.use(sensitiveRoutesLimiter)

app.use((req, res, next) => {
  config.logger.info(`Received ${req.method} request to ${req.url}`);
  config.logger.info(`Request body, ${req.body}`);
  next();
});


//Proxy to the services
const proxyOptions = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, "/api/v1");
  },
  proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
    config.logger.error(err.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      error: err.message
    })
  }
}
//setting up proxy for our identity service
app.use("/v1/auth", proxy(IDENTITY_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq: Request) => {
    proxyReqOpts.headers["x-forwarded-host"] = "api-gateway";
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes: IncomingMessage, proxyResData: any, userReq: Request, userRes: Response) => {
    config.logger.info(`Response from identity service, ${proxyResData}`);
    return proxyResData;
  }
}))


app.use(errorHandler)


app.listen(PORT, () => {
  config.logger.info(`Server running on port ${PORT}`)
  config.logger.info(`Identity service running on ${IDENTITY_SERVICE_URL}`)
})