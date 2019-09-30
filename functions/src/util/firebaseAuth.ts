import {admin, db} from './admin';
import { Request, Response, NextFunction } from 'express';
//import * as express from 'express';

export const firebaseAuth = (req : Request, res: Response, next : NextFunction) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('Token not found')
        // 403: Unauthorized method.
        res.status(403).json({error:'Unauthorized'});
        
        return
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedIdToken => {
            req.user = decodedIdToken
            console.log(decodedIdToken)
            return db.collection('users')
                    .where('userId', '==', req.user.uid)
                    .limit(1)
                    .get();
        })
        .then(userData => {
            req.user.handle = userData.docs[0].data().handle;
            req.user.imageUrl = userData.docs[0].data().imageUrl;
            next()
            
        })
        .catch(error => {
            console.error('Error while verifying token', error);
            return res.status(403).json(error);
        });
};