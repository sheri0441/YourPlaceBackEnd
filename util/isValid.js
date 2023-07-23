const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const isValid = (req, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return next(new HttpError("invalid input, validation fail.", 422));
  }
};

module.exports = isValid;
