//Please note: the code below contains commented out notes and samples that I left here explicitely for the learning purposes, so that I could use it as reference later on. Thank you for checking it out! 

//!------------------------------------ 282. Setting up our server for facerecognitionapp
//?import express.js - install express.js and nodemon, twick the json
const express = require("express");

//?defining bcrypt for hashing passwords
//npm install bcrypt-nodejs - installing a library that encrypts passwords into hashes
const bcrypt = require("bcrypt-nodejs");

//?adding cors to allow http connection from backend to frontend
//npm install cors
const cors = require("cors");

//?adding knex to connect the server to the db
//npm install knex
//npm install pg
const knex = require("knex");
const { response } = require("express");

//?importing api keys from a file that are going to be ignored
// import {myApi} from "./myApi.js"; // - wont work outside of module (eg react)
const myApi = require("./myApi"); // - this will work in node but will not work on heroku in case it's left in .gitignore (heroku doesn't like .gitignore)

// //?connect to db with knex when db is on local machine 
// const db = knex({
//     client: 'pg',
//     connection: {
//       host : '127.0.0.1',
//       user : 'postgres',
//       password : myApi.myApi.key3,
//       database : 'facerecognition'
//     }
// });

//?connect to db with knex when db is on heroku 
const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
    }
});

//?defining app
const app = express();

//?this is required to format the request to the server to json
app.use(express.json());

//?this is enabling the cors
app.use(cors());

app.get("/", (req, res) => {
    res.send("it's working!");
});

//!------------------------------------ importing as modules
//?importing register, signin, profile components from modules
const register = require("./controllers/Register");
const signin = require("./controllers/SignIn");
const profile = require("./controllers/Profile");
const image = require("./controllers/Image"); //also contains /imageurl endpoint
const leaderboard = require("./controllers/Leaderboard");

//?register - creating /register req and res
app.post("/register", (req, res) => {register.handleRegister(req, res, db, bcrypt)});

//?signin - creating /signin req and res
app.post("/signin", (req, res) => {signin.handleSignIn(req, res, db, bcrypt)});

//?profile - creating /profile/:id req and res
app.get("/profile/:id", (req, res) => {profile.getProfile(req, res, db)});

//?image - creating /image to update entries count when image is submitted
app.put("/image", (req, res) => {image.getEntries(req, res, db)});

//?imageurl - creating /imageurl to get image url for clarifai api on the backend
app.post("/imageurl", (req, res) => {image.handleApiCall(req, res)});

//?leaderboard - accessing leaderboard
app.get("/leaderboard", (req, res) => {leaderboard.getLeaderboard(req, res, db)});

// //listening to changes
// app.listen(3000, () => {
//     console.log("app is running on port 3000");
// });

//listening to changes on heroku
app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running`);
});

//!------------------------------------ 283. /register and /signin
// //?register - creating /register req and res
// app.post("/register", (req, res) => {
//     //destructuring client request to the server
//     const {email, name, password} = req.body;

//     //storing password hash
//     const hash = bcrypt.hashSync(password);

//     console.log("register request is", req.body);

//     //adding transaction to connect and euqlize login and users dbs
//     db.transaction(trx => { //it first inserts stuff into login db
//         trx.insert({
//             hash: hash,
//             email: email
//         })
//         .into("login")
//         .returning("email") //then returns the login email to use in users db
//         .then(loginEmail => {
//             //inserting data to db with knex
//             return trx("users") //here db is changed to trx so that the whole thign stays as one transaction
//             .returning("*")
//             .insert({ //and inserts the rest of data into users db
//                 email: loginEmail[0], //[0], because otherwise it returns an array [{email}]
//                 name: name,
//                 joined: new Date(),
//                 lastactive: new Date()
//             })
//             .then(user => {
//                 res.json(user[0]); //responds to the frontend with user info
//             })
//         })
//         .then(trx.commit) //if everything above passes, it commits the changes
//         .catch(trx.rollback) //if smth fails, it rolls back the changes
//     })
//     .catch(err => res.status(400).json("unable to register"));
// });

// //?signin - creating /signin req and res
// app.post("/signin", (req, res) => {
//     console.log("signin request is", req.body);

//     db.select("email", "hash").from("login")
//     .where({email: req.body.email}) //1st way
//     // .where("email", "=", req.body.email) //2nd way
//     .then(data => {
//         const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
//         if (isValid) {
//             return db.select("*").from("users")
//             .where({
//                 email: req.body.email
//             })
//             .update("lastactive", new Date())
//             .returning("*")
//             .then(userInfo => {
//                 res.json(userInfo[0])
//             })
//             .catch(err => res.status(400).json("unable to get user"))
//         }
//         else {
//             res.status(400).json("wrong credentials")
//         }
//     })
//     .catch(err => res.status(400).json("wrong credentials"))
// });

//!------------------------------------ 283. /profile/:id and /image
// //?profile - creating /profile/:id req and res
// app.get("/profile/:id", (req, res) => {
//     const {id} = req.params;
//     db.select('*').from("users")
//     .where({
//         id: id //or in ES6 just {id} instead
//     })
//     .then(user => {
//         if (user.length) {
//             res.json(user[0])
//         }
//         else {
//             res.status(400).json("Not found")
//         }
//     })
//     .catch(err => res.status(400).json("not found"));
// });
    
// //?image - creating /image to update entries count when image is submitted
// app.put("/image", (req, res) => {
//     const {id, picsSubmitted} = req.body;
//     console.log(id, picsSubmitted)

//     // //1st way
//     // db.select('*').from("users")
//     // .where({
//     //     id: id
//     // })
//     // .increment("entries", 1)
//     // .then(response => {
//     //     res.json(response)
//     // })

//     // // 2nd way
//     // db("users")
//     // .returning("*")
//     // .where({id: id})
//     // .increment("entries", 1)
//     // .then(response => {
//     //     res.json(response[0].entries)
//     // })

//     // 3rd way
//     db("users")
//     .where("id", "=", id)
//     .increment("entries", picsSubmitted)
//     .update("lastactive", new Date())
//     .returning("entries")
//     .then(entries => {
//         res.json(entries)
//     })
//     .catch(err => res.status(400).json("unable to get entries"))
// });

// //?leaderboard - accessing leaderboard
// app.get("/leaderboard", (req, res) => {
//     db.select("name", "entries", "lastactive")
//     .from("users")
//     .where("entries", ">", 0)
//     .orderBy("entries", "desc")
//     // .sum(knex.raw("current_timestamp", ["lastactive"])
//     // .havingRaw("current_timestamp", "-", "lastactive")
//     .then(users => {
//         res.json(users)
//     })
//     .catch(err => res.status(400).json("leaderboard unavailable"))
// });

// //listening to changes
// app.listen(3000, () => {
//     console.log("app is running on port 3000");
// });

//!------------------------------------ When db is in the variable on the server
// console.log(db.select("*").from("users"));
// db.select("*").from("users").then(data => {
//     console.log(data);
// })

// //server responds to GET requests to the client
// app.get("/", (req, res) => {
//     res.send("hello");
// });

//?creating simple db in the variable
// const database = {
//     users: [
//         {
//             id: "1",
//             name: "John",
//             email: "john@gmail.com",
//             password: "cookies",
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id: "2",
//             name: "Sally",
//             email: "sally@gmail.com",
//             password: "bananas",
//             entries: 0,
//             joined: new Date()
//         }
//     ]
//     // ,
//     // login: [
//     //     {
//     //         id: "987",
//     //         hash: "",
//     //         email: "john@gmail.com"
//     //     }
//     // ]
// };

//?register - pushing users to the db when db is just a variable on the server
// app.post("/register", (req, res) => {
    // const {email, name, password} = req.body;
    // database.users.push({
        //     id: "3",
        //     name: name,
        //     email: email,
        //     // password: password,
        //     entries: 0,
        //     joined: new Date()
    // });

    // //hashing the password upon registration
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    //server responds with the last user added to the database variable
    // res.json(database.users[database.users.length-1]);
// });

//?signin - signing the user in to the db when the db is just a variable on the server
// app.post("/signin", (req, res) => {
//     console.log("request is", req.body);

//     //comparing hashes upon sign in - password matches - will sign in
//     bcrypt.compare("apples", "$2a$10$3WBVxUL5I9Z2qgpqtM3/IuSJj93G2Z5.T1MptxD/w3F7gfAAOkeBa", function(err, res) {
//         console.log("first guess", res) // res == true
//     });

//     //password doesn't match - will not sign in
//     bcrypt.compare("apple", "$2a$10$3WBVxUL5I9Z2qgpqtM3/IuSJj93G2Z5.T1MptxD/w3F7gfAAOkeBa", function(err, res) {
//         console.log("second guess", res) // res == false
//     });
//     res.send("signing"); //from now on better use .json() with "res", e.g. res.json("signing");

//     //signing the user in when db is a variable on the server
//     if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
//         // res.json("success"); //initial way
//         res.json(database.users[0]); //better way
//     }
//     else {
//         res.status(400).json("error logging in");
//     }
// });


//?profile/:id - iterating database and returning appropriate user when db is just a variable on the server
// app.get("/profile/:id", (req, res) => {
    // const {id} = req.params;
    // let found = false;
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true;
    //         return res.json(user);
    //     }
    // })
    // if (!found) {
    //     res.status(404).json("no such user");
    // }
// });

//?image - creating /image to update entries count when image is submitted, when db is a variable on the server
// app.put("/image", (req, res) => {
//     const {id} = req.body; //here we're receiving user's id from the body and not from params for some reason
//     let found = false;
//     database.users.forEach(user => {
//         if (user.id === id) {
//             found = true;
//             user.entries++;
//             return res.json(user.entries);
//         }
//     });
//     if (!found) {
//         res.status(400).json("no such user");
//     }
// });

// //listening to changes
// app.listen(3000, () => {
//     console.log("app is running on port 3000");
// });

//!------------------------------------ 286. Storing User Passwords
//npm install bcrypt-nodejs - installing a library that encrypts passwords into hashes

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });

// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

//layout of our future API
/*
/--> res = this is working
/signin --> POST = success/fail
/register --> POST - new user
/profile/:userId --> GET = user
/image --> PUT (updating the score) --> updated count
*/

// //?------------------------------------ BELOW IS THE VERSION BEFORE CONNECTING THE BACKEND TO THE FRONTEND
// //!------------------------------------ 282. Setting up our server for facerecognitionapp

// //import express.js - install express.js and nodemon, twick the json
// const express = require("express");

// //defining bcrypt for hashing passwords
// const bcrypt = require("bcrypt-nodejs");

// //defining app
// const app = express();

// //this is required to format the request to the server to json
// app.use(express.json());

// //!------------------------------------ 283. /signin and /register

// //creating simple db in the variable
// const database = {
//     users: [
//         {
//             id: "1",
//             name: "John",
//             email: "john@gmail.com",
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id: "2",
//             name: "Sally",
//             email: "sally@gmail.com",
//             entries: 0,
//             joined: new Date()
//         }
//     ],
//     login: [
//         {
//             id: "987",
//             hash: "",
//             email: "john@gmail.com"
//         }
//     ]
// };

// //server responds to GET requests to the client
// app.get("/", (req, res) => {
//     res.send(database.users);
// });

// //creating /signin req and res
// app.post("/signin", (req, res) => {
    
//     //comparing hashes upon sign in
//     // bcrypt.compare("apples", "$2a$10$3WBVxUL5I9Z2qgpqtM3/IuSJj93G2Z5.T1MptxD/w3F7gfAAOkeBa", function(err, res) {
//     //     console.log("first guess", res)
//     //     // res == true
//     // });
//     // bcrypt.compare("apple", "$2a$10$3WBVxUL5I9Z2qgpqtM3/IuSJj93G2Z5.T1MptxD/w3F7gfAAOkeBa", function(err, res) {
//     //     console.log("second guess", res)
//     //     // res == true
//     // });
//     // res.send("signing");

//     //from now on better use .json() with "res"
//     // res.json("signing");

//     if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
//             res.json("success");
//     }
//     else {
//         res.status(400).json("error logging in");
//     }
// });

// //creating /register req and res
// app.post("/register", (req, res) => {
//     //destructuring client request to the server
//     const {email, name, password} = req.body;

//     //hashing the password upon registration
//     bcrypt.hash(password, null, null, function(err, hash) {
//         // Store hash in your password DB.
//         console.log(hash);
//     });

//     database.users.push({
//         id: "3",
//         name: name,
//         email: email,
//         password: password,
//         entries: 0,
//         joined: new Date()
//     });
//     res.json(database.users[database.users.length-1]);
// });

// //!------------------------------------ 283. /profile/:id and /image
// //creating /profile/:id req and res
// app.get("/profile/:id", (req, res) => {
//     const {id} = req.params;
//     let found = false;
    
//     database.users.forEach(user => {
//         if (user.id === id) {
//             found = true;
//             return res.json(user);
//         }
//     })
    
//     if (!found) {
//         res.status(404).json("no such user");
//     }
// });

// //creating /image to update entries count when image is submitted
// app.put("/image", (req, res) => {
//     const {id} = req.body; //here we're receiving user's id from the body and not from params for some reason
//     let found = false;
//     database.users.forEach(user => {
//         if (user.id === id) {
//             found = true;
//             user.entries++;
//             return res.json(user.entries);
//         }
//     });
//     if (!found) {
//         res.status(400).json("no such user");
//     }
// });

// //!------------------------------------ 286. Storing User Passwords
// //npm install bcrypt-nodejs - installing a library that encrypts passwords into hashes

// // bcrypt.hash("bacon", null, null, function(err, hash) {
// //     // Store hash in your password DB.
// // });

// // // Load hash from your password DB.
// // bcrypt.compare("bacon", hash, function(err, res) {
// //     // res == true
// // });

// // bcrypt.compare("veggies", hash, function(err, res) {
// //     // res = false
// // });

// //listening to changes
// app.listen(3000, () => {
//     console.log("app is running on port 3000");
// });

// //layout of our future API
// /*
// /--> res = this is working
// /signin --> POST = success/fail
// /register --> POST - new user
// /profile/:userId --> GET = user
// /image --> PUT (updating the score) --> updated count
// */


