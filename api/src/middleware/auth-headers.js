const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require('../../env.js');
const Sessions = require('../models/token.js')

module.exports = function(req, res, next) {
    if (req.body.headers && req.body.headers.authorization) {
        jwt.verify(req.body.headers.authorization, ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                findSessionByToken(req.body.headers.authorization).then((candidate, error) => {
                    if (!error) {
                        deleteSession(candidate)
                        res.json({status: 401, message: 'Access denied'})
                        if (!req.body.headers.skip) {
                            next()
                        }
                    } else {
                        res.json({status: 401, message: 'Access denied'})
                        if (!req.body.headers.skip) {
                            next()
                        }
                    }
                })
            } else if (payload) {
                findUser(payload).then((candidate) => {
                    if (!candidate) {
                        res.json({status: 401, message: 'Not auth'})
                        next()
                    } else {
                        if (!req.body.headers.skip) {
                            res.json({status: 200, message: 'Auth OK'})
                        }
                        next()
                    }
                })
            }
        })
    }

  //  next()
}

async function findUser(payload) {
    return await Sessions.findOne({ user: {email: payload.useremail} })
}

async function findSessionByToken(token) {
    try {
        return await Sessions.findOne({ jwtToken: token })
    } catch (error) {
        return error
    }
}

async function deleteSession(session) {
    try {
        return await Sessions.deleteOne({_id: session._id})
    } catch (error) {
        return error
    }
}