//If you are gonna use TypeScript in Node, dont forget to install @types/node

import * as functions from 'firebase-functions';
import * as express from 'express'

const app: express.Application = express();
//Don't use 'firebase/app'
//TODO: Investigate why 'firebase/app' does not work here and why it works in UI Project
import {getAllScreams, postOneScream, getScream} from './handlers/screams';
import {signUp, login, uploadImage, addUserDetails, getAuthenticatedUser} from './handlers/users'
import {firebaseAuth} from './util/firebaseAuth'


//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', firebaseAuth, postOneScream );
app.get('/scream/:screamId', getScream);

//Users Routes
app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', firebaseAuth, uploadImage);
app.post('/user', firebaseAuth, addUserDetails);
app.get('/user', firebaseAuth, getAuthenticatedUser);

//Makes /api url  and throught it you can manage the expresss modules
exports.api = functions.https.onRequest(app);

