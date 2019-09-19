import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const app = require('express')();
import * as firebase from 'firebase';

admin.initializeApp();


const firebaseConfig = {
    apiKey: "AIzaSyCZccwNlhumokQEONGEk44tFE2OT3t4Ks0",
    authDomain: "thesocialmono.firebaseapp.com",
    databaseURL: "https://thesocialmono.firebaseio.com",
    projectId: "thesocialmono",
    storageBucket: "thesocialmono.appspot.com",
    messagingSenderId: "230871018375",
    appId: "1:230871018375:web:0b715e741c1d450ca50122"
  };

firebase.initializeApp(firebaseConfig)

const db = admin.firestore();

app.get('/screams', (req: any, res: any) => {
    db.collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            const screams: any[] = [];
            data.forEach(doc => {
                
                screams.push({
                    screamdId : doc.id,
                    ...doc.data(),

                })
            })

            return res.json(screams)
        })
        .catch( error => console.error(error))
})

app.post('/scream', (req: any, res: any) => {
    const newScream = {
        body: req.body.body,
        userHandle : req.body.userHandle,
        createdAt: new Date().toISOString()
    }
    db.collection('screams')
        .add(newScream)
        .then( doc => {
            res.json({message :`document ${doc.id} created successfully`})
        })
        .catch(error => {
            res.status(500).json({error: `check the 'createScream' function in BackEnd pal`})
            console.error(error);
        })
});


app.post('/signup', (req: any, res: any) => {

    let userId : any;
    let token: any;
    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle,
    };

    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({handle:'this handle is already taken'})
            }
            else {
                return firebase.auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then( authUser => {
            userId = authUser.user.id
            return authUser.user.getIdToken();

        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            }

             return db.doc(`/users/${newUser.handle}`).set(userCredentials)
            

        })
        .then(() => {
            return res.status(201).json({token})
        })
        .catch( error => {
            console.error(error)
            if(error.code === "auth/email-already-in-use"){
                return res.status(400).json({email: 'Email is already in use'})
            } else {
                return res.status(500).json({error: error.code})
            }
            
        });


})

//Makes /api url  and throught it you can manage the expresss modules
exports.api = functions.https.onRequest(app);