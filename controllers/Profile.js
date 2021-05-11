const getProfile = (req, res, db) => {
    const {id} = req.params;
    db.select('*').from("users")
    .where({
        id: id //or in ES6 just {id} instead
    })
    .then(user => {
        if (user.length) {
            res.json(user[0])
        }
        else {
            res.status(400).json("Not found")
        }
    })
    .catch(err => res.status(400).json("not found"));
};

module.exports = {
    getProfile: getProfile
};