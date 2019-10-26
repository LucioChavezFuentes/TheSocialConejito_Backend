
let db = {

    users: [
        {
            bio :"Creo que bio significa Biograhpy?",
            createdAt: "2019-09-25T03:11:44.082Z",
            email: "user20@email.com",
            handle:"user20",
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/thesocialmono.appspot.com/o/307616521.jpg?alt=media",
            location: "Tecamac, México",
            userId: "HUuYf111LUTdrGGJh3DZTGb4qXy2",
            website:"https://google.com"
        }
    ],

    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: '2019-09-18T22:08:01.691Z',
            likeCount: 5,
            commentCount: 2,
            userImage: "https://firebasestorage.googleapis.com/v0/b/thesocialmono.appspot.com/o/307616521.jpg?alt=media"
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: '1DsvDyfJjWUdytUKA2e5',
            body: 'Buenas joven que grita',
            createdAt: '2019-09-22T06:19:37.787Z'

        }
    ],
    likes: [
        {
            userHandle: 'user',
            screamId: '1DsvDyfJjWUdytUKA2e5'
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'user22',
            read: true || false,
            screamId: '1DsvDyfJjWUdytUKA2e5',
            type: 'like || comment',
            createdAt: '2019-09-29T09:12:21.281Z'


        }
    ]
}

const userDetails = {
    //Redux Data Schema
    credentials: {
        bio :"Creo que bio significa Biograhpy?",
        createdAt: "2019-09-25T03:11:44.082Z",
        email: "user20@email.com",
        handle:"user20",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/thesocialmono.appspot.com/o/307616521.jpg?alt=media",
        location: "Tecamac, México",
        userId: "HUuYf111LUTdrGGJh3DZTGb4qXy2",
        website:"https://google.com"

    },
    likes: [
        {
            userHandle: "user22",
            screamId: "1DsvDyfJjWUdytUKA2e5" 
        },

        {
            userHandle: "user20",
            screamId: "5sG8QPyEpcAkidP05l0l"
        }
    ]
};