const Clarifai = require("clarifai"); //these imports Clarifai api

//?importing api keys from a file that are going to be ignored
// import {myApi} from "..myApi.js"; // - wont work outside of module (eg react)
const myApi = require("../myApi"); // - this will work in node but will not work on heroku in case it's left in .gitignore (heroku doesn't like .gitignore)

const app = new Clarifai.App({
    apiKey: myApi.myApi.key
});

//creating endpoint for Clarifai api on the server, creating endpoint for picture link to be sent from frontend to backend 
const handleApiCall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(clarifaiData => {
        res.json(clarifaiData);
    })
    .catch(err => res.status(400).json("Clarifai API unresponsive", err))
};

const getEntries = (req, res, db) => {
    const {id, picsSubmitted} = req.body;
    // console.log(id, picsSubmitted)

    // //1st way
    // db.select('*').from("users")
    // .where({
    //     id: id
    // })
    // .increment("entries", 1)
    // .then(response => {
    //     res.json(response)
    // })

    // // 2nd way
    // db("users")
    // .returning("*")
    // .where({id: id})
    // .increment("entries", 1)
    // .then(response => {
    //     res.json(response[0].entries)
    // })

    // 3rd way
    db("users")
    .where("id", "=", id)
    .increment("entries", picsSubmitted)
    .update("lastactive", new Date())
    .returning("entries")
    .then(entries => {
        res.json(entries)
    })
    .catch(err => res.status(400).json("unable to get entries"))
};

module.exports = {
    getEntries: getEntries,
    handleApiCall: handleApiCall
};