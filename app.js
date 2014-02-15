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

//チャット
var chat = io.of('/chat').on('connection', function(client) {
    client.on('from_client', function(data) {
        var message  =  data.name +  'さん : ' + data.message;
        //接続ソケット全て(=自分含む全員)
        io.of('/chat').emit('from_server', getLineMessage(message));
    });
});

//入退室
var room = io.of('/room').on('connection', function(client) {
    client.on('entered', function() {
        //接続ソケットのみ(=自分のみ)
        client.emit('someone_entered', getLineMessage("挨拶をしてみましょう。"));
        //接続ソケット以外(=自分以外)
        client.broadcast.emit('someone_entered', getLineMessage('誰かが入出しました。'));
    });

    client.on('disconnect', function() {
        //接続ソケット以外(=自分以外)
        client.broadcast.emit('someone_left', getLineMessage('誰かが退室しました。'));
    });
});

//日付を返すだけ
function getLineMessage(message) {
    var dt= new Date(),
        message;
    dt.setHours(dt.getHours() + 9);
    return '[' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds() + '] ' + message;
}
