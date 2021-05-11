const getLeaderboard = (req, res, db) => {
    db.select("name", "entries", "lastactive")
    .from("users")
    .where("entries", ">", 0)
    .orderBy("entries", "desc")
    // .sum(knex.raw("current_timestamp", ["lastactive"])
    // .havingRaw("current_timestamp", "-", "lastactive")
    .then(users => {
        res.json(users)
    })
    .catch(err => res.status(400).json("leaderboard unavailable"))
};

module.exports = {
    getLeaderboard
    //instead of getLeaderboard: getLeaderboard in new ES
};