const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const app = express();

const { request } = require('http');
const { error } = require('console');

const PUERTO = process.env.PORT || 3055;


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
    database: 'db',
})

connection.connect(error => {
    if (error) throw error;
    console.log('Base de datos corriendo')
})

app.get('/', (request, response) => {
    response.send('App Running')
});

app.get('/formulario', (req, res) => {
    const sql = 'SELECT * FROM formulario';

    connection.query(sql, (error, results) => {
        if(error) throw error;
        if(results.length > 0){
            res.json(results);
        }else{
            res.send('Not result');
        }
    });
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
                })
    
            } else {
                response.status(401).send('Usuario o contraseña incorrectos')
            }
        }
    })
})

app.post('/enviar-formulario', (request, response) => {
    connection.query('INSERT INTO formulario SET ?', request.body, (error, result) => {
        if (error) throw error;
        response.send('Informacion registrada exitosamente');
    });
});

app.put('/actualizar/:id', (request, response) => {
    const id = request.params.id;
    connection.query('UPDATE formulario SET ? WHERE idformulario = ?', [request.body, id], (error, result) => {
        if (error) throw error;
        response.send('Actualizado exitosamente');
    });
});

app.delete('/eliminar-fila/:idformulario', async(req, res) => {
    const id = req.params
    const sql = `DELETE FROM formulario WHERE idformulario = ${id.idformulario}`

    await connection.query(sql, error => {
      if (error) throw error

      res.send('Eliminado correctamente')
    })
})

app.listen(PUERTO, ()=> console.log(`Servidor corriendo en el puerto '${PUERTO}'`));

app.get('/jwt', (req, res) =>{
    res.json({
        text : 'Api corriendo correctamente'
    })
} )

app.post(('/jwt/login'), (req,res) => {
    const user = {id:1}
    const token = jwt.sign({user}, 'my_secret_key')
    res.json(token)
})

//const Token = (req, res, next) => {
//    const header = req.headers['authorization']
//    console.log(header);
//    if (typeof header != 'undefined'){
//        const portador = header.split(" ")
//        console.log(portador);
//        next()    
//    }  
    // const token = req.headers['x-access-token'] || req.headers['authorization']
    // if (token) {
    //     jwt.verify(token,'my_secret_key', (err, data) => {
    //         if (err) {
    //             res.status(401).send('No autorizado')
    //         } else {
    //             req.token = token
    //             next()
    //         }
    //     })
    // } else {
    //     res.status(403).send('No autorizado')
    // }
//}

const correctToken = (req,res,next)=> {
    const header = req.headers['authorization']
    if(typeof header !== 'undefined'){
        const portador = header.split(" ")
        const portadorToken = portador[1]
        req.token = portadorToken
        next()
    } else {
        res.sendStatus(403)
    }
}

 app.get('/jwt/protected', correctToken,(req,res) => {

    jwt.verify(req.token,'my_secret_key', (err, data) => {
        if (err) {
            res.status(401).send('No autorizado')
        } else {
            res.json(data);
        }
    })
})