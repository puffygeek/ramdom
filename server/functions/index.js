const functions = require('firebase-functions');
const mailgun = require('mailgun-js')({apiKey: mailgun_key, domain: domain});

const domain = 'randomny.com';
const mailgun_key = functions.config().mailgun.key;
const stripe = require('stripe')(functions.config().stripe.key);
const amount = 40 * 100;

exports.charge = functions.https.onRequest((req, res) => {
  stripe.charges.create({
    amount,
    description: 'Random',
    currency: 'usd',
    source: req.body.stripeToken,
    receipt_email: req.body.stripeEmail,
  }).then(chargeRes => {
    console.log('charge completed', chargeRes);
    return res.send('Thank you, please check your email soon!');
  }).catch(err => {
    console.error('charge error', err);
    return res.send('oops!');
  });
});

exports.webhook = functions.https.onRequest((req, res) => {
  console.log(req.body);
  const email = req.body.data.object.receipt_email;

   const data = {
    from: 'RANDOM <hello@randomny.com>',
    to: email,
    subject: 'Random event details',
    text: `Now we can tell you the full details:
Midtown Manhattan 2/7/19 at 7pm
See you soon
    `,
  };

  mailgun.messages().send(data, (error, body) => {
    console.log('email sent', body)
    return res.send('ok!');
  });
});

mailgun.messages().send({from: 'RANDOM <hello@randomny.com>', to: 'sagiv4@gmail.com', subject: 'hi'}, (error, body) => {
  console.log('email sent', body)
});