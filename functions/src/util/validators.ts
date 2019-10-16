


 const isEmpty = (string: string) => {
    if (string.trim() === '') {
        return true
    } else {
        return false
    }
};

 const isEmail = (email: string) => {
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regExp)){
        return true;
    } else { 
        return false;
    }
};

export const validateSignUpData = (data: any) => {

    const errors : any = {};

    if(isEmpty(data.email)) {
        errors.email = 'Email must no be empty'
    } else if(!isEmail(data.email)) {
        errors.email = 'Please provide a valid email address'
    }

    if(isEmpty(data.password)) {
        errors.password = 'Must not be empty'
    }

    if(data.password !== data.confirmPassword) {
        errors.confirmPassword = 'The password does not match'
    }
    if(isEmpty(data.handle)) {
        errors.handle = 'Must not be empty'
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
};

export const validateLoginData = (data: any) => {
    const errors: any = {};

    if(isEmpty(data.email)) errors.email = 'Can not be empty';
    if(isEmpty(data.password)) errors.password = 'Can not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
};

export const reduceUserDetails = (reqBody: any) => {
    const userDetails : any = {}
    
    if(!isEmpty(reqBody.bio.trim())) userDetails.bio = reqBody.bio
    if(!isEmpty(reqBody.website.trim())){

        if(reqBody.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `http://${reqBody.website.trim()}`
        } else userDetails.website = reqBody.website; 
    }
    if(!isEmpty(reqBody.location.trim())) userDetails.location = reqBody.location
    

    return userDetails;
}