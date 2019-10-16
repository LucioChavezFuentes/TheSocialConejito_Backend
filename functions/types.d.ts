

declare namespace Express {
    export interface Request {
        //Decoded Firebase Token type
        user: import('./src/util/admin').admin.auth.DecodedIdToken;
        rawBody: any;
        
    }
    
 }