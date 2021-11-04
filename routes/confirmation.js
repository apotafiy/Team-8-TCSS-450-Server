const express = require('express');
const pool = require('../utilities').pool;
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = {
  secret: process.env.JSON_WEB_TOKEN,
};

/**
 * @api {get} /confirmation Request to confirm a user email in the system
 * @apiName GetConfirm
 * @apiGroup confirmation
 *
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} email user email
 * @apiSuccess {String} message "You may log in now"
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "email": "fake@email.com",
 *       "message": "You may log in now"
 *     }
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 *
 */
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
      return response.status(403).json({
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
