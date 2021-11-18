const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const validation = require('../utilities').validation;
const isStringProvided = validation.isStringProvided;

const convert = require('../utilities/weatherUtils');

/**
 * @api {get} weather Request weather data
 * @apiName GetWeather
 * @apiGroup Weather
 *
 * @apiDescription Retrieves weather data from given coordinates
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {String} lat latitude
 * @apiParam {String} lon longitude
 *
 * @apiSuccess {Object} current the current weather data
 * @apiSuccess {Object[]} hourly the hourly weather data for the next 48 hours
 * @apiSuccess {Object[]} daily the daily weather data for the next 7 days
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. Latitude and longitude must be numbers."
 * @apiError (500: Server Error) {String} message "Server error"
 * @apiError (500: Server Error) {String} message "Server error. Could not parse weather data"
 *
 *
 */
router.get(
  '/',
  (request, response, next) => {
    // parameters/arguments not provided
    if (
      !isStringProvided(request.body.lat) ||
      !isStringProvided(request.body.lon)
    ) {
      response.status(400).send({
        message: 'Missing required information',
      });
    } else if (isNaN(request.body.lat) || isNaN(request.body.lon)) {
      // invalid lat and lon
      response.status(400).send({
        message: 'Malformed parameter. Latitude and longitude must be numbers.',
      });
    } else {
      next();
    }
  },
  (request, response, next) => {
    const URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${request.body.lat}&lon=${request.body.lon}&exclude=minutely&units=imperial&appid=${process.env.WEATHER_API_KEY}`;

    fetch(URL)
      .then((result) => result.json())
      .then((result) => {
        console.log(result);
        request.weather = result;
        next();
      })
      .catch((err) => {
        console.error(err);
        // TODO: documentation
        response.status(500).send({
          message: 'Server error',
        });
      });
  },
  (request, response) => {
    if (
      request.weather == undefined ||
      request.weather.current == undefined ||
      request.weather.hourly == undefined ||
      request.weather.daily == undefined
    ) {
      response.status(500).send({
        message: 'Server could not get weather data',
      });
    } else {
      try {
        const weather = convert(request.weather);
        response.status(200).json(weather);
      } catch (err) {
        response.status(500).send({
          message: 'Server error. Could not parse weather data',
        });
      }
    }
  }
);

module.exports = router;
