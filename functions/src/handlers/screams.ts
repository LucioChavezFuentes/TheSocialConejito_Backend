import  {db}  from '../util/admin'
import { Response, Request } from 'express';


/*interface postOneScreamRequest extends Request {
    user: any
}*/

export const getAllScreams = (req: Request, res: Response) => {
    db.collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            const screams: any[] = [];
            data.forEach(doc => {
                
                screams.push({
                    
                    ...doc.data(),
                    screamId : doc.id,

                })
            })

            return res.json(screams)
        })
        .catch( error => console.error(error))
};

export const postOneScream = (req: Request, res: Response) => {
    if (req.body.body.trim() === '') {
         res.status(400).json({ body: 'Body must not be empty' });
         return
      }
    const newScream = {
        body: req.body.body,
        userHandle : req.user.handle,
        createdAt: new Date().toISOString(),  
        userImage: req.user.imageUrl,
        likeCount: 0,
        commentCount: 0
    }
    db.collection('screams')
        .add(newScream)
        .then( doc => {
            const resScream: any = newScream;
            resScream.screamId = doc.id
            res.json(resScream);
        })
        .catch(error => {
            res.status(500).json({error: `check the 'createScream' function in BackEnd pal`})
            console.error(error);
        })
};

//Fetch One Scream 
export const getScream = (req: any, res: any) => {
    let screamData: any = {};
    db.doc(`/screams/${req.params.screamId}`)
        .get()
        .then( docScream => {
            if(!docScream){
                return res.status(404).json({error: 'Scream not found'})
            }
            screamData = docScream.data();
            screamData.screamId = docScream.id;
            return db.collection('comments')
                .where('screamId', '==', req.params.screamId)
                .orderBy('createdAt', 'desc')
                .get()
        })
        .then((docComments) => {
            screamData.comments = [];
            docComments.forEach( (docComment: any) => {
                screamData.comments.push(docComment.data())
            })

            return res.json(screamData)
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({error: error.code})
        })
};

//Post One Comment on Scream
export const postCommentOnScream = (req: Request, res: Response) => {
    if(req.body.body.trim() === ''){
        res.status(400).json({comment: 'Must not be empty'});
        return
    } 

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }

    let dataScream;

    db.doc(`/screams/${req.params.screamId}`).get()
        .then((doc) => {
            if(!doc.exists){
                 res.status(404).json({error: 'scream not found'})
                 return
            }
            return doc.ref.update({commentCount: doc.data()!.commentCount + 1});
        })
        .then(() => {
            
            return db.collection('comments').add(newComment)
        })
        .then(() => {
            return db.doc(`/screams/${req.params.screamId}`).get()
           
        })
        .then((docScreamUpdated) => {
            dataScream = docScreamUpdated.data()
            return res.json({
                newComment,
                dataScream
            })
        })
        .catch((error) => {
            console.error(error)
            res.status(500).json({error: error.code})
        })
};

// like on scream, params: { screamId }
export const likeScream = (req: Request, res: Response) => {

    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('screamId', '==', req.params.screamId).limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData : any;

    screamDocument.get()
        .then( doc => {
            if(doc.exists){
                screamData = doc.data()
                screamData.screamId = doc.id
                return likeDocument.get()
            }
            else{
                res.status(404).json({error: `Scream not found`})
                return
            }
        })
        .then(likeDoc => {
            //@ts-ignore Typescript thinks likeDoc may be null.
            if(likeDoc.empty){
                return db.collection('likes').add({
                    screamId: req.params.screamId,
                    userHandle: req.user.handle
                })
                .then(() => {
                    screamData.likeCount++
                    return screamDocument.update({likeCount: screamData.likeCount});
                })
                .then(() => {
                    return res.json(screamData)
                })
            } else {
                return res.status(400).json({error: 'Scream already liked'});
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({error: error.code})
        });
        
    
}

//Unlike on scream
export const unlikeScream = (req: Request, res: Response) => {

    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('screamId', '==', req.params.screamId).limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData : any;

    screamDocument.get()
        .then( doc => {
            if(doc.exists){
                screamData = doc.data()
                screamData.screamId = doc.id
                return likeDocument.get()
            }
            else{
                res.status(404).json({error: `Scream not found`})
                return
            }
        })
        .then(likeDoc => {
            //@ts-ignore Typescript thinks likeDoc may be null.
            if(likeDoc.empty){
                return res.status(400).json({error: 'Scream not liked'});
                
            } else {

                return db.doc(`/likes/${likeDoc!.docs[0].id}`).delete()
                    .then(() => {
                        screamData.likeCount--
                        return screamDocument.update({likeCount: screamData.likeCount})
                    })
                    .then(() => {
                        return res.json(screamData)
                    })
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({error: error.code})
        });
};

//Delete Scream, Params= {screamId: string}
export const deleteScream = (req: Request, res: any) => {

    const documentScream = db.doc(`/screams/${req.params.screamId}`)

    documentScream.get()
        .then(docScream  => {
            if(!docScream.exists){
                return res.status(404).json({error: 'Scream not found'})
            }
            if(docScream.data()!.userHandle !== req.user.handle){
                return res.status(403).json({error: 'Unauthorized'})
            } else {
                return documentScream.delete()
                    .then(() => {
                        return res.json({message: 'Scream deleted Sucessfully'})      
                        })
            }
        })
        .catch((error) => {
            console.error(error)
            res.status(500).json({error: error.code})
        })
}