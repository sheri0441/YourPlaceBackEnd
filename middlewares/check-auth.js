const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, nex) => {
  if (req.method === "OPTIONS") {
    nex();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authorization failed!!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    nex();
  } catch (err) {
    return nex(new HttpError("Authorization failed!!", 403));
  }
};
