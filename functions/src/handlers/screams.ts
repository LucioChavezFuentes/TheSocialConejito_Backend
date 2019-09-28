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
                    screamdId : doc.id,
                    ...doc.data(),

                })
            })

            return res.json(screams)
        })
        .catch( error => console.error(error))
};

export const postOneScream = (req: Request, res: Response) => {
    const newScream = {
        body: req.body.body,
        userHandle : req.user.handle,
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
};

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
}