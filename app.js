var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});
var Entity = require('./server/Entity');
var Inventory = require('./client/js/Inventory');

var mongojs = require("mongojs");
var db = mongojs('localhost:27017/nodedb', ['account', 'progress']);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use('/server', express.static(__dirname + '/server'));

server.listen(2000);
console.log('Server started.');

var DEBUG = true;
var Socket = require('./server/socket');

var isValidPassword = function (data, cb) {
    db.account.find({
        username: data.username,
        password: data.password
    }, function (err, res) {
        if (res.length > 0) {
            cb(true);
        } else {
            cb(false)
        }
    })
};

var isUsernameTaken = function (data, cb) {
    db.account.find({
        username: data.username
    }, function (err, res) {
        if (res.length > 0) {
            cb(true);
        } else {
            cb(false);
        }
    })
};

var addUser = function (data, cb) {
    db.account.insert({
        username: data.username,
        password: data.password
    }, function (err) {
        cb();
    });
};

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    Socket.list[socket.id] = socket;

    socket.on('signIn', function (data) {
        isValidPassword(data, function (res) {
            if (res) {
                Player.onConnect(socket, data.username);
                socket.emit('signInResponse', {
                    success: true
                });
            } else {
                socket.emit('signInResponse', {
                    success: false
                });
            }
        });
    });
    socket.on('signUp', function (data) {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signUpResponse', {
                    success: false
                });
            } else {
                addUser(data, function () {
                    socket.emit('signUpResponse', {
                        success: true
                    });
                });
            }
        });
    });

    socket.on('disconnect', function () {
        delete Socket.list[socket.id];
        Player.onDisconnect(socket);
    });


    socket.on('evalServer', function (data) {
        if (!DEBUG) {
            return;
        }
        var res = eval(data);
        socket.emit('evalAnswer', res);
    })
});

setInterval(function () {
    var packs = Entity.getFrameUpdateData();
    for (var i in Socket.list) {
        var socket = Socket.list[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove', packs.removePack);
    }

}, 1000 / 25);