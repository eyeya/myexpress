const express = require('express');
//.ENV
const dotenv = require('dotenv');
dotenv.config();

//Line Config
const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret

};
const client = new line.Client(config);
const firebase = require('firebase');
require("firebase/firestore");
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId

} 
const admin = firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

//Fetch or AXOIS
const fetch = require('node-fetch');

//FILE SYSTEM
const FileType = require('file-type');
const path = require("path");
const os = require("os");
const fs = require("fs");


//WEB
const app = express();
const port = 3000

app.get('/media', async function(req, res) {    
    let filename = path.join(__dirname, "media.html");
    res.sendFile(filename);
});

app.get('/api/media', async function(req, res) {
    let response = await db.collection('medias').get();
    let medias = response.docs.map(doc => doc.data());
    console.log(medias);
    res.send(JSON.stringify(medias) )       
});


app.post('/webhook', line.middleware(config), (req, res) => {
    //console.log(req);
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

async function handleEvent(event) {
    //if (event.type !== 'message' || event.message.type !== 'text')
    if (event.type !== 'message' || ! ["text","image"].includes(event.message.type)  ){
        return Promise.resolve(null);
    }
    
    if(event.message.type === 'image'){
        console.log("This is an image!!!",event.message);
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: "Thank for an image",
        });
    }

     // SAVE TO FIREBASE
     let chat = await db.collection('chats').add(event);
     console.log('Added document with ID: ', chat.id);
     
    
    
    //console.log(event);
    //console.log(event.message);
    //console.log(event.message.text);
    //return client.replyMessage(event.replyToken, {
        //type: 'text',
       // text: event.message.text,
    //});

      //SWITCH FOR MANY CASES
      switch (event.message.text) {
        case "test":
            let payload_flex = require('./payloads/test.json');
            let str_payload_flex = JSON.stringify(payload_flex);
            let person = {
                name : "Chavalit",
                lastname : "Koweerawong",
            }
            payload_flex = JSON.parse(eval('`'+str_payload_flex+'`'));
            return client.replyMessage(event.replyToken, payload_flex);
            break;

        case "flex":
            let payload_template = require('./payloads/template.json'); 
            let str_payload_template = JSON.stringify(payload_template);
            let vaccince = await getTodayCovid();
            payload_template = JSON.parse(eval('`' + str_payload_template + '`'));       
            //console.log(payload_template);    
            return client.replyMessage(event.replyToken, payload_template);
            break;
        case "covid":
            //let newText = "สวัสดี เราเป็นบอทรายงานสถิติโควิดนะ";
            let data = await getTodayCovid();
            let newText = JSON.stringify(data);
            console.log(newText);
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: newText,
            });
            break;
        default:
            //console.log(event);
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: event.message.text,
            });
    }

}
async function getTodayCovid() {
    let current_date = (new Date()).toISOString().split("T")[0];
    let doc = await db.collection('vaccines').doc(current_date).get();
    // if (!doc.exists) {
    //     console.log('No such document!');
    // } else {
    //     console.log('Document data:', doc.data());
    // }
    return doc.data();
}


// Respond with Hello World! on the homepage:
app.get('/', function (req, res) {
    res.send('Hello World !')
})
app.get('/test-firebase', async function (req, res) {
    let data = {
        name: 'Tokyo',
        country: 'Japan'
    }
    const result = await db.collection('cities').add(data);
    console.log('Added document with ID: ', result.id);
    res.send('Test firebase successfully, check your firestore for a new record !!!')
})


app.get('/vaccine/fetch', async (req, res) => {
    //FETCH
    let response = await fetch('https://covid19-cdn.workpointnews.com/api/vaccine.json');
    let data = await response.json();
    console.log(data);

    //SAVE TO FIRESTORE
    let current_date = (new Date()).toISOString().split("T")[0];
    await db.collection('vaccines').doc(current_date).set(data);

    //SEND TO BROWSER AS HTML OR TEXT
    let text = JSON.stringify(data);
    res.send(text)
});


app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app.post('/', function (req, res) {
    res.send('Got a POST request')
})
app.put('/user', function (req, res) {
    res.send('Got a PUT request at /user')
})
app.delete('/user', function (req, res) {
    res.send('Got a DELETE request at /user')
})
