const express = require('express');
const connection = require('../mySqlConnection')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const isAuthenticated = require('../auth/Authorization');

const router = express.Router();
const click = connection()

const signToken = (id_user) => {
    return jwt.sign({ id_user }, 'secretoSuperSecreto123', {
        expiresIn: 60 * 60 * 24 * 365
    })
}

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    click.query(`SELECT id_user, password, salt FROM users WHERE email= '${email}'`, {email}, (_err, user) => {
        if(!_err && user.length === 0){
            res.json({
                message: "usuario y/o contraseña incorrecta"
            })
        } else if(!_err && user) {
            crypto.pbkdf2(password, user[0].salt, 10000, 64, "sha1", (_err, key) => {
                const encriptedPassword = key.toString("base64")
                if( user[0].password === encriptedPassword ){
                    const token = signToken( user[0].id_user )
                    res.json({
                        message: "Inicio de sesión iniciado correactamente",
                        token: token,
                        status: 200
                    })
                } else {
                    res.json({
                        message: "usuario y/o contraseña incorrecta",
                        status: 404
                    })
                }
            })
        } else {
            res.json({
                message: "Algo salio mal y la verdad no se que es"
            })
        }

    })
});

router.post('/register', (req, res) => {
    const { email, username, password } = req.body;
    crypto.randomBytes(16, (_err, salt) => {
        const newSalt = salt.toString('base64')
        crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (_err, key) => {
            const encriptedPassword = key.toString('base64')
            click.query(`SELECT * FROM users where email = '${email}'`, {email}, (_err, user) => {
                if(!_err && user.length > 0){
                    res.json({
                        message: "El usuario ya existe"
                    })
                } else if(!_err && user.length === 0) {
                    click.query("INSERT INTO users SET ?", {
                        email: email,
                        username: username,
                        password: encriptedPassword,
                        salt: newSalt
                    }, (_err, resolve) => {
                        if(!_err) {
                            res.json({
                                message: "¡Usuario creado con exito!"
                            })
                        } else {
                            res.json({
                                message: "Algo salio mal al momento de crear el usuario"
                            })
                        }
                    })
                } else {
                    res.json({
                        message: "Hubo un error al momento de realizar la peticion"
                    })
                }
            })
        })
    })
})

router.get("/", isAuthenticated, (req, res) => {
    const { balance, username } = req.user

    res.json({
        balance,
        username
    })
})

module.exports = router;