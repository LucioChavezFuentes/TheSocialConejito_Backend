import {admin, db} from '../util/admin'
import * as firebase from 'firebase';
import { fbConfig } from '../util/config';
import {validateSignUpData, validateLoginData, reduceUserDetails} from '../util/validators';
import  * as Busboy from 'busboy';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os'; 
import { Request, Response } from 'express';


firebase.initializeApp(fbConfig)


export const signUp = (req: any, res: any) => {

    let userId : any;
    let token: any;

    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle,
    };

    const {valid, errors} = validateSignUpData(newUser)

    if(!valid) return res.status(400).json(errors)

    const noImage = 'blank-profile-picture.svg'
    
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
        .then( (authUser: firebase.auth.UserCredential) => {
            userId = authUser.user!.uid
            return authUser.user!.getIdToken()

        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${noImage}?alt=media`,
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
                return res.status(500).json({general: 'Something went worng, please try again later'})
            }
            
        });


};

export const login = (req : any, res: any) => {
    const user = {
        email : req.body.email,
        password: req.body.password
    };

    const {valid, errors} = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(authUser => {
            return authUser.user!.getIdToken()
        })
        .then((token : string) => {
            return res.json({token})
        })
        .catch(error => {
            console.error(error)
            //if(error.code === 'auth/wrong-password'){
                return res.status(403).json({general: 'Wrong credentials, please try again'})
            //} else return res.status(500).json({error: error.code})
        });
};

//Add User Details

export const addUserDetails = (req: Request, res: Response) => {
    const userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({message: 'Details Updated Successfully'})
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({error: error.code})
        });
};

//Get any user's details
export const getUserDetails = (req: Request, res: Response) => {
    const userData : any = {};
    db.doc(`/users/${req.params.handle}`).get()
        .then((docUser) => {
            if(docUser.exists){
                userData.user = docUser.data()
                return db.collection('screams').where('userHandle', '==', req.params.handle)
                    .orderBy('createdAt', 'desc')
                    .get()
            } else {
                res.status(404).json({error: 'User Not Found'})
                return
            }
        })
        .then((docScreams) => {
            userData.screams = [];
            docScreams!.forEach((doc) => {
                userData.screams.push({
                    
                    ...doc.data(),
                    screamId: doc.id
                })
            })
            return res.json(userData)
        })
        .catch((error) => {
            console.error(error)
            res.status(500).json({error: error.code})
        })
}

//Get Own User Credetails
export const getAuthenticatedUser = (req: any, res: any) =>{
    const userData: any = {};
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if(doc.exists){
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get()
            } else return
        })
        .then( docLikes => {
            userData.likes = []
            docLikes!.forEach( like => {
                userData.likes.push(like.data())
            });
            return db.collection('notifications').where('recipient', '==', req.user.handle)
                .orderBy('createdAt', 'desc').limit(10).get();
            
        })
        .then((docsNotification) => {
            userData.notifications = []
            docsNotification.forEach( doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    read: doc.data().read,
                    screamId: doc.data().screamId,
                    type: doc.data().type,
                    createdAt: doc.data().createdAt,
                    notificationId: doc.id
                });
            });
            return res.json(userData);
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({error: error.code})
        })
};

// Upload an Image User Profile
export const uploadImage = (req: any, res:any) => {
    //const BusBoy = require('busboy');
    //const path = require('path');
    //const os = require('os');
    //const fs = require('fs');

    const busboy = new Busboy({headers: req.headers});

    let imageFileName : string;
    let imageToBeUploaded: any = {};

    busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, filename: string, encoding: string, mimetype: string) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        console.log(os.tmpdir());
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png' ){
            return res.status(400).json({error: 'Wrong file type submitted'});
        }
        // my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];

        imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`;
        //tmpdir stands for "Temporary diectory"
        const filePath = path.join(os.tmpdir() , imageFileName);
        
        imageToBeUploaded = {filePath, mimetype};

        file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filePath,{
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            // The string "?alt=media" prevents the image to be downloaded instead of only be showed on the browser.
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${imageFileName}?alt=media`
            return db.doc(`/users/${req.user.handle}`).update({imageUrl})
        })
        .then(() => {
            return res.json({message: 'Image uploaded successfully'});
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({error: error.code})
        })
    })
    busboy.end(req.rawBody)
};

export const markNotificationsRead = (req: Request, res: Response) => {
    const batch = db.batch();
    req.body.forEach((notificationId: string) => {
        const notification = db.doc(`/notifications/${notificationId}`)
        batch.update(notification,{read: true})
    });
    batch.commit()
        .then(() => {
            return res.json({message: "Notifications marked read"});
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({error: err.code})
        })
}