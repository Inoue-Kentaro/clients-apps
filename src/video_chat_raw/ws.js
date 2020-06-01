const clients=require('./clients.js');
const rooms=require('./rooms.js');

const ws=(ws, req)=>{
    const id=makeNewID();
    clients.set(id, { socket: ws, name: 'anonymous' });
    console.log(`WebSocket ID=${id}が接続されました  現在のクライアントは${clients.size}です`);
    
    ws.onmessage=message=>{
     	const json=JSON.parse(message.data);
//	console.log('catch message :', json);
	
	if( json.type==='roomin' ){
	    if( rooms[json.roomName]!=null ){
		console.log(`${json.userName}(id=${id})が${json.roomName}にログインしました`);
		for( const member of rooms[json.roomName].members ){
		    console.log(`${member.id}にrequireを発信します`, { type: 'RTC', method: 'require', 'id': id });
		    clients.get(member.id).socket.send(JSON.stringify({ type: 'RTC', method: 'require', 'id': id }));
		}
		
		rooms[json.roomName].members.push({ 'id': id, name: json.userName });
		clients.get(id).name=json.userName;		
	    }
	    else{
		console.log(`新しい部屋${json.roomName}を作ります`);
		rooms[json.roomName]={ constraints: { audio: true, video: true }, members: [ { 'id': id, name: json.userName } ] };
	    }
	}

	if( json.type==='RTC' && json.method==='call' ) clients.get(json.id).socket.send(JSON.stringify({ type: 'RTC', method: 'call', description: json.description, 'id': id }));
	if( json.type==='RTC' && json.method==='answer' ) clients.get(json.id).socket.send(JSON.stringify({ type: 'RTC', method: 'answer', description: json.description }));
    }

    ws.onclose=()=>{
	clients.delete(id);
	for( const room of Object.values(rooms) ) if( room.members.find(a=> a.id===id)!=null ) room.members=room.members.filter(a=> a.id!==id);
	
	for( const member of clients.values() ) member.socket.send(JSON.stringify({ type: 'WebSocket', method: 'close', 'id': id }));
	console.log(`WebSocket ID=${id}が切断されました  現在のクライアントは${clients.size}です`);
    }
}

function makeNewID(){
    let id=Math.floor(Math.random()*10000);
    while( clients.has(id) )id=Math.floor(Math.random()*10000);
    return id;
}

module.exports=ws;
