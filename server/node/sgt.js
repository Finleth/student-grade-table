const express = require('express');
const credentials = require('/../sgtcreds/sgtcreds');
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
            output.error.push('There was an error on the server. Try again.');
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    });
});

server.post('/studentcreate', (req, res) => {
    const {name, course, grade} = req.body;

    const output = {
        success: false,
        data: [],
        errors: []
    };

    if ( !name.match(/^[a-zA-Z ]{2,20}$/) ){
        output.errors.push('Name must be between 2 and 20 characters long and can contain only letters and spaces.');
    }
    if ( !course.match(/^[a-zA-Z ]{2,25}$/) ){
        output.errors.push('Course must be between 2 and 25 characters long and can contain only letters and spaces.');
    }
    if ( !grade.match(/^\d{1,2}$|100/) ){
        output.errors.push('Grade must be an integer between 0 and 100.');
    }

    if ( !output.errors[0] ){
        const sql = `INSERT INTO students SET name = ?, course = ?, grade = ?`;
        const inputs = [name, course, grade];

        db.query(sql, inputs, (error, results, fields) => {

            if (!error) {
                output.success = true;
                output.new_id = results.insertId
            } else {
                output.error.push('There was an error on the server. Try again.');
            }
            const json_output = JSON.stringify(output);
            res.send(json_output)
        });
    } else {
        const json_output = JSON.stringify(output);
        res.send(json_output)
    }
});

server.post('/studentupdate', (req, res) => {
    const {name, course, grade, id} = req.body;

    const output = {
        success: false,
        data: null,
        errors: []
    };

    if ( !name.match(/^[a-zA-Z ]{2,20}$/) ){
        output.errors.push('Name must be between 2 and 20 characters long and can contain only letters and spaces.');
    }
    if ( !course.match(/^[a-zA-Z ]{2,25}$/) ){
        output.errors.push('Course must be between 2 and 25 characters long and can contain only letters and spaces.');
    }
    if ( !grade.match(/^\d{1,2}$|100/) ){
        output.errors.push('Grade must be an integer between 0 and 100.');
    }

    if (!output.errors[0] ){
        const sql = `CALL updateStudent('${name}', '${course}', ${grade}, ${id})`;

        db.query(sql, (error, results) => {
            if (!error) {
                output.success = true;
                output.data = results[0];
            } else {
                output.errors.push('There was an error on the server. Try again.');
            }

            const json_output = JSON.stringify(output);
            res.send(json_output)
        })
    } else {
        const json_output = JSON.stringify(output);
        res.send(json_output)
    }
})

server.post('/studentdelete', (req, res) => {
    const sql = `DELETE FROM students WHERE id = ?`;
    const input = req.body.student_id

    db.query(sql, input, function(error, results, field){
        let output = {
            success: false,
            data: [],
            errors: []
        };

        if (!error) {
            output.success = true;
            output.data.push(results);
        } else {
            output.error = 'There was an error on the server. Try again.';
        }

        const json_output = JSON.stringify(output);
        res.send(json_output)
    });
});

server.listen(3000, function(){
    console.log('server is running on PORT 3000');
});


