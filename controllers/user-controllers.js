const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const isValid = require("../util/isValid");
const jwt = require("jsonwebtoken");

const allUsers = async (req, res, nex) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return nex(new HttpError("Something went wrong, try again.", 500));
  }

  res.json({
    usersList: users.map((singleUser) =>
      singleUser.toObject({ getters: true })
    ),
  });
};

const signUp = async (req, res, nex) => {
  isValid(req, nex);

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return nex(new HttpError("Something went wrong, try again.", 500));
  }

  if (existingUser) {
    return nex(new HttpError("User already exists, please login.", 422));
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return nex(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new User({
    name,
    email,
    password: hashPassword,
    places: [],
    image: req.file.path,
  });

  try {
    await newUser.save();
  } catch (err) {
    return nex(new HttpError("Could not save user, please try again.", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return nex(new HttpError("Could not save user, please try again.", 500));
  }

  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, nex) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return nex(new HttpError("Something went wrong, try again.", 500));
  }

  if (!existingUser) {
    return nex(new HttpError("Invalid credential, try again", 403));
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return nex(new HttpError("Cloud not login, Please try again", 500));
  }

  if (!isPasswordValid) {
    return nex(new HttpError("Invalid credential, try again", 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return nex(new HttpError("Could not log In, please try again.", 500));
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

module.exports = {
  allUsers,
  signUp,
  login,
};
