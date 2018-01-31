const express = require('express');
const credentials = require('./sgtcreds');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const server = express();

server.use(bodyParser.urlencoded({ extended: false }));
server.use( bodyParser.json() );

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.get('/student', function(req, res){
    const db = mysql.createConnection(credentials);
    const sql = "SELECT name, course, grade, id FROM students";

    console.log(req);

    db.query(sql, function(error, results, fields){
        const output = {
            success: true,
            data: [],
            errors: []
        };

        if (!error) {
            output.success = true;
            output.data = results;
        } else {
            output.error = error;
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    });
});

server.post('/studentcreate', function(req, res){
    const db = mysql.createConnection(credentials);
    const sql = `INSERT INTO students SET name = '${name}', course = '${course}', grade = '${grade}'`;
    const {name, course, grade} = req.body;

    db.query(sql, (error, results, fields) => {
        const output = {
            success: true,
            data: [],
            errors: [],
            new_id: ''
        };

        if (!error) {
            output.success = true;
            output.new_id = results.insertId
        } else {
            output.error = error;
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    });
});

server.post('/studentdelete', function(req, res){
    const db = mysql.createConnection(credentials);
    const sql = `DELETE FROM students WHERE id=${req.body.student_id}`;

    db.query(sql, function(error, results, field){
        let output = {
            success: false,
            data: [],
            errors: []
        };

        if (!error) {
            output.success = true;
            output.data.push(results);
        } else {
            output.error = error;
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    });
});

server.listen(3000, function(){
    console.log('server is running on PORT 3000');
});


