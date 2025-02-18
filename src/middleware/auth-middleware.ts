import { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import jwt from "jsonwebtoken"
import { StatusCodes } from 'http-status-codes';
import { errorResponse } from '../utils/common/error-response';

export const validateAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    config.logger.warn("Access attempt without valid token!");
    errorResponse.message = "Authentication required";
    errorResponse.success = false;
    errorResponse.error.message = "Unauthorized";
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }

  console.log(token)
  jwt.verify(token, config.config_env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      config.logger.warn("Invalid token!");
      return res.status(429).json({
        message: "Invalid token!",
        success: false,
      });
    }

    req.user = user;
    next();
  });
};