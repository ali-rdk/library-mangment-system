import { Schema, model } from "mongoose";
import yup from "yup";

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
});

export const User = model("User", UserSchema);
