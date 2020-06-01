const rooms=require('../rooms.js');

const get=(req, res)=>{
//    console.log(rooms);
    
    res.send(JSON.stringify(rooms));
}

module.exports=get;
