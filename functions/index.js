const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.addMessage = functions.https.onRequest((req,res) => {
  const original = req.query.text;
  admin.database().ref('/message').push({original: original}).then(snapshot => {
    res.redirect(303, snapshot.ref);
  });
});

exports.addWelcomeMessages = functions.auth.user().onCreate((event) => {
  const user = event.data;
  console.log('A new user signed!');
  const fullName = user.displayName || 'Anonymous';

  return admin.database().ref('messages').push({
    name: 'Jaymi',
    photoUrl: '/assets/images/firebase-logo.png',
    text: `${fullName} signed in for the first time! welcome.`
  });
});

// TODO(DEVELOPER): Write the blurImages Function here.

// TODO(DEVELOPER): Write the sendNotification Function here.

// (OPTIONAL) TODO(DEVELOPER): Write the annotateMessages Function here.