const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middlewares/file-upload");
const userControllers = require("../controllers/user-controllers");

const router = express.Router();

const { allUsers, signUp, login } = userControllers;

router.get("/", allUsers);

const checkSignupInputs = [
  check("name").notEmpty(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 6 }),
];

router.post("/signup", fileUpload.single("image"), checkSignupInputs, signUp);

router.post("/login", login);

module.exports = router;
