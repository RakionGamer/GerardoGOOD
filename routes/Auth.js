require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
// Middleware para proteger rutas

exports.Passport = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_ID_SECRET,
        callbackURL: "https://p2-30874540.onrender.com/github/callback",
      },
        function (accessToken, refreshToken, profile, cb) {
          return cb(null, profile);
        }
      ));
}


exports.protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(token, process.env.JWTSECRET);
            if (tokenAuthorized) {
                req.user = process.env.SECRET;
                return next();
            }
        } catch (error) {
            console.log(error);
        }
    }

    res.redirect("/login");
};




// Middleware para prevenir el acceso a /login si ya está autenticado
exports.protectRouteLogOut = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(token, process.env.JWTSECRET);
            if (tokenAuthorized) {
                return res.redirect('/contactos');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return next();
};

exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email == process.env.EMAILUSERSECRET && password == process.env.PASSWORDUSERSECRET) {
        const id = process.env.SECRET;
        const token = jwt.sign({ id: id }, process.env.JWTSECRET, { expiresIn: '1h' });
        res.cookie("jwt", token);
        res.redirect("/contactos");
    } else {
        res.send({
            request: 'Usted no está autorizado o no existe sus credenciales para ingresar a los contactos...'
        })
    }

}



// Cerrar sesión
exports.logout = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/login");
};


