const path=require('path'), fs=require('fs');
const express=require('express');
const app=express();
const expressWS=require('express-ws')(app);
const cookieParser=require('cookie-parser'), bodyParser=require('body-parser');

const video_chat_raw=require('./src/video_chat_raw.js');

app.set('port', process.env.PORT || 5050);
app.use(express.static(path.join(__dirname, 'public')));

app.ws('/video_chat_raw', video_chat_raw.ws);
app.get('/video_chat_raw/rooms', video_chat_raw.rooms.get);

// app.listen(app.get('port'));
app.listen(app.get('port'), ()=>{ console.log("Node app is running at localhost:" + app.get('port')); }); // for Dumping port No.
