const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  console.log("authentication started");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedId = jwt.verify(token, process.env.JWT_SECRET);
      console.log("authentication reached here");
      console.log(`decoded : ${JSON.stringify(decodedId)}`);
      req.user = await User.findById(decodedId.id).select("-password");
      console.log("authentication finished");
      next();
    } catch (error) {
      res.status(401);
      console.log("authentication failed");
      throw new Error("Authorization failed, invalid token");
    }
  } else {
    console.log("No token!");
    throw new Error("No token");
  }
});

module.exports = { authenticate };
