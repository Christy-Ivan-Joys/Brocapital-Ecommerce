const mongoose=require('mongoose')

module.exports={
    connect(){

        mongoose.connect('mongodb+srv://christyivanjoys:Christy1@cluster0.zabnhj5.mongodb.net/Hii?retryWrites=true&w=majority',{
            // useNewUrlParser:true,
            // useUnifiedTopology:true
        })
        .then(()=>{
            console.log('Database connected to mongoose');
        }).catch((error)=>{
            console.log("Database failed to connect",error);
        })
    }

}
