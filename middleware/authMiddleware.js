const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "user-password-hw04");

    const user = await User.findOne({
      _id: decoded.userId,
      token: token,
    });

    if (!user) {
      throw new Error("Not authorized");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;
