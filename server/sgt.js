const express = require('express');
const credentials = require('./sgtcreds');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const server = express();
const db = mysql.createConnection(credentials);

server.use(bodyParser.urlencoded({ extended: false }));
server.use( bodyParser.json() );

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.get('/student', (req, res) => {
    const sql = "SELECT name, course, grade, id FROM students";

    db.query(sql, function(error, results, fields){
        const output = {
            success: false,
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

server.post('/studentcreate', (req, res) => {
    const {name, course, grade} = req.body;
    const sql = `INSERT INTO students SET name = '${name}', course = '${course}', grade = '${grade}'`;

    db.query(sql, (error, results, fields) => {
        const output = {
            success: false,
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

server.post('/studentupdate', (req, res) => {
    const {name, course, grade, id} = req.body;
    const sql = `UPDATE students SET name='${name}', course='${course}', grade=${grade} WHERE id=${id}`;

    db.query(sql, (error, results) => {
        const output = {
            success: false,
            errors: []
        };

        if (!error) {
            output.success = true;
        } else {
            output.error = error;
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    })
})

server.post('/studentdelete', (req, res) => {
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


