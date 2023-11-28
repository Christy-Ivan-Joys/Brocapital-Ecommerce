const mongoose=require('mongoose')

module.exports={
    connect(){

        mongoose.connect('mongodb://0.0.0.0:27017/Brocapital',{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        .then(()=>{
            console.log('Database connected to mongoose');
        }).catch((error)=>{
            console.log("Database failed to connect",error);
        })
    }

}
