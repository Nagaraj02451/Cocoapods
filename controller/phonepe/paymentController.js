const crypto =  require('crypto');
const axios = require('axios');
const nodemailer = require("nodemailer");
// const {salt_key, merchant_id} = require('./secret')
// console.log(process.env.salt_key);

const newPayment = async (req, res) => {
// console.log(req.body.GiftY);
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
                        to: "nagaraj02022000@gmail.com",  
                        subject: "Conformation",
                        html: `
                        <div style="display: flex; justify-content: center; width: 100%; height: 100vh;">
                        <div>
                          <div style="display: flex; justify-content: center;">
                              <img src="https://i.postimg.cc/CKhDmJTC/about-us-1.png" style="width:100%; height: 45vh;" />
                          </div>
                  
                          <div style="display: flex; justify-content:center;">
                            <div style="width: 100%; background-color: black; color: white;">
                            <div style="text-align: center;">
                              <h2  style="color: #BA983C;">Your order is on the way!</h2>
                              <h4  style="color: #BA983C;">Your order shipped</h4>
                              <br />
                            </div>
                              <div style="width: 100%; height: 36vh; margin-left:10%;  " >
                              <div >
                              <p><span style="color: #BA983C;">Name</span>       :    ${req.body.CusName}</p>
                  
                              <p><span style="color: #BA983C;">Email</span>      :    ${req.body.Email}</p>
                    
                              <p><span style="color: #BA983C;">Number</span>     :    ${req.body.Number}</p>
                              
                              <p><span style="color: #BA983C;">Address</span>    :    ${req.body.Address}</p>

                              <p><span style="color: #BA983C;">Gift</span>       :    ${req.body.GiftY}</p>
                  
                            
                          </div>
                              <div>
                  
                  
                              <p><span style="color: #BA983C;">Tax</span>        :    ${req.body.tax}</p>

                              <p><span style="color: #BA983C;">Rate</span>       :    ${req.body.Amount}</p>

                              <p><span style="color: #BA983C;">Paid Amount</span>:    ${req.body.amount}</p>

                              <p><span style="color: #BA983C;">Chocolate</span>  :    ${req.body.Final}</p>
                
                              <p><span style="color: #BA983C;">Fillings</span>   :    ${req.body.FinalTwo}</p>
                              
                              <p><span style="color: #BA983C;">Toppings</span>   :    ${req.body.FinalThree}</p>
                  
                         
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
            const url = `https://cocoapods.onrender.com/final`
            return res.redirect(url)
            
        } else {
            const url = `https://cocoapods.onrender.com/failed`
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
