import Router from "express";
import { RequestValidator } from "../../middleware/validate.mjs";
import { SignInRequestSchema } from "../../model/auth.mjs";
import { SignInController } from "../../controller/auth/index.mjs";

export const AuthRoutes = Router();

AuthRoutes.post(
  "/sign-in",
  RequestValidator(SignInRequestSchema),
  SignInController
);
