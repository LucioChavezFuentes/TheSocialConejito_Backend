
interface user  {
    handle: string;
    imageUrl: string;
}

declare namespace Express {
    export interface Request {
        user: import('./src/util/admin').admin.auth.DecodedIdToken;
        rawBody: any;
        
    }
    
 }