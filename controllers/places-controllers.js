const HttpError = require("../models/http-error");
const fs = require("fs");
const isValid = require("../util/isValid");
const getCoordinatesFromAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getPlaceById = async (req, res, nex) => {
  const placeId = req.params.placeId;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place",
      500
    );
    return nex(error);
  }

  if (!place) {
    const error = new HttpError("Place could not found", 404);
    return nex(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, nex) => {
  const userId = req.params.userId;

  let placeList;

  try {
    placeList = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find data",
      500
    );
    return nex(error);
  }

  if (!placeList || placeList.length === 0) {
    const error = new HttpError("No Place added by this creator", 404);
    return nex(error);
  }
  res.json({
    placeList: placeList.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createNewPlace = async (req, res, nex) => {
  isValid(req, nex);

  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch {
    return nex(new HttpError("Could not get coordinates, invalid address."));
  }

  const createPlace = new Place({
    title,
    description,
    location: coordinates,
    creator: req.userData.userId,
    address,
    image: req.file.path,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return nex("creating place failed, try again", 500);
  }

  if (!user) {
    return nex(new HttpError("User of provided Id not found.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({ session: sess });
    user.places.push(createPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("create place failed, try again", 500);
    return nex(error);
  }

  res.status(201).json({ place: createPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, nex) => {
  isValid(req, nex);

  const placeId = req.params.placeId;
  const { title, description } = req.body;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not find place.",
      500
    );
  }

  if (place.creator.toString() !== req.userData.userId) {
    return nex(new HttpError("You are not authorized to edit this post.", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not save place.",
      500
    );
  }

  res.status(200).json({ updatePlace: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, nex) => {
  const placeId = req.params.placeId;

  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not find place to delete",
      500
    );
    return nex(error);
  }

  if (!place) {
    return nex(
      new HttpError("Cloud not find the place of give Id for delete", 404)
    );
  }

  if (place.creator.id !== req.userData.userId) {
    return nex(
      new HttpError("You are not authorized to delete this post.", 401)
    );
  }

  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return nex(
      new HttpError("something went wrong, could not delete place.", 500)
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: "place deleted" });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createNewPlace,
  updatePlace,
  deletePlace,
};
