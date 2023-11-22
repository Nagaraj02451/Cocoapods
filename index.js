const express = require("express");
const app = express();
const port = 2000;
const mongoose = require("mongoose")
const cors = require("cors");
require("dotenv").config();

app.use(express.json());  
app.use(cors({
  credentials:true,
  AccessControlAllowOrigin: '*',
  origin : "*"
}));
const bodyParser = require('body-parser');

mongoose.connect(process.env.DB)
.then(()=>{
    console.log("Database is connected");
})
.catch(()=>{
    console.log("Database is Not connected");
})

const OrderSchemaRoom = mongoose.Schema({
  titile:String,
  titileTwo : String,
  titileThree : String,
  titileSel : String,
  price : String,
  image : String,
  path : String,

});
const OrderConRoomList = mongoose.model('OrderRoom', OrderSchemaRoom);

// Parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//Razorpay Route
const phonepeRoute = require('./routes/phonepe/phonepeRoute')
app.use("/api", phonepeRoute);


app.get('/list-orders', async (req, res) => {
  const orders = await OrderConRoomList.find();
  res.send(orders);
});

// Starting Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
