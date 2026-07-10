const { sendPasswordResetEmail } = require('./services/emailService');
sendPasswordResetEmail('shubhamverma8299@gmail.com', '123456')
  .then(console.log)
  .catch(console.error);
