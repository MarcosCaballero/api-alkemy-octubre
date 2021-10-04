const express = require('express');
const cookieParser = require('cookie-parser')
const mysql = require("mysql"); 
const cors = require("cors")

const operaciones = require('./routes/operaciones');
const auth = require("./routes/auth")
const user = require('./routes/user')

const port = process.env.PORT || 3500 

const app = express();
app.use(express.urlencoded({extended: false})); 
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({
        mensaje: "Hola mundo soy un mensaje"
    })
});

app.use("/api/user", user);
app.use("/api/operaciones", operaciones);
app.use("/api/auth", auth);

app.listen(port, (req, res) => {
    console.log("Server running on port " + port)
});

module.exports = app;
