const secretKey = "7c3d895971f968afe0e41fa5ef78987f";

module.exports = {
    jwtSecret: process.env.JWT_SECRET || secretKey,
};