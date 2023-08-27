import { model, Schema } from "mongoose";
import yup, { string } from "yup";
import { ROLES } from "./roles.mjs";

export const SignUpRequestSchema = yup.object({
  body: yup
    .object({
      username: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      repeatPassword: yup.string().required(),
    })
    .required(),
});

export const SingInRequestSchema = yup.object({
  body: yup
    .object({
      email: yup.string().email().required(),
      password: yup.string().required(),
    })
    .required(),
});

const UserSchema = Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: [String],
  roles: { type: String, enum: [ROLES.BASIC, ROLES.LIBRARIAN, ROLES.ADMIN] },
});

export const User = model("User", UserSchema);
