import { User } from "../../model/auth.mjs";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";

export const SignUpController = async ({ body }, res) => {
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
  const newUser = new User({
    ...restBody,
    password: hashedPassword,
    roles: "basic",
  });
  await newUser.save();

  res.status(201).json({ massage: "user created successfully" });
};

export const SignInController = async ({ body, cookies }, res) => {
  try {
    const user = await User.findOne({ username: body.username });
    // return res.json(user);
    if (!user)
      return res
        .status(401)
        .json({ error: "password and username are required" });

    const comparePassword = await bcrypt.compare(body.password, user.password);
    if (!comparePassword)
      return res.status(401).json({ error: "password or username is wrong" });
    const { userPassword, ...restUser } = user;

    const accessToken = jwt.sign(
      { ...restUser },
      process.env.ACCESS_SECRET_KEY,
      {
        expiresIn: "20s",
      }
    );
    const newRefreshToken = jwt.sign(
      { ...restUser },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "40s" }
    );

    // let newRefreshTokenArray = !cookies?.refreshToken ? user.refreshToken : user.refreshToken.filter(token => token !== cookies.refreshToken)
    let newRefreshTokenArray = [];
    if (cookies?.refreshToken) {
      const foundToken = await User.find({
        refreshToken: cookies.refreshToken,
      });

      if (foundToken)
        newRefreshTokenArray = user.refreshToken.filter(
          (token) => token !== cookies.refreshToken
        );
    } else {
      newRefreshTokenArray = user.refreshToken;
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expiresIn: 24 * 60 * 60 * 1000,
    });
    res
      .status(202)
      .json({ massage: "signed in successfully", accessToken: accessToken });
  } catch (error) {
    console.log(error);
  }
};

export const SignOutController = async ({ cookies }, res) => {
  if (!cookies.refreshToken) return res.sendStatus(204);

  const user = await User.findOne({ refreshToken: cookies.refreshToken });
  if (!user) {
    res.clearCookie("refresh", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }

  user.refreshToken = user.refreshToken.filter(
    (token) => token !== cookies.refreshToken
  );
  await user.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.sendStatus(204);
};

export const refreshTokenController = async ({ cookies }, res) => {
  try {
    if (!cookies?.refreshToken) return res.sendStatus(401);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    const user = await User.findOne({ refreshToken: cookies.refreshToken });
    if (!user) {
      jwt.verify(
        cookies.refreshToken,
        process.env.REFRESH_SECRET_KEY,
        async (err, decoded) => {
          if (err) return res.status(403).json({ err: err });
          const hackedUser = await User.findOne(decoded);
          hackedUser.refreshToken = [];
          await hackedUser.save();
        }
      );
      return res.sendStatus(403);
    }

    const newRefreshTokenArray = user.refreshToken.filter(
      (token) => token !== cookies.refreshToken
    );

    jwt.verify(
      cookies.refreshToken,
      process.env.REFRESH_SECRET_KEY,
      async (err, decoded) => {
        if (err) {
          user.refreshToken = [...newRefreshTokenArray];
          await user.save();
        }

        console.log(decoded._doc.username);
        if (user.username !== decoded._doc.username) {
          return res.status(403).json({ err: err });
        }

        const accessToken = jwt.sign(decoded, process.env.ACCESS_SECRET_KEY);
        const newRefreshToken = jwt.sign(
          decoded,
          process.env.REFRESH_SECRET_KEY
        );

        user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await user.save();

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 50000,
        });

        res.json({ accessToken: accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
