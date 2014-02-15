//Module Dependency
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 3000;

app.listen(port);
io.set('log level', 1);   

function handler(req, res) {
    fs.readFile(__dirname + '/views/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('error');
        }
        res.writeHead(200);
        res.write(data);
        res.end();
    });
}

io.sockets.on('connection', function(client) {
    client.on('message', function(data) {
        data.time = getDateTimeString();
        //接続ソケットのみ
        //client.emit('message', data);

        //自分以外のソケット
        //client.broadcast.emit('message', data);

        //接続ソケット全て
        io.sockets.emit('message', data);
    });

    client.on('disconnect', function() {
        var data = {};
        data.time = getDateTimeString();
        data.name = 'someone';
        data.message = 'left room';
        io.sockets.emit('leave', data);
    });
});

//日付を返すだけ
function getDateTimeString() {
    var dt= new Date();
    dt.setHours(dt.getHours() + 9);
    return  dt.getFullYear() + '/' + dt.getMonth() + '/' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
}
