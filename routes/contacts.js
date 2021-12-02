//express is the framework we're going to use to handle requests
const express = require('express');

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool;

const router = express.Router();

const msg_functions = require('../utilities/exports').messaging;

const validation = require('../utilities').validation;
let isStringProvided = validation.isStringProvided;

/**
 * @api {get} contacts Get contacts and invites for a given memberid
 * @apiName GetContacts
 * @apiGroup Contacts
 *
 * @apiDescription gets a users contacts and invites
 *
 * @apiSuccess (Success 200) {Object[]} Array of contacts
 * @apiSuccess {Object[]} Array of contact invites
 *
 *
 * @apiError (500: SQL error when searching for contacts) issue searching for contact.
 */
router.get(
  '/',
  (request, response, next) => {
    // get regular verified contacts
    let query =
      'SELECT MemberID, FirstName, LastName, Username FROM Members WHERE MemberID IN (SELECT MemberID_A FROM Contacts WHERE MemberID_B = $1 AND Verified = 1) OR MemberID IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A = $1 AND Verified = 1)';
    let values = [request.decoded.memberid];
    pool
      .query(query, values)
      .then((result) => {
        body.rows = result.rows;
        next();
      })
      .catch((error) => {
        response.status(500).send({
          message: 'SQL Error when searching for contacts',
          error: error,
        });
      });
  },
  (request, response) => {
    //get users that invited
    // SELECT MemberID_A FROM Contacts WHERE MemberID_B=$1
    const query =
      'SELECT MemberID, FirstName, LastName, Username FROM Members WHERE MemberID IN (SELECT MemberID_A FROM Contacts WHERE MemberID_B=$1)';
    const values = [request.decoded.memberid];
    pool
      .query(query, values)
      .then((result) => {
        response.status(200).send({
          rows: body.rows,
          invites: result.rows,
        });
      })
      .catch((error) => {
        response.status(500).send({
          message: 'SQL Error when searching for invites',
          error: error,
        });
      });
  }
);

/**
 * @api {post} contacts Send a contact invite to another user
 * @apiName InviteContact
 * @apiGroup Contacts
 *
 * @apiDescription invites a contact for the current user
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {String} email email of user to be invited
 *
 * @apiSuccess (Success 200) {String} Success when the notification has been sent to invited user.
 *
 * @apiError (401: Missing target email) {String} Nothing has been passed in from request.headers.memberid
 * @apiError (404: Use not found) {String} The passed email does not exist.
 * @apiError (500: SQL Error on insert) {String} There's been some issue on the SQL server.
 */
router.post(
  '/',
  (request, response, next) => {
    if (!isStringProvided(request.body.email)) {
      response.status(400).send({
        message: 'Missing required information',
      });
    } else {
      next();
    }
  },
  (request, response, next) => {
    // does user exist
    const query = 'SELECT * FROM Members WHERE email = $1';
    const values = [request.body.email];
    pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          response.status(404).send({
            message: 'User not found',
          });
        } else {
          request.body.memberid = result.rows[0].memberid;
          next();
        }
      })
      .catch((error) => {
        response.status(500).send({
          message: 'SQL Error.',
        });
      });
  },
  (request, response, next) => {
    // does the contact already exists
    let query =
      'SELECT * FROM Contacts WHERE (MemberID_A = $1 AND MemberID_B = $2) OR (MemberID_B = $1 AND MemberID_A = $2)';
    let values = [request.body.memberid, request.decoded.memberid];
    pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length !== 0) {
          response.status(404).send({
            message: 'Contact already exists',
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        response.status(500).send({
          message: 'SQL Error.',
        });
      });
  },
  (request, response, next) => {
    let query = 'INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)';
    let values = [request.decoded.memberid, request.body.memberid];
    pool
      .query(query, values)
      .then((result) => next())
      .catch((err) => {
        response.status(403).send({
          message: 'SQL Error on insert.',
        });
      });
  },
  (request, response) => {
    // send pushy notification
    let query = 'SELECT token FROM Push_Token WHERE memberid = $1';
    let values = [request.body.memberid];
    pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          response.status(404).send({
            message: 'User not registered for pushy notifications',
          });
        } else {
          result.rows.forEach((entry) =>
            msg_functions.sendContactReqToIndividual(
              entry.token,
              request.body.memberid
            )
          );
          response.status(200).send({
            message: 'Contact invite sent',
          });
        }
      })
      .catch((err) => {
        response.status(403).send({
          message: 'Error finding device pushy token on server.',
        });
      });
  }
);

/**
 * @api {put} /contacts Accept a contact invite
 * @apiName AcceptContact
 * @apiGroup Contacts
 *
 * @apiDescription updates contact to verified
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 *
 * @apiParam {Integer} memberid memberid of user to that sent the contact invite
 *
 * @apiSuccess (Success 200) {String} Success when the token has been successfully found by the server.
 *
 * @apiError (400: Invalid parameter) {Integer} Parameter should be an integer
 * @apiError (404: Not found) {String} User does not exist
 * @apiError (401: Missing target email) {String} Request is missing parameters
 * @apiError (500: SQL Error on insert) {String} There's been some issue on the SQL server.
 */
router.put(
  '/',
  (request, response, next) => {
    if (request.body.memberid === undefined) {
      response.status(401).send({
        message: 'Missing target memberid',
      });
    } else if (isNaN(request.body.memberid)) {
      response.status(400).send({
        message: 'Parameter should be a number',
      });
    } else {
      next();
    }
  },
  (request, response, next) => {
    // check that user exists
    let query = 'SELECT email FROM members WHERE memberid = $1';
    let values = [request.body.memberid];
    pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          response.status(404).send({
            message: 'User does not exist',
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        response.status(500).send({
          message: 'SQL Error',
        });
      });
  },
  (request, response, next) => {
    let query =
      'SELECT * FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2';
    let values = [request.body.memberid, request.decoded.memberid];
    pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          // the contact does not exists
          response.status(404).send({
            // TODO: document
            message: 'Contact invite was never sent by the other user',
          });
        } else if (result.rows[0].verified == 1) {
          // if it already verified
          response.status(400).send({
            // TODO: document
            message: 'Contact invite was already accepted',
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        response.status(500).send({
          message: 'SQL Error on insert.',
        });
      });
  },
  (request, response) => {
    let query =
      'UPDATE Contacts SET verified = 1 WHERE MemberID_B = $1 AND MemberID_A = $2';
    let values = [request.decoded.memberid, request.body.memberid];
    pool
      .query(query, values)
      .then((result) => {
        response.status(200).send({
          message: 'Contact has been updated successfully',
        });
      })
      .catch((err) => {
        response.status(500).send({
          message: 'SQL Error on insert.',
        });
      });
  }
);

//TODO: add something for deleting contacts

module.exports = router;
