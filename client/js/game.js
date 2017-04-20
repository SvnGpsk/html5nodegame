/**
 * Created by haspa on 20.04.17.
 */

//game
var Img = {};
Img.player = new Image();
Img.player.src = '/client/img/player.png';
Img.bullet = new Image();
Img.bullet.src = '/client/img/bullet.png';
Img.map = {};
Img.map['galaxy'] = new Image();
Img.map['galaxy'].src = '/client/img/map.png';
Img.map['field'] = new Image();
Img.map['field'].src = '/client/img/map.png';

var WIDTH = 500;
var HEIGHT = 500;

var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

//init
var Player = function (initPack) {
    var self = {};
    self.id = initPack.id;
    self.number = initPack.number;
    self.x = initPack.x;
    self.y = initPack.y;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.map = initPack.map;

    Player.list[self.id] = self;

    self.draw = function () {
        if(Player.list[selfId].map !== self.map){
            return;
        }
        var x = self.x - Player.list[selfId].x + WIDTH / 2;
        var y = self.y - Player.list[selfId].y + HEIGHT / 2;

        var hpWidth = 25 * self.hp / self.hpMax;
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y - 20, hpWidth, 4);

        var width = Img.player.width / 4;
        var height = Img.player.height / 4;

        ctx.drawImage(Img.player, 0, 0, Img.player.width, Img.player.height,
            x - width / 8, y - height / 8, width, height);

    };

    return self;
};
Player.list = {};

var Bullet = function (initPack) {
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;
    Bullet.list[self.id] = self;

    self.draw = function () {
        if(Player.list[selfId].map !== self.map){
            return;
        }
        var width = Img.player.width / 8;
        var height = Img.player.height / 8;

        var x = self.x - Player.list[selfId].x + WIDTH / 2;
        var y = self.y - Player.list[selfId].y + HEIGHT / 2;

        ctx.drawImage(Img.bullet, 0, 0, Img.bullet.width, Img.bullet.height,
            x - width / 8, y - height / 8, width, height)
    };

    return self;
};
Bullet.list = {};

var selfId = null;

socket.on('init', function (data) {
    if (data.selfId) {
        selfId = data.selfId;
    }
    for (var i = 0; i < data.player.length; i++) {
        new Player(data.player[i]);
    }
    for (i = 0; i < data.bullet.length; i++) {
        new Bullet(data.bullet[i]);
    }
});

//update
socket.on('update', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        var pack = data.player[i];
        var p = Player.list[pack.id];
        if (p) {
            if (pack.x !== undefined) {
                p.x = pack.x;
            }
            if (pack.y !== undefined) {
                p.y = pack.y;
            }
            if (pack.hp !== undefined) {
                p.hp = pack.hp;
            }
            if (pack.score !== undefined) {
                p.score = pack.score;
            }
        }
    }
    for (i = 0; i < data.bullet.length; i++) {
        pack = data.bullet[i];
        var b = Bullet.list[data.bullet[i].id];
        if (b) {
            if (pack.x !== undefined) {
                b.x = pack.x;
            }
            if (pack.y !== undefined) {
                b.y = pack.y;
            }
        }
    }
});

//remove
socket.on('remove', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (i = 0; i < data.bullet.length; i++) {
        delete Bullet.list[data.bullet[i]];
    }
});

setInterval(function () {
    if (!selfId) {
        return
    }
    ctx.clearRect(0, 0, 500, 500);
    drawMap();
    drawScore();
    for (var i in Player.list) {
        Player.list[i].draw();
    }
    for (var i in Bullet.list) {
        Bullet.list[i].draw();
    }
}, 40);

var drawMap = function () {
    var player = Player.list[selfId];
    var x = WIDTH / 2 - player.x;
    var y = HEIGHT / 2 - player.y;
    ctx.drawImage(Img.map[player.map], x, y);
};

var drawScore = function () {
    ctx.fillStyle = 'green';
    ctx.fillText(Player.list[selfId].score, 0, 30);
};

document.onkeydown = function (event) {
    if (event.keyCode === 68) { //d
        socket.emit('keyPress', {inputId: 'right', state: true});
    }
    else if (event.keyCode === 83) { //s
        socket.emit('keyPress', {inputId: 'down', state: true});
    }
    else if (event.keyCode === 65) { //a
        socket.emit('keyPress', {inputId: 'left', state: true});
    }
    else if (event.keyCode === 87) { //w
        socket.emit('keyPress', {inputId: 'up', state: true});
    }
};

document.onkeyup = function (event) {
    if (event.keyCode === 68) { //d
        socket.emit('keyPress', {inputId: 'right', state: false});
    }
    else if (event.keyCode === 83) { //s
        socket.emit('keyPress', {inputId: 'down', state: false});
    }
    else if (event.keyCode === 65) { //a
        socket.emit('keyPress', {inputId: 'left', state: false});
    }
    else if (event.keyCode === 87) { //w
        socket.emit('keyPress', {inputId: 'up', state: false});
    }
};

document.onmousedown = function (event) {
    socket.emit('keyPress', {inputId: 'attack', state: true});
};

document.onmouseup = function (event) {
    socket.emit('keyPress', {inputId: 'attack', state: false});
};

document.onmousemove = function (event) {
    var x = -250 + event.clientX - 8;
    var y = -250 + event.clientY - 8;
    var angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', {inputId: 'mouseAngle', state: angle});
};