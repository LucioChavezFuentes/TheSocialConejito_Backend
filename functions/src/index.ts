//If you are gonna use TypeScript in Node, dont forget to install @types/node

import * as functions from 'firebase-functions';
import * as express from 'express'
import {db} from './util/admin';

const app: express.Application = express();

//Don't use 'firebase/app'
//TODO: Investigate why 'firebase/app' does not work here and why it works in UI Project
import {getAllScreams, postOneScream, getScream, postCommentOnScream, likeScream, unlikeScream, deleteScream} from './handlers/screams';
import {signUp, login, uploadImage, addUserDetails, getAuthenticatedUser} from './handlers/users'
import {firebaseAuth} from './util/firebaseAuth'


//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', firebaseAuth, postOneScream );
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', firebaseAuth, deleteScream);
app.post('/scream/:screamId/comment', firebaseAuth, postCommentOnScream)
app.get('/scream/:screamId/like', firebaseAuth, likeScream);
app.get('/scream/:screamId/unlike', firebaseAuth, unlikeScream);

//Users Routes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', firebaseAuth, uploadImage);
app.post('/user', firebaseAuth, addUserDetails);
app.get('/user', firebaseAuth, getAuthenticatedUser);

//Makes /api url  and throught it you can manage the expresss modules
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('/likes/{id}')
    .onCreate((snapshot) => {
        db.doc(`/screams/${snapshot.data()!.screamId}`).get()
            .then(docScream => {
                if(docScream.exists){
                    return db.doc(`/notications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString,
                        recipient: docScream.data()!.userHandle,
                        sender: snapshot.data()!.userHandle,
                        type: 'like',
                        read: false,
                        screamId: docScream.id

                    });
                } else {
                    return
                }
                        
            })
            .then(() => {
                return
            })
            .catch(error => {
                console.error(error)
                return
            })
})