function convertDaily(day) {
  delete day.moonset;
  delete day.moonrise;
  delete day.moon_phase;
  delete day.dew_point;
  delete day.wind_gust;
  delete day.pop;
  delete day.temp.night;
  delete day.temp.morn;
  delete day.temp.event;
}

function convertHourly(hour) {
  delete hour.dew_point;
  delete hour.wind_gust;
  delete hour.pop;
}

function convertWeather(weather) {
  // TODO: how to deal with timezone?
  // TODO: will api return weather at time of timezone or at time of api source
  weather.hourly.splice(24); // only want first 24 hours
  const myWeather = {
    current: weather.current,
    hourly: weather.hourly,
    daily: weather.daily,
  };

  myWeather.hourly.forEach((hour) => {
    convertHourly(hour);
  });
  myWeather.daily.forEach((day) => {
    convertDaily(day);
  });

  return myWeather;
}

module.exports = convertWeather;
