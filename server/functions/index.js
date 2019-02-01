const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mailgun = require('mailgun-js')({apiKey: functions.config().mailgun.key, domain: 'randomny.com'});
const stripe = require('stripe')(functions.config().stripe.key);
const mixpanel = require('mixpanel').init(functions.config().mixpanel.key);

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

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

exports.createUser = functions.https.onRequest((req, res) => {
  db.collection('users').doc(req.body.email).set({
    name: req.body.name,
    email: req.body.email,
    created: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true })
  .then(() => mixpanel.people.set_once(req.body.email, { '$email': req.body.email, '$name': req.body.name, '$created': (new Date()).toISOString() }))
  .then(() => mailgun.messages().send({ from: 'RANDOM <hello@randomny.com>', to: 'random@randomny.com', subject: `NEW USER - ${req.body.name}`, text: `${req.body.name} - ${req.body.email}` }))
  .then(() => res.redirect('https://www.randomny.com/buy'))
  .catch((err) => {
    console.error(err);
    res.redirect('https://www.randomny.com/');
  });
});

exports.webhook = functions.https.onRequest((req, res) => {
  console.log(req.body);
  const email = req.body.data.object.receipt_email;

   const data = {
    from: 'RANDOM <hello@randomny.com>',
    to: email,
    subject: 'Congratulations! You are ready to join the Random',
    text: TEXT,
    html: HTML,
  };

  mailgun.messages().send(data, (error, body) => {
    console.log('email sent', body)
    return res.send('ok!');
  });
});

const TEXT = `
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
`;

const HTML = `
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
        <!-- NAME: 1 COLUMN -->
        <!--[if gte mso 15]>
        <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>*|MC:SUBJECT|*</title>

    <style type="text/css">
    p{
      margin:10px 0;
      padding:0;
    }
    table{
      border-collapse:collapse;
    }
    h1,h2,h3,h4,h5,h6{
      display:block;
      margin:0;
      padding:0;
    }
    img,a img{
      border:0;
      height:auto;
      outline:none;
      text-decoration:none;
    }
    body,#bodyTable,#bodyCell{
      height:100%;
      margin:0;
      padding:0;
      width:100%;
    }
    .mcnPreviewText{
      display:none !important;
    }
    #outlook a{
      padding:0;
    }
    img{
      -ms-interpolation-mode:bicubic;
    }
    table{
      mso-table-lspace:0pt;
      mso-table-rspace:0pt;
    }
    .ReadMsgBody{
      width:100%;
    }
    .ExternalClass{
      width:100%;
    }
    p,a,li,td,blockquote{
      mso-line-height-rule:exactly;
    }
    a[href^=tel],a[href^=sms]{
      color:inherit;
      cursor:default;
      text-decoration:none;
    }
    p,a,li,td,body,table,blockquote{
      -ms-text-size-adjust:100%;
      -webkit-text-size-adjust:100%;
    }
    .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
      line-height:100%;
    }
    a[x-apple-data-detectors]{
      color:inherit !important;
      text-decoration:none !important;
      font-size:inherit !important;
      font-family:inherit !important;
      font-weight:inherit !important;
      line-height:inherit !important;
    }
    #bodyCell{
      padding:10px;
    }
    .templateContainer{
      max-width:600px !important;
    }
    a.mcnButton{
      display:block;
    }
    .mcnImage,.mcnRetinaImage{
      vertical-align:bottom;
    }
    .mcnTextContent{
      word-break:break-word;
    }
    .mcnTextContent img{
      height:auto !important;
    }
    .mcnDividerBlock{
      table-layout:fixed !important;
    }
    body,#bodyTable{
      background-color:#000000;
    }
    #bodyCell{
      border-top:0;
    }
    .templateContainer{
      border:0;
    }
    h1{
      color:#202020;
      font-family:Helvetica;
      font-size:26px;
      font-style:normal;
      font-weight:bold;
      line-height:125%;
      letter-spacing:normal;
      text-align:left;
    }
    h2{
      color:#202020;
      font-family:Helvetica;
      font-size:22px;
      font-style:normal;
      font-weight:bold;
      line-height:125%;
      letter-spacing:normal;
      text-align:left;
    }
    h3{
      color:#202020;
      font-family:Helvetica;
      font-size:20px;
      font-style:normal;
      font-weight:bold;
      line-height:125%;
      letter-spacing:normal;
      text-align:left;
    }
    h4{
      color:#202020;
      font-family:Helvetica;
      font-size:18px;
      font-style:normal;
      font-weight:bold;
      line-height:125%;
      letter-spacing:normal;
      text-align:left;
    }
    #templatePreheader{
      background-color:#000000;
      background-image:none;
      background-repeat:no-repeat;
      background-position:center;
      background-size:cover;
      border-top:0;
      border-bottom:0;
      padding-top:9px;
      padding-bottom:9px;
    }
    #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
      color:#656565;
      font-family:Helvetica;
      font-size:12px;
      line-height:150%;
      text-align:left;
    }
    #templatePreheader .mcnTextContent a,#templatePreheader .mcnTextContent p a{
      color:#656565;
      font-weight:normal;
      text-decoration:underline;
    }
    #templateHeader{
      background-color:#000000;
      background-image:none;
      background-repeat:no-repeat;
      background-position:center;
      background-size:cover;
      border-top:0;
      border-bottom:0;
      padding-top:9px;
      padding-bottom:0;
    }
    #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
      color:#ffffff;
      font-family:Helvetica;
      font-size:16px;
      line-height:150%;
      text-align:left;
    }
    #templateHeader .mcnTextContent a,#templateHeader .mcnTextContent p a{
      color:#2BAADF;
      font-weight:normal;
      text-decoration:underline;
    }
    #templateBody{
      background-color:#000000;
      background-image:none;
      background-repeat:no-repeat;
      background-position:center;
      background-size:cover;
      border-top:0;
      border-bottom:2px solid #EAEAEA;
      padding-top:0;
      padding-bottom:9px;
    }
    #templateBody .mcnTextContent,#templateBody .mcnTextContent p{
      color:#ffffff;
      font-family:Helvetica;
      font-size:16px;
      line-height:150%;
      text-align:left;
    }
    #templateBody .mcnTextContent a,#templateBody .mcnTextContent p a{
      color:#ffffff;
      font-weight:bold;
      text-decoration:none;
    }
    #templateFooter{
      background-color:#000000;
      background-image:none;
      background-repeat:no-repeat;
      background-position:center;
      background-size:cover;
      border-top:0;
      border-bottom:0;
      padding-top:9px;
      padding-bottom:9px;
    }
    #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
      color:#656565;
      font-family:Helvetica;
      font-size:12px;
      line-height:150%;
      text-align:center;
    }
    #templateFooter .mcnTextContent a,#templateFooter .mcnTextContent p a{
      color:#656565;
      font-weight:normal;
      text-decoration:underline;
    }
  @media only screen and (min-width:768px){
    .templateContainer{
      width:600px !important;
    }

} @media only screen and (max-width: 480px){
    body,table,td,p,a,li,blockquote{
      -webkit-text-size-adjust:none !important;
    }

} @media only screen and (max-width: 480px){
    body{
      width:100% !important;
      min-width:100% !important;
    }

} @media only screen and (max-width: 480px){
    #bodyCell{
      padding-top:10px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnRetinaImage{
      max-width:100% !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImage{
      width:100% !important;
    }

} @media only screen and (max-width: 480px){
    .mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
      max-width:100% !important;
      width:100% !important;
    }

} @media only screen and (max-width: 480px){
    .mcnBoxedTextContentContainer{
      min-width:100% !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageGroupContent{
      padding:9px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
      padding-top:9px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
      padding-top:18px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageCardBottomImageContent{
      padding-bottom:9px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageGroupBlockInner{
      padding-top:0 !important;
      padding-bottom:0 !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageGroupBlockOuter{
      padding-top:9px !important;
      padding-bottom:9px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnTextContent,.mcnBoxedTextContentColumn{
      padding-right:18px !important;
      padding-left:18px !important;
    }

} @media only screen and (max-width: 480px){
    .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
      padding-right:18px !important;
      padding-bottom:0 !important;
      padding-left:18px !important;
    }

} @media only screen and (max-width: 480px){
    .mcpreview-image-uploader{
      display:none !important;
      width:100% !important;
    }

} @media only screen and (max-width: 480px){
    h1{
      font-size:22px !important;
      line-height:125% !important;
    }

} @media only screen and (max-width: 480px){
    h2{
      font-size:20px !important;
      line-height:125% !important;
    }

} @media only screen and (max-width: 480px){
    h3{
      font-size:18px !important;
      line-height:125% !important;
    }

} @media only screen and (max-width: 480px){
    h4{
      font-size:16px !important;
      line-height:150% !important;
    }

} @media only screen and (max-width: 480px){
    .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
      font-size:14px !important;
      line-height:150% !important;
    }

} @media only screen and (max-width: 480px){
    #templatePreheader{
      display:block !important;
    }

} @media only screen and (max-width: 480px){
    #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
      font-size:14px !important;
      line-height:150% !important;
    }

} @media only screen and (max-width: 480px){
    #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
      font-size:16px !important;
      line-height:150% !important;
    }

} @media only screen and (max-width: 480px){
    #templateBody .mcnTextContent,#templateBody .mcnTextContent p{
      font-size:16px !important;
      line-height:150% !important;
    }

} @media only screen and (max-width: 480px){
    #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
      font-size:14px !important;
      line-height:150% !important;
    }

}</style></head>
    <body style="height: 100%;margin: 0;padding: 0;width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;">
        <!--*|IF:MC_PREVIEW_TEXT|*-->
        <!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->
        <!--*|END:IF|*-->
        <center>
            <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;background-color: #000000;">
                <tbody><tr>
                    <td align="center" valign="top" id="bodyCell" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 10px;width: 100%;border-top: 0;">
                        <!-- BEGIN TEMPLATE // -->
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                        <tr>
                        <td align="center" valign="top" width="600" style="width:600px;">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;border: 0;max-width: 600px !important;">
                            <tbody><tr>
                                <td valign="top" id="templatePreheader" style="background:#000000 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 9px;"></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateHeader" style="background:#000000 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 0;"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <tbody class="mcnImageBlockOuter">
            <tr>
                <td valign="top" style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnImageBlockInner">
                    <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                        <tbody><tr>
                            <td class="mcnImageContent" valign="top" style="padding-right: 9px;padding-left: 9px;padding-top: 0;padding-bottom: 0;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">

                                    <a href="https://www.randomny.com/" title="" class="" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <img align="center" alt="" src="https://gallery.mailchimp.com/0c23d7616e122d84f98f9651b/images/ea58c7c7-7a26-48d2-a46b-b0a145632995.jpg" width="564" style="max-width: 600px;padding-bottom: 0px;vertical-align: bottom;display: inline !important;border-radius: 0%;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" class="mcnImage">
                                    </a>

                            </td>
                        </tr>
                    </tbody></table>
                </td>
            </tr>
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <!--[if mso]>
        <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
        <tr>
        <![endif]-->

        <!--[if mso]>
        <td valign="top" width="600" style="width:600px;">
        <![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer">
                    <tbody><tr>

                        <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px; text-size-adjust: 100%; word-break: break-word; line-height: 150%; text-align: left;">

                            <h1 style="color: rgb(32, 32, 32); font-family: Helvetica; font-size: 26px; display: block; margin: 0px; padding: 0px; font-style: normal; font-weight: bold; line-height: 125%; letter-spacing: normal; text-align: left;"><span style="color:#FFFFFF">Welcome stranger,</span></h1>

<p dir="ltr">Welcome to the Random! Here are the event details:</p><p dir="ltr"><br></p><p dir="ltr">Time: Thursday 2/7/19 at 8pm</p><p dir="ltr">Location: 42 W 38th Street, New York, NY, 10018 | Suite #1001,</p><p dir="ltr"><br></p><p dir="ltr">Here are some details which will give you some idea about what is going to happen:</p><p dir="ltr"><br></p><p dir="ltr">- When you enter the building, tell the doorman that you are here for suite #1001, he/she will direct you to the 10th floor.</p><p dir="ltr">- Upon entering the space, you will be greeted by Random's faithful assistants. Do not speak with them, unless you have a specific question, to which they will try to answer without talking to you. Their only job is to observe and assist with the basic logistics of running of the experience, so please do not make any attempt to create an interaction with them.</p><p dir="ltr">- They will give you name tags, upon which you can write either your real name or the name you wished to be called that night. You will also get a number. Random will not use your name during the experience, but call you by your number.</p><p dir="ltr">- The assistants will also give you masks to wear, and ask you to let go of your phone for the two hours of the experience. This is essential to make sure everybody has a good time. If you are expecting any sort of urgent communication or emergency, it might be a good idea not to attend Random that night.</p><p dir="ltr">- Please do not enter the experience space until the assistants allow you to, and wait patiently for them to take care of other guests before getting to you.</p><p dir="ltr">- When entering the space, you can start interacting with anyone and everyone. Please maintain all common sense rules of conduct and be respectful of other people.</p><p dir="ltr">- During the two hours of the experience, you will be called to perform collaborative tasks together. You will receive those instructions via the big screen, please pay attention to it during the entire night.</p><p dir="ltr">- Participants will be called one by one into the computer room. In the computer room each participant will receive his/her secret objective from Random and it will be up to them to make the most of it.</p><p dir="ltr">&nbsp;- During the entire experience, follow the core rules of Random:&nbsp;</p><p dir="ltr">1. Be bold - push yourself out of your comfort zone.</p><p dir="ltr">2. Be positive - respect the people in the room.</p><p dir="ltr">3. Be creative - try to accomplish your objectives in creative ways and don't be afraid to explore.</p><p dir="ltr"><br></p><p dir="ltr">Thank you for being a part of Random. Random is sure this experience has the potential to change who you are forever.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td valign="top" id="templateBody" style="background:#000000 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 2px solid #EAEAEA;padding-top: 0;padding-bottom: 9px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnButtonBlockOuter">
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <!--[if mso]>
        <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
        <tr>
        <![endif]-->

        <!--[if mso]>
        <td valign="top" width="600" style="width:600px;">
        <![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer">
                    <tbody><tr>

                        <td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #ffffff;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">

                            <p dir="ltr" style="line-height: 24px;">See you soon,</p>
<a href="https://www.randomny.com/" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #ffffff;font-weight: bold;text-decoration: none;">Random</a><p></p>

                        </td>
                    </tr>
                </tbody></table>
        <!--[if mso]>
        </td>
        <![endif]-->

        <!--[if mso]>
        </tr>
        </table>
        <![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateFooter" style="background:#000000 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 9px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <!--[if mso]>
        <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
        <tr>
        <![endif]-->

        <!--[if mso]>
        <td valign="top" width="600" style="width:600px;">
        <![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer">
                    <tbody><tr>

                        <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px;color: #FFFFFF;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;font-family: Helvetica;font-size: 12px;line-height: 150%;text-align: center;">

                            In Random We Trust<br></td>
                    </tr>
                </tbody></table>
</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></center></body></html>
`
