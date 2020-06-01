window.addEventListener('DOMContentLoaded', ()=>{
    console.log('===== Video Chat START  =====');
    const socket=makeSocket();
    socket.addEventListener('open', async ()=>{ setRooms(await getRoomsJson()) });
    
    document.getElementById('room-select').addEventListener('change', setNewRoomUI);
    
    document.getElementById('login-button').addEventListener('click', ()=>{
	document.querySelector('.modal-wrapper').style.display='none';
	getRoomsJson().then(async (json)=>{
	    const [ roomName, userName] = getRoomUserName();
	    const constraints=json[roomName]!=null ? json[roomName].constraints : {audio: true, video: true };
	    const stream =await navigator.mediaDevices.getUserMedia(constraints);
	    socket.send(JSON.stringify({ type: 'roomin', 'roomName': roomName, 'userName': userName }));
	    const video=document.getElementById('local-video');
	    video.srcObject=stream;
	    video.play();

	    socket.addEventListener('message', message=>{
		const json=JSON.parse(message.data);
		if( json.type==='WebSocket' ) onMessageWebSocket(json);
		
		if( json.type==='RTC' && ( json.method==='require'  || json.method==='call') ){
		    console.log('RTC message method=', json.method);
		    const peer=new RTCPeerConnection();
		    const remoteVideo=document.createElement('video');
		    document.getElementById('video-wrapper').appendChild(remoteVideo);
		    for( const track of stream.getTracks() ) peer.addTrack(track, stream);

		    onTrackForRemoteVideo(peer, remoteVideo, json.id);
		    
		    if( json.method==='require' ) sendOffer(peer, socket, json.id);
		    else if( json.method==='call' ) sendAnswer(peer, socket, json.id, json.description);
		}
	    });
	});
    }); 
    console.log('===== Video Chat FINISH =====');
});  

function getRoomUserName(){
    let roomName=[ ...document.getElementById('room-select').children ].find(a=> a.selected).value;
    if( roomName==='-1' ){
	console.log('aaa');
	roomName=document.getElementById('room-name').value;
    }
    const userName=document.getElementById('user-name').value;
    console.log(roomName, userName);
    return [ roomName, userName ];
}

function onTrackForRemoteVideo(peer, video, id){
    video.id=`video-${id}`;
    console.log(video);
    peer.addEventListener('track', event=>{
//	console.log(video);
//	console.log(peer);
//	console.log(event);
	
	if( video.srcObjec==null ){
	    video.srcObject=event.streams[0];
	    video.play();
	}
    });
};

//***** WebRTC Connection Part Implementation ... START *******************************************************************************************//
function sendOffer(peer, socket, id){
    peer.addEventListener('icecandidate', event=>{
	if( event.candidate==null ) socket.send(JSON.stringify({ type: 'RTC', method: 'call', 'id': id, description: peer.localDescription}));
    });
    
    function setAnswer(message){
	const json=JSON.parse(message.data);
	if( json.type==='RTC' && json.method==='answer'){			    
	    peer.setRemoteDescription(new RTCSessionDescription(json.description)).then(()=>{ console.log(`ID=${json.id}のリモートSDPをセットしました`); });
	    socket.removeEventListener('message', setAnswer);
	}
    }
    socket.addEventListener('message', setAnswer);
	
    peer.createOffer().then(description=>peer.setLocalDescription(description));    
}

function sendAnswer(peer, socket, id, description){
    peer.addEventListener('icecandidate', event=>{
	if( event.candidate==null ) socket.send(JSON.stringify({ type:'RTC', method: 'answer', 'id': id, description: peer.localDescription}));
    });
    peer.setRemoteDescription(new RTCSessionDescription(description))
	.then(()=> peer.createAnswer())
	.then(description=> peer.setLocalDescription(description))
	.then(()=> console.log(`ID=${id}からのコールを受け取りました`));     
}
//***** WebRTC Connection Part Implementation ... END *******************************************************************************************//

// Socket with Log
function makeSocket(){
    const socket=new WebSocket(location.origin.replace('http', 'ws')+'/video_chat_raw');
    socket.addEventListener('error',  ()=>{ console.log(`WebSocket onerror url=${socket.url}`); });
    socket.addEventListener('close',  ()=>{ console.log(`WebSocket onclose url=${socket.url}`); });
//    socket.addEventListener('message', message=>{ console.log(`WebSocket type=${message.data}`); });

    return socket;
}
			
async function getRoomsJson(){ return await fetch(location.origin+'/video_chat_raw/rooms').then(res=> res.json()); }

//***** UI Implementation ... START ***************************************************************************************************************//
function onMessageWebSocket(json){
    if( json.type==='WebSocket' && json.method==='close' ){
	const video=document.getElementById(`video-${json.id}`);
	if( video!=null ){
	    video.parentNode.removeChild(video);
	}
    }
}

function setRooms(json){
    const select=document.getElementById('room-select');
    for( const [key, val] of Object.entries(json) ){
	const option=document.createElement('option');
	option.innerHTML=key+' '+val.members.length+'人';
	option.value=key;
	select.insertBefore(option, select.firstChild);
    }
    select.firstChild.selected=true;
    select.dispatchEvent(new Event('change'));
}
			
function setNewRoomUI(){
    const input=document.querySelector('div[for="new-room"]');
    if( [ ...document.getElementById('room-select').children ].find(a=> a.selected).id==='new-room' ) input.style.display='';
    else input.style.display='none';
}
//***** UI Implementation ... END *****************************************************************************************************************// 
