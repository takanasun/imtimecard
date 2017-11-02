'use strict';

const Hapi = require('hapi');
const request = require('superagent');
const crypto = require('crypto');

const REPLY_URL = 'https://api.line.me/v2/bot/message/reply'; //リプライ用
const CH_SECRET = '42d004e41ad3d13b4b8404e6bf9864ad'; //Channel Secretを指定
const CH_ACCESS_TOKEN = 'cgERLSYnfEyIlYlyyOBDngLyANUZr7F+TjP69VZIQl8s2c4NNWnsezsCSJ9unZHUlaMZPZLWK4MPSgZBDtPrICj3u9k19YfaoaC6pdtPMkTn18xCOa3H2WvWxIFxHMXcmFIUtMVDLAr01JbJMf/3UQdB04t89/1O/w1cDnyilFU='; //Channel Access Tokenを指定
const SIGNATURE = crypto.createHmac('sha256', CH_SECRET);

//
let client = (replyToken, SendMessageObject) => {
    request
        .post(REPLY_URL)
        .send({ replyToken: replyToken, messages: SendMessageObject })
        .set('X-Line-Signature', SIGNATURE)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${CH_ACCESS_TOKEN}`)
        .end(function(err, res){
            console.log(res.body);
        });
};

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: process.env.PORT
});

server.route({
    method: 'POST',
    path:'/callback',
    handler: (request, reply) => {
        console.log(request.payload.events);
        console.log('-------\n');

        let WebhookEventObject = request.payload.events[0];

        if(WebhookEventObject.type === 'message'){
            let SendMessageObject;
            if(WebhookEventObject.message.type === 'text'){
                SendMessageObject = [{
                    type: 'text',
                    text: WebhookEventObject.message.text
                }];
            }

            client(WebhookEventObject.replyToken, SendMessageObject);
        }
        return reply('success').code(200);
    }
});

// Start the server
server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
