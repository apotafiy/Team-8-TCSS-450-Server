//express is the framework we're going to use to handle requests
const express = require('express');

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool;

const router = express.Router();

const msg_functions = require('../utilities/exports').messaging;

const validation = require('../utilities').validation;
let isStringProvided = validation.isStringProvided;

/**
 * @api {get} /contacts/:memberId Get contacts for a given memberid
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription gets a users contacts
 * 
 * @apiError (400: SQL error when searching for contacts) issue searching for contact.
 */
router.get("/:memberId", (request,response) => {
    let query = "SELECT MemberID, FirstName, LastName, Username FROM Members WHERE MemberID IN (SELECT MemberID_A FROM Contacts WHERE MemberID_B = $1 AND Verified = 1) OR MemberID IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A = $1 AND Verified = 1)"
    let values = [request.decoded.memberid]
    console.log(request.decoded.memberid)
    pool.query(query, values)
    .then(result => {
        response.send({
            rows:result.rows
        })
    })
    .catch(error => {
        response.status(400).send({
            message: "SQL Error when searching for contacts,",
            error:error
        })
    })
});


/**
 * @api {post} /contacts Add a contact to the current member
 * @apiName CreateContact
 * @apiGroup Contacts
 * 
 * @apiDescription creates a contact for the current user
 * 
 * @apiHeader {Integer} memberid of person to be added as a contact
 * 
 * @apiSuccess (Success 200) {String} Success when the token has been succesfully found by the server.
 * 
 * @apiError (401: Missing target member id) {String} Nothing has been passed in from request.headers.memberid
 * @apiError (402: MemberIDs must be a number) {String} The passed memberID was not a number as is required.
 * @apiError (403: SQL Error on insert) {String} There's been some issue on the SQL server.
 */
router.post("/", (request, response, next) => {
    if(request.body.memberid === undefined){
        response.status(401).send({
            message: "Missing target memberid."
        })
    }
    else if(isNaN(request.body.memberid)){
        response.status(402).send({
            message: "MemberIDs must be a number."
        })
    }
    else {
        next()
    }
}, (request, response, next) => {
    let query = "INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES ($1, $2)"
    let values = [request.decoded.memberid, request.body.memberid]

    pool.query(query, values)
    .then( result =>
        next()
        )
    .catch(err => {
        response.status(403).send({
            message:"SQL Error on insert."
        })
    })
}, (request, response) => {
    let query = "SELECT token FROM Push_Token WHERE memberid = $1"
    let values = [request.body.memberid]
    pool.query(query, values)
    .then(result => {
        result.rows.forEach(entry =>
            msg_functions.sendContactReqToIndividual(
                entry.token, request.body.memberid))
        response.status(200).send({
            message:"Contact request sent."
        })
    }).catch(err =>{
        response.status(403).send({
            message: "Error finding device pushy token on server."
        })
    })
});

//TODO add something for searching contacts and deleting contacts

module.exports = router