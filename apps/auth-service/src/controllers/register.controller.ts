import { NextFunction, Request, Response } from 'express';

import prisma from '@/packages/libs/prisma';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from '../utils/auth.helper';
import { ValidationError } from '@/packages/error-handler';

// Register a New User
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ email });

    if (existingUser)
      return next(new ValidationError(`User already exists with this email!`));

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);

    await sendOtp(name, email, 'user-activation-mail');

    res
      .status(200)
      .json({ message: 'OTP sent to mail. Please verify your account!' });
  } catch (error) {
    return next(error);
  }
};
