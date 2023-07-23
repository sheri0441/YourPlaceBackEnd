const axios = require("axios");

const getCoordinatesFromAddress = async (address) => {
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`;

  const response = await axios.get(url);
  const result = response.data[0];
  const { lat, lon } = result;
  const coordinates = { lat: lat, lng: lon };
  return coordinates;
};

module.exports = getCoordinatesFromAddress;
