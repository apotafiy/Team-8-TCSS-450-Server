const express = require('express');
const pool = require('../utilities').pool;
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = {
  secret: process.env.JSON_WEB_TOKEN,
};

router.get('/', (request, response) => {
  const token = request.query.token;
  // error if it does not have a token arg
  if (token == undefined || token == null) {
    return response.status(400).send({
      // TODO: documentation
      message: 'Missing required information',
    });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    // error if token is invalid
    if (err) {
      return res.status(403).json({
        // TODO: documentation
        success: false,
        message: 'Token is not valid',
      });
    } else {
      // change DB
      const theQuery = 'UPDATE Members SET Confirmed=$1 WHERE Email=$2';
      const args = [true, decoded.email];
      pool
        .query(theQuery, args)
        .then(() => {
          response.status(200).send({
            // TODO: documentation
            success: true,
            email: decoded.email,
            message: 'You may log in now',
          });
        })
        .catch((err) => {
          response.status(500).send({
            // TODO: documentation
            message: 'Server error',
          });
        });

      // decoded is the payload of the JWT
      // i think  you only get the email here
    }
  });
});

module.exports = router;
