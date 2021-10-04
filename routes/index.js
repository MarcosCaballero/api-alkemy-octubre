const express = require('express'); 
const router = express.Router();


router.get('/home', (req, res, next) => { 
    res.render('index', {title: '¿Hoy que comiste?'})
})


module.exports = router;