const rooms={}

rooms['テストルーム(音声のみ)']={ constraints: { audio: true, video: false }, members: [] };
rooms['テストルーム']={ constraints: { audio: true, video: true }, members: [] };

module.exports=rooms;
