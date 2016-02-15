var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'galax.be',
    user: 'root',
    password: 'kilamaris55',
    database: 'blog'
});
connection.connect();


router.get('/', function (req, res, next) {
    res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
})

router.post('/login', function (req, res, next) {
    var user = req.body.user;
    var pass = req.body.pass;
    connection.query("SELECT * FROM users WHERE user='" + user + "' AND pass='" + pass + "'", function (err, rows, fields) {
        if (err) throw err;
        if (rows.length > 0) {
            var token = Math.floor(Math.random() * 100000);
            saveToken(token, user);
            res.json({
                status: 'logged in',
                token: token
            });
        } else {
            res.json({
                status: 'Wrong user or password'
            });
        }
    });
});

router.get('/posts', function (req, res, next) {
    connection.query('SELECT * FROM posts', function (err, rows, fields) {
        if (err) throw err;
        var response = {};
        response.rows = rows;
        res.json(response);
    });
});

router.get('/post/:id', function (req, res, next) {
    var id = req.params.id;
    connection.query("SELECT * FROM posts WHERE id='" + id + "'", function (err, rows, fields) {
        if (err) throw err;
        var response = {};
        response.rows = rows;
        res.json(response);
    });
});


router.put('/posts', function (req, res, next) {
    connection.query("SELECT * FROM users WHERE user='" + req.body.user + "' AND token='" + req.body.token + "'", function (err, rows, fields) {
        if (err) throw err;
        if (rows.length > 0) {
            connection.query("INSERT INTO posts VALUES (null,'" + req.body.data + "')", function (err, rows, fields) {
                var response = {};
                response.status = "ok";
                if (err) {
                    response.status = "ko";
                    console.log(err);
                }
                console.log(req.body.data);
                res.json(response);
            });
        } else {
            var response = {};
            response.status = "unauthorized";
            res.json(response);
        }
    });

});




module.exports = router;



function saveToken(token, user) {
    connection.query("UPDATE users SET token='" + token + "' WHERE user='" + user + "'", function (err, rows, fields) {
        if (err) throw err;
    });
}

