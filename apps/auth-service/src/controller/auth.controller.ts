
import { NextFunction, Request, Response } from "express";
import { validateRegistrationData, checkOtpRestrictions , trackOtpRequests, sendOtp} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";


export const userRegistration = async (
    req:Request, 
    res:Response, 
    next:NextFunction
) => {
    try{
         validateRegistrationData(req.body, "user");
    const { name, email} = req.body;

    const existingUser = await prisma.users.findUnique({where: {email}}) // Replace with actual DB check

    if(existingUser) {
        return next(new ValidationError("user already exists with this email"));
    };

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail")
    res.status(200).json({
        message: "OTP sent to email. please verify your account",
        success: true
    });
} catch (error) {
        return next(error);
    }
};
