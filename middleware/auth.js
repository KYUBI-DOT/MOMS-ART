module.exports = {
    ensureAdmin: (req, res, next) => {
        console.log("Session user:", req.session.user);
      if (req.session.user && req.session.user.role === 'admin') {
        return next();
      } else {
        return res.status(403).send("Access denied: Admins only.");
      }
    }
  };
  