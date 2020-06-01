const ws       =require('./video_chat_raw/ws.js');
const rooms_get=require('./video_chat_raw/rooms/get.js');

const video_chat_raw={
    ws: ws,
    rooms: {
	get: rooms_get,
    }
}

module.exports=video_chat_raw;
