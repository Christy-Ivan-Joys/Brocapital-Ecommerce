const mongoose=require('mongoose')

module.exports={
     connect (){

       mongoose.connect('mongodb://christyivanjoys:Christy1@ac-ot4v53r-shard-00-00.zabnhj5.mongodb.net:27017,ac-ot4v53r-shard-00-01.zabnhj5.mongodb.net:27017,ac-ot4v53r-shard-00-02.zabnhj5.mongodb.net:27017/Hii?ssl=true&replicaSet=atlas-423d4u-shard-0&authSource=admin&retryWrites=true&w=majority',{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
     
        })
        .then(()=>{
            console.log('Database connected to mongoose');
        }).catch((error)=>{
            console.log("Database failed to connect",error);
        })
    }

}
                    