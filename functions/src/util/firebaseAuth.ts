import {admin, db} from './admin';
//import * as express from 'express';

export const firebaseAuth = (req : any, res: any, next : any) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('Token not found')
        // 403: Unauthorized method.
        return res.status(403).json({error:'Unauthorized'});
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
            return next();
        })
        .catch(error => {
            console.error('Error while verifying token', error);
            return res.status(403).json(error);
        });

}