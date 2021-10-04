const express = require('express');
const jwt = require('jsonwebtoken');

const Authorization = require("../auth/Authorization")

const router = express.Router();

router.post("/register", async (req, res) => {
  
  const user = await {
    username: req.body.username,
    email: req.body.email,
  }
  
  // const user = {
  //   id: 1,
  //   username:"Marcos", 
  //   email: "MarcosCaballero150501@gmail.com",
  // }

  // jwt.sign({user}, "supersecreto", {expiresIn: "60s" }, (err, token) => {
  //   res.json({
  //     token,
  //   })
  // })


  res.json(user)
})

router.post("/login", Authorization, (req, res) => {

  jwt.verify(req.token, "supersecreto", (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        mensaje: "Post fue creado",
        authData,
      })
    }
  })
  
})

module.exports = router;