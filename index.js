require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GithubMechnism = require("passport-github2").Strategy;

const app = express();

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    })
)

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GithubMechnism(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback"
        },
        (accessToken, refreshToken, profile, done) =>{
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.get("/", (req, res) => {
    res.send("<a href='/auth/github'>Login with GitHub</a>")
});

app.get("/auth/github",
    passport.authenticate("github",
        {
             scope: ["profile", "email"]
        }
    )
);

app.get("/auth/github/callback", passport.authenticate('github',
    {
        failureRedirect: "/"
    }),
    (req, res) => {
        res.redirect('/profile')
    }
)

app.get("/profile", (req, res) => {
    res.send(`Welcome ${req.user.displayName}`)
})

app.get("/logout", (req, res) => {
    req.logOut(() => {
        res.redirect("/");
    })
})

app.listen(3000, ()=>{
    console.log(`Server is running at port 3000`)
})