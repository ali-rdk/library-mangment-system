import { User } from "../../model/auth.mjs";
import bcrypt from "bcrypt";

export const SignInController = async ({ body }, res) => {
  const userExists = await User.find({ email: body.email });
  if (!userExists)
    return res.status(400).json({ error: "user already exists" });
  const { password, repeatPassword, ...restBody } = body;
  if (!(password === repeatPassword))
    return res
      .status(400)
      .json({ error: "password and its repetition does not match" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ ...restBody, password: hashedPassword });
  await newUser.save();
  console.log(newUser);
  res.status(201).json({ massage: "user created successfully" });
};
