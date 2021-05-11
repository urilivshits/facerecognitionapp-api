const Clarifai = require("clarifai"); //these imports Clarifai api

const app = new Clarifai.App({
    apiKey: "89126de9e3404d2d893506395d8ea25f"
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