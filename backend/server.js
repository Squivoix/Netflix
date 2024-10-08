let express = require("express");
let session = require("express-session");
let cors = require("cors");
let jwt = require("jsonwebtoken");

let app = express();

const secretKey = "secretKey";

const API_KEY = "264bb09ec4d858065cfb8860838a32ff";
const DNS = "https://api.themoviedb.org/3";

const data = {
    users: [
        { id: 1, name: "Victor", email: "victor@email.com", password: "1234", age: 18 }
    ]
}

const generateToken = (userId) => {
    return jwt.sign({ userId }, secretKey, { expiresIn: 60 * 60 });
}

app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUnitialized: false
}))

app.post("/login", (req, res) => {
    let loggedIn = false;
    let loggedUser;

    data.users.forEach((user) => {
        if (req.body.email == user.email && req.body.password == user.password) {
            loggedIn = true;
            loggedUser = user;
        }
    })

    if (loggedIn) {
        const sessionData = req.session;
        const token = generateToken(loggedUser.id);

        sessionData.loggedIn = true;
        sessionData.userId = loggedUser.id;
        sessionData.age = loggedUser.age;

        res.send({
            sessionId: token,
            age: loggedUser.age
        });
    } else {
        res.send("Error");
    }
})

app.post("/register", (req, res) => {
    let canRegister = true;

    data.users.forEach((user) => {
        if (req.body.email == user.email) {
            canRegister = false;
        }
    })

    data.users.push({ id: 1, name: "", email: req.body.email, password: req.body.password, age: 16 })
    res.send(canRegister);
})

app.get("/movies", async (req, res) => {
    let URI = `${DNS}${req.headers.path}?api_key=${API_KEY}${req.headers.filter}`;
    let result = await fetch(URI);
    let data = await result.json();

    if (req.headers.age >= 18) {
        await data.results.forEach((movie) => {
            if (movie.adult) {
                console.log(`Movie ${movie}, has been filtered!`)
                data.results.pop(movie);
            }
        })
    }

    res.send(data);
});

app.listen(8080);