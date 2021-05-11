const handleRegister = (req, res, db, bcrypt) => {
    //destructuring client request to the server
    const {name, email, password} = req.body;

    //adding server check for empty fields
    if (!name || !email || !password) {
        return res.status(400).json("form has empty fields")
    };
    
    //storing password hash
    const hash = bcrypt.hashSync(password);

    console.log("register request is", req.body);

    //adding transaction to connect and euqlize login and users dbs
    db.transaction(trx => { //it first inserts stuff into login db
        trx.insert({
            hash: hash,
            email: email
        })
        .into("login")
        .returning("email") //then returns the login email to use in users db
        .then(loginEmail => {
            //inserting data to db with knex
            return trx("users") //here db is changed to trx so that the whole thign stays as one transaction
            .returning("*")
            .insert({ //and inserts the rest of data into users db
                email: loginEmail[0], //[0], because otherwise it returns an array [{email}]
                name: name,
                joined: new Date(),
                lastactive: new Date()
            })
            .then(user => {
                res.json(user[0]); //responds to the frontend with user info
            })
        })
        .then(trx.commit) //if everything above passes, it commits the changes
        .catch(trx.rollback) //if smth fails, it rolls back the changes
    })
    .catch(err => res.status(400).json("unable to register"));
};

module.exports = {
    handleRegister:handleRegister
};