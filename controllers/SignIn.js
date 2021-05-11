const handleSignIn = (req, res, db, bcrypt) => {
    console.log("signin request is", req.body);
    const {email, password} = req.body;

    //adding server check for empty fields
    if (!email || !password) {
        return res.status(400).json("form has empty fields")
    };

    db.select("email", "hash").from("login")
    .where({email: email}) //1st way
    // .where("email", "=", req.body.email) //2nd way
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            return db.select("*").from("users")
            .where({
                email: email
            })
            .update("lastactive", new Date())
            .returning("*")
            .then(userInfo => {
                res.json(userInfo[0])
            })
            .catch(err => res.status(400).json("unable to get user"))
        }
        else {
            res.status(400).json("wrong credentials")
        }
    })
    .catch(err => res.status(400).json("wrong credentials"))
};

module.exports = {
    handleSignIn: handleSignIn
};