//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

router.use(require("body-parser").json())

router.get("/", (request, response) => {
    let query = 'SELECT ChatID, Name FROM Chats where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1)'
    let values = [request.decoded.memberid]

    pool.query(query, values)
    .then(result => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: "No messages"
            })
        } else {
            let chatList = [];
            result.rows.forEach(entry =>
                chatList.push(
                    {
                        "chat": entry.chatid,
                        "name": entry.name
                    }
                )
            )
            response.send({
                success: true,
                chats: chatList
            })
        }
    }).catch(error => {
        response.status(400).send({
            message: "SQL Error",
            error:error
        })
    })
});

module.exports = router 