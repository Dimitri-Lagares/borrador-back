const express = require('express');
const mysql = require('mysql');

const bodyParser = require('body-parser');
const { request } = require('http');
const { error } = require('console');

const PUERTO = process.env.PORT || 3055;

const app = express();

// let cors = require("cors");
// app.use(cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'login',
})

connection.connect(error => {
    if (error) throw error;
    console.log('Base de datos corriendo')
})

app.get('/', (request, response) => {
    response.send('App Running')
});

app.post('/inicio-sesion', (request, response) => {

    const {user, password} = request.body
    const values = [user, password]
    connection.query('SELECT * FROM login WHERE user =? AND password =?', values, (error, result) => {
        if (error) {
            response.status(500).send(error)
        } else {
            if (result.length > 0) {
                response.status(200).send({
                    // user: result[0].user,
                    // password: result[0].password
                })
    
            } else {
                response.status(401).send('Usuario o contraseña incorrectos')
            }
        }
    })
})

app.listen(PUERTO, ()=> console.log(`Servidor corriendo en el puerto '${PUERTO}'`));
