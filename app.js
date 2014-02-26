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

var chatHistory = [];
//チャット
var chat = io.of('/chat').on('connection', function(client) {
    client.on('from_client', function(data) {

        var message  =  getLineMessage(data.name +  'さん : ' + data.message);
        chatHistory.push(message);
        //接続ソケット全て(=自分含む全員)
        chat.emit('from_server', {message: message});
    });
});

var attendance = 0;
var room = io.of('/room').on('connection', function(client) {
    client.on('entered', function() {
        attendance++;
        room.emit('from_server', attendance);
        io.of('/chat').emit('from_server', chatHistory);
    });

    client.on('disconnect', function() {
        attendance--;
        room.emit('from_server', attendance);
    });
});

//日付を返すだけ
function getLineMessage(message) {
    var dt= new Date(),
        message;
    dt.setHours(dt.getHours() + 9);
    return '[' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds() + '] ' + message;
}
