const functions = require('firebase-functions');

const stripe = require('stripe')(functions.config().stripe.key);
const amount = 40 * 100;

exports.charge = functions.https.onRequest((req, res) => {
  stripe.charges.create({
    amount,
    description: 'Random',
    currency: 'usd',
    source: req.body.stripeToken
  }).then(chargeRes => {
    console.log('charge completed', chargeRes);
    return res.send('Thank you, please check your email soon!');
  }).catch(err => {
    console.error('charge error', err);
    return res.send('oops!');
  });
});
