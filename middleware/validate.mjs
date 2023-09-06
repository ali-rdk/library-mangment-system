import jwt from "jsonwebtoken";

export const RequestValidator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err) {
      return res.status(500).json({ type: err.name, message: err.message });
    }
  };
};

export const tokenValidate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const accessToken = authHeader.split(" ")[1];
  jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ msg: err });
    req.user = decoded;
    next();
  });
};

export const roleValidate = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(401);
    next();
  };
};
