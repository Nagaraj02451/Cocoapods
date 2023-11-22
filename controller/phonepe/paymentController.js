const crypto =  require('crypto');
const axios = require('axios');
const nodemailer = require("nodemailer");
// const {salt_key, merchant_id} = require('./secret')
// console.log(process.env.salt_key);

const newPayment = async (req, res) => {

    try {
    // console.log("Collections",req.body);

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

        const test_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
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
            console.log(response.data)
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
