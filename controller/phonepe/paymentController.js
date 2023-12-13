const crypto =  require('crypto');
const axios = require('axios');
const nodemailer = require("nodemailer");
// const {salt_key, merchant_id} = require('./secret')
// console.log(process.env.salt_key);

let CusName = []
let amount = []
let Email = []
let Number = []
let Address = []
let GiftY = []
let Final = []
let FinalTwo = []
let FinalThree = []
let tax = []
let Amount = []
let FinalOne = []
let FinalThreeOne = []

const newPayment = async (req, res) => {
// console.log(req.body.GiftY);
CusName[0] = req.body.CusName
Email[0] = req.body.Email
Number[0] = req.body.Number
Address[0] = req.body.Address
GiftY[0] = req.body.GiftY
Final[0] = req.body.Final
FinalTwo[0] = req.body.FinalTwo
FinalThree[0] = req.body.FinalThree
amount[0] = req.body.amount
tax[0] = req.body.tax
Amount[0] = req.body.Amount
    FinalOne[0] = req.body.finalTwo1
    FinalThreeOne[0] = req.body.finalThree1
    
    try {

        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: process.env.merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            name: req.body.name,
            amount: req.body.amount * 100,
            redirectUrl: `https://cocoapods.onrender.com/api/status/${merchantTransactionId}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + process.env.salt_key;

        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        // const test_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        // console.log("Datas" , options);


        axios.request(options).then(function (response) {
            // console.log(response.data.success)
            return res.send(response.data.data.instrumentResponse.redirectInfo.url)
        })


        .catch(function (error) {
            console.error(error);
        });

       
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async(req, res) => {
    const merchantTransactionId = res.req.body.transactionId
    const merchantId = res.req.body.merchantId

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
    method: 'GET',
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`
    }
    };

    
    // CHECK PAYMENT TATUS
    axios.request(options).then(async(response) => {
        console.log(response.data)
        if (response.data.success === true) {

            if(response.data.success === true){
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                    }
                });
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: Email,  
                    subject: "Conformation",
                    html: `
                   <div style="display: flex; justify-content: center; width: 100%; height: 100vh;">
    <div>
      <div style="width: 100%;  height:60vh;display: flex; justify-content: center;">
          <img src="https://i.postimg.cc/150KB4Vg/ourprocess.png" style="width:100%;  " />
      </div>

      <div style="display: flex; justify-content:center;">
        <div style="width: 100%; background-color: black; color: white;">
        <div style="text-align: center;">
          <h2  style="color: #BA983C;">Your order is on the way!</h2>
          <h4  style="color: #BA983C;">Your order shipped</h4>
          <br />
        </div>
          <div style="width: 100%; display: flex; height: 40vh; margin-left:3%;" >
          <div style="width: 40%;">
          <p><span style="color: #BA983C;">Name</span>       :    ${CusName[0]}</p>

          <p><span style="color: #BA983C;">Email</span>      :    ${Email[0]}</p>

          <p><span style="color: #BA983C;">Number</span>     :    ${Number[0]}</p>
          
          <p><span style="color: #BA983C;">Address</span>    :    ${Address[0]}</p>

          <p><span style="color: #BA983C;">Gift</span>       :    ${GiftY[0]}</p>

          <p><span style="color: #BA983C;">Tax</span>        :    ${tax[0]}</p>
        
      </div>
          <div style="width: 60%;">



          <p><span style="color: #BA983C;">Rate</span>       :    ${Amount[0]}</p>

          <p><span style="color: #BA983C;">Paid Amount</span>:    ${amount[0]}</p>

          <p><span style="color: #BA983C;">Chocolate</span>  :    ${Final[0]}</p>

          <p><span style="color: #BA983C;">Fillings</span>   :    ${FinalTwo[0]} ${FinalOne[0]}</p>
          
          <p><span style="color: #BA983C;">Toppings</span>   :    ${FinalThree[0]} ${FinalThreeOne[0]}</p>

     
<br />
      </div>
      </div>
      </div>
      </div>
      </div>
    </div>
</div>


                
                
                  `
                };
              
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        
                        console.log("Error" + error)
                    } else {
                        console.log("Email sent:" + info.response);
                        res.status(201).json({status:201,info})
                    }
              
                })
              
            }
           

            const url = `https://makeyourownchocolate.cocoa-pods.in/final`
            return res.redirect(url)
            
        } else {
            const url = `https://makeyourownchocolate.cocoa-pods.in/failed`
            return res.redirect(url)
        }
    })
    .catch((error) => {
        console.error(error);
    });
};

module.exports = {
    newPayment,
    checkStatus
}
