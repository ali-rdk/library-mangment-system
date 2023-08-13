import { User } from "../../model/auth.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const SignUpController = async ({ body }, res) => {
  const userExists = await User.find({ email: body.email });
  if (userExists) return res.status(400).json({ error: "user already exists" });
  const { password, repeatPassword, ...restBody } = body;
  if (!(password === repeatPassword))
    return res
      .status(400)
      .json({ error: "password and its repetition does not match" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ ...restBody, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ massage: "user created successfully" });
};

export const SignInController = async ({ body }, res) => {
  const { password, email } = body;
  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(404).json({ error: "password or email is wrong" });

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword)
    return res.status(404).json({ error: "password or email is wrong" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);

  res.status(202).json({ massage: "signed in successfully", token: token });
};
