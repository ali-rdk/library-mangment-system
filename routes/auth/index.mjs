import Router from "express";
import { RequestValidator } from "../../middleware/validate.mjs";
import { SignUpRequestSchema, SingInRequestSchema } from "../../model/auth.mjs";
import {
  SignInController,
  SignUpController,
} from "../../controller/auth/index.mjs";

export const AuthRoutes = Router();

AuthRoutes.post(
  "/sign-up",
  RequestValidator(SignUpRequestSchema),
  SignUpController
);

AuthRoutes.post(
  "/sign-in",
  RequestValidator(SingInRequestSchema),
  SignInController
);
