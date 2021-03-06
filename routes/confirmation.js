const express = require('express');
const pool = require('../utilities').pool;
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = {
  secret: process.env.JSON_WEB_TOKEN,
};

/**
 * @api {get} confirmation Request to confirm a user email in the system
 * @apiName GetConfirm
 * @apiGroup Confirmation
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
 * @apiError (403: Invalid Token) {String} message "Token is not valid"
 *
 * @apiError (500: Server Error) {String} message "Server error"
 *
 */
router.get('/', (request, response) => {
  const token = request.query.token;
  // error if it does not have a token arg
  if (token == undefined || token == null) {
    return response.status(400).send({
      message: 'Missing required information',
    });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    // error if token is invalid
    if (err) {
      return response.status(403).json({
        success: false,
        message: 'Token is not valid',
      });
    } else {
      const theQuery = 'UPDATE Members SET Confirmed=$1 WHERE Email=$2';
      const args = [true, decoded.email];
      pool
        .query(theQuery, args)
        .then(() => {
          response.status(200).send({
            success: true,
            email: decoded.email,
            message: 'You may log in now',
          });
        })
        .catch((err) => {
          response.status(500).send({
            message: 'Server error',
          });
        });
    }
  });
});

module.exports = router;
