const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth:{
    user:process.env.MAIL_USER,
    pass:process.env.MAIL_PASSWORD,
  }
});

//if there was somekind of template here is were it would be done, there's also
//frameworks for react
const makeANiceEmail = text => `
  <div className="email" style="
  border: 1px solid black;
  paddin:  20px;
  font-family: sans-serif;
  line-height: 2;
  font-size:20px;">
  <h2>Hello There</h2>
  <p>${text}</p>
  <p>😘, Edu</p>
  </div>
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;
