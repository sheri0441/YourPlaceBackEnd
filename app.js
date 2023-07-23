const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const placeRoutes = require("./routes/place-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");
const path = require("path");

const app = express();

app.use(express.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, nex) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE");

  nex();
});

app.use("/api/places", placeRoutes);

app.use("/api/users", userRoutes);

app.use((req, res, nex) => {
  const error = new HttpError("Route not found", 404);
  throw error;
});

app.use((err, req, res, nex) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return nex(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An unknown err occured" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@bookstore.mubs3rs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));
