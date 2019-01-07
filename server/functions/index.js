const functions = require('firebase-functions');
const mailgun = require('mailgun-js')({apiKey: functions.config().mailgun.key, domain: 'randomny.com'});
const stripe = require('stripe')(functions.config().stripe.key);

const amount = 45 * 100;

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
    subject: 'Congratulations! You are ready to join the Random',
    text: `
Welcome to the Random! Here are the event details:

Time: Thursday 2/7/19 at 8pm
Location: 42 W 38th Street, New York, NY, 10018 | Suite #1001,

Here are some details which will give you some idea about what is going to happen:

- When you enter the building, tell the doorman that you are here for suite #1001, he/she will direct you to the 10th floor.
- Upon entering the space, you will be greeted by Random faithful assistants. Do not speak with them, unless you have a specific question, to which they will try to answer without talking to you. Their only job is to observe and assist with the basic logistics of running of the experience, so please do not make any attempt to create an interaction with them.
- They will give you name tags upon which you can write either you personal name or the name you wished to be called that night. You will also get a number. Random will not use your name during the experience, but call you by your number.
- The assistants will also give you masks to wear, and ask you to let go of your phone for the two hours of the experience. This is essential to make sure everybody has a good time. If you are expecting any sort of urgent communication or emergency, it might be a good idea not to attend Random that night.
- Please do not enter the experience space until the assistants allow you to, and wait patiently for them to take care of other guests before getting to you.
- When entering the space, you can start interacting with anyone and everyone. Please maintain all common sense rules of conduct and be respectful of other people. 
- During the two hours of the experience, you will be called to perform collaborative tasks together. You will receive those instructions via the big screen, please pay attention to it during the entire night.
- Participants will be called one by one into the computer room. In the computer room each participant will receive his/her secret objective from Random and it will be up to them to make the most of it.

See you soon,
Random
`,};

  mailgun.messages().send(data, (error, body) => {
    console.log('email sent', body)
    return res.send('ok!');
  });
});
