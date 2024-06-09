import mongoose from "mongoose";
//add connection
const uri = `mongodb+srv://soethandar:BJgYPCLBYnMh46IU@cluster0.fcwscyi.mongodb.net/Loop?retryWrites=true&w=majority&appName=Cluster0`;
const connection = await mongoose.connect(uri).then(() => {
  console.log('connection successful');
}).catch((err) => {
  console.log('connection failed');
});


export { connection };
