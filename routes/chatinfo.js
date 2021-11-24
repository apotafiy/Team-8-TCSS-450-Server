//express is the framework we're going to use to handle requests
const express = require('express');

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool;

const router = express.Router();

const msg_functions = require('../utilities/exports').messaging;

const validation = require('../utilities').validation;
let isStringProvided = validation.isStringProvided;


/**
 * @api {get} /chatinfo
 * @apiName GetChats
 * @apiGroup chatinfo
 *
 * @apiDescription gets a users chats
 *
 * @apiError (400: SQL error when searching for contacts) issue searching for contact.
 */
router.get("/", (request, response) => {
    let query = 'SELECT ChatID, Name FROM Chats where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1)'
    let values = [request.decoded.memberid];
    console.log(request.decoded.memberid);
    pool
      .query(query, values)
      .then((result) => {
        response.send({
          rows: result.rows,
        });
      })
      .catch((error) => {
        response.status(400).send({
          message: 'SQL Error when searching for contacts,',
          error: error,
        });
      });
  });

module.exports = router 