const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middlewares/file-upload");
const checkAuth = require("../middlewares/check-auth");
const router = express.Router();

const {
  getPlaceById,
  getPlacesByUserId,
  createNewPlace,
  updatePlace,
  deletePlace,
} = placesControllers;

router.get("/:placeId", getPlaceById);

router.get("/user/:userId", getPlacesByUserId);

router.use(checkAuth);

const checkNewPlaceInputs = [
  check("title").notEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").notEmpty(),
];

router.post(
  "/",
  fileUpload.single("image"),
  checkNewPlaceInputs,
  createNewPlace
);

const checkUpdatePlaceInputs = [
  check("title").notEmpty(),
  check("description").isLength({ min: 5 }),
];

router.patch("/:placeId", checkUpdatePlaceInputs, updatePlace);

router.delete("/:placeId", deletePlace);

module.exports = router;
