const express = require('express');

//Line Config
const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: 'PRrqvDT5kgSxQHusUpJ35S/C1grTExqv+IVcSJe+da95taS4p2h1wBWvjnFXKlbS102VLD158im9MjJ66FXHLd0Rw/tjquPabpmyuoaLKDhHtYfE0ARW+AToH/vXo8FiMlYGwRgAjXnoE6/4m6YSjgdB04t89/1O/w1cDnyilFU=',
    channelSecret: '8eaba734ee3b647dc4302e7503684461'
};
const client = new line.Client(config);
const firebase = require('firebase');
require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyDcty1VESKhlcbqD3MwJDYinPjtOmPFcus",
    authDomain: "lineoa-65be9.firebaseapp.com",
    projectId: "lineoa-65be9",
    storageBucket: "lineoa-65be9.appspot.com",
    messagingSenderId: "746449704094",
    appId: "1:746449704094:web:97b4eebc59098aa258178f",
    measurementId: "G-DJLV0HVX5X"
} 
const admin = firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
const app = express();
const port = 3000

app.post('/webhook', line.middleware(config), (req, res) => {
    //console.log(req);
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
     // SAVE TO FIREBASE
     let chat = await db.collection('chats').add(event);
     console.log('Added document with ID: ', chat.id);
 
    //console.log(event);
    //console.log(event.message);
    //console.log(event.message.text);
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text,
    });
}


// Respond with Hello World! on the homepage:
app.get('/test-firebase', async function (req, res) {
    let data = {
        name: 'Tokyo',
        country: 'Japan'
    }
    const result = await db.collection('cities').add(data);
    console.log('Added document with ID: ', result.id);
    res.send('Test firebase successfully, check your firestore for a new record !!!')
})


app.listen(port, () => {
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
