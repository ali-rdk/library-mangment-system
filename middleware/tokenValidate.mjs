import jwt from "jsonwebtoken";

export const tokenValidate = ({headers}, res, next) => {
    const authHeader = headers['authorization']
    // console.log(authHeader)
    const accessToken = authHeader.split(" ")[1]
    jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
        if (err) return res.sendStatus(403)
        // console.log(decoded)
        next()
    })

}