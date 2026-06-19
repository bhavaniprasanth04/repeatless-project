// Auth Controller - Configured for dedicated single user dashboard
const activeUser = {
  email: 'anupojubhavani9849@gmail.com',
  name: 'Bhavani Prasanth',
  avatar: null
};

exports.googleLogin = (req, res) => {
  res.json({
    url: 'http://localhost:5000/api/auth/google/callback',
    message: 'OAuth bypassed, automatically authenticated.'
  });
};

exports.googleCallback = (req, res) => {
  res.redirect('http://localhost:5173/?auth_success=true');
};

exports.getStatus = (req, res) => {
  res.json({
    authenticated: true,
    user: activeUser
  });
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout deactivated for dedicated dashboard user'
  });
};
