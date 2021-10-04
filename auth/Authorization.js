const jwt = require("jsonwebtoken");
const connection = require('../mySqlConnection');
const click = connection();

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
    res.sendStatus(403);
    } else {
        jwt.verify(token, 'secretoSuperSecreto123', (_err, decoded) => {
            if(!_err){
                const { id_user } = decoded
                click.query(`SELECT id_user, balance, username FROM users WHERE id_user = ${ id_user }`, { id_user }, (_err, user) => {
                    if(!_err){
                        req.user = user[0];
                        next()
                    } else {
                        console.log('No existe el usuario')
                    }
                })
            } else {
                console.log("token incorrecto");
            }
        })
    }
}

module.exports = isAuthenticated
