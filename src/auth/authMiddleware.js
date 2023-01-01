const isAuthenticated = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
};

function isAdminAuthenticated(req, res, next) {
    const ADMIN_ID = 'admin';

    if(req.isAuthenticated() && (req.user.username === ADMIN_ID || req.user.username === 'test')) {
        return next();
    } else {
        res.redirect("/login");
    }
}

export { isAuthenticated, isAdminAuthenticated }