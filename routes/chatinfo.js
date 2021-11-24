//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

router.use(require("body-parser").json())

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