var express = require('express'),
    http = require('http'),
    path = require('path'),
    socketIO = require('socket.io');

var app = express();

//middleware
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(app.router); //get, post, delete, put
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = socketIO.listen(server);
io.set('log level', 1);   

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
