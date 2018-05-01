var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var handlebars = require('express3-handlebars')
.create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.get('/', function(req,res) {
  res.render('home');
});
app.get('/user', function(req,res) {
  var userName  = req.query.user_name;
  var userEmail = req.query.user_email;
  if (userName == '' || typeof userName == 'undefined') {
    res.render('sign_in');
  } else {
    res.render('user', {user_name: userName,user_email: userEmail});
  }
});
app.get('/sign_up', function(req,res) {
  res.render('sign_up');
});
app.get('/sign_in', function(req,res) {
  res.render('sign_in');
});

users = {};
var numberOfUser = 0;

io.on('connection', function(socket) {
  numberOfUser++;

  socket.on('NEW_USER', function(res){
    var time = new Date().getHours() +":"+ new Date().getMinutes();
    users[socket.id] = {email:res.email,name:res.name,time:time};
    io.emit('NEW_USER', users);
    io.emit('NUMBER_OF_USERS', Object.keys(users).length);
  });

  socket.on('disconnect', function(){
    numberOfUser--;
    delete users[socket.id];
    io.emit('NUMBER_OF_USERS', Object.keys(users).length);
    io.emit('OUT_USER', socket.id);
  });
  
 /* socket.on('CHAT_MESSAGE', function(res){
    io.emit('CHAT_MESSAGE', res);
  });*/

  socket.on('CHAT_MESSAGE_PUBLIC', function(msg){
    var email = users[socket.id].email;
    io.emit('CHAT_MESSAGE_PUBLIC', {id:socket.id,msg:msg,email:email});
  });
});

const port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *:port');
});
