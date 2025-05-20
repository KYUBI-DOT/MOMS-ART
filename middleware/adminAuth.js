// middleware/adminAuth.js

// middleware/adminAuth.js
exports.isAdminLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    return next();
  }
  res.redirect('/admin/login');
};

