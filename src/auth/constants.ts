require('dotenv').config()
export const jwtConstants = {
    secret: process.env.AUTH_SECRET,
};