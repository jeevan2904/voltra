import crypto from 'crypto';
import { NextFunction } from 'express';

import redis from '@/packages/libs/redis';
import { ValidationError } from '@/packages/error-handler';
import { sendEmail } from './sendMail';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validate the User Provided Data
export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing Required Fields!`);
  }

  // If Email Pattern is incorrect
  if (emailRegex.test(email)) {
    throw new ValidationError(`Invalid Email Format!`);
  }
};

// Validating Different OTP Restrictions
export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`))
    return next(
      new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 30 mins.'
      )
    );

  if (await redis.get(`otp_spam_lock:${email}`))
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait for 60 min before requesting again.'
      )
    );

  if (await redis.get(`otp_cooldown:${email}`))
    return next(
      new ValidationError('Please wait for 1 min before requesting a new OTP!')
    );
};

// Track OTP Requests for user/seller
export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;

  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests > 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // Locked for 1 hour

    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600); // Track requests for 1 hour
};

// Send OTP to the Email
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, 'Verify Your Email', template, { name, otp });

  await redis.set(`otp:${email}`, otp, 'EX', 300);

  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};
