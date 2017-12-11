const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const gcs = require('@google-cloud/storage')();
const vision = require('@google-cloud/vision')();
const exec = require('child-process-promise').exec;

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
exports.blurOffensiveImages = functions.storage.object().onChange((event) => {
  const object = event.data;
  if(object.resourceState == 'not_exists') {
    return console.log('deletion event');
  } else if (!object.name) {
    return console.log('deploy event.');
  }

  const messageId = object.name.split('/')[1];
  const bucket = gcs.bucket(object.bucket);
  const file = bucket.file(object.name);

  return admin.database().ref(`/messages/${messageId}/moderated`).once('value')
  .then((snapshot) => {
    if(snapshot.val()){
      return;
    }
    return vision.detectSafeSearch(file);
  })
  .then((safeSearchResult) => {
    if(safeSearchResult[0].adult || safeSearchResult[0].violence) {
      console.log('The image', object.name, 'has been detected as inappropriate.');
      return blurImage(object.name, bucket);
    } else {
      console.log('The image', object.name,'has been detected as OK.');
    }
  })
})

// Blurs the given image located in the given bucket using ImageMagick.
function blurImage(filePath, bucket, metadata) {
  const fileName = filePath.split('/').pop();
  const tempLocalFile = `/tmp/${fileName}`;
  const messageId = filePath.split('/')[1];

  // Download file from bucket.
  return bucket.file(filePath).download({ destination: tempLocalFile })
    .then(() => {
      console.log('Image has been downloaded to', tempLocalFile);
      // Blur the image using ImageMagick.
      return exec(`convert ${tempLocalFile} -channel RGBA -blur 0x24 ${tempLocalFile}`);
    })
    .then(() => {
      console.log('Image has been blurred');
      // Uploading the Blurred image back into the bucket.
      return bucket.upload(tempLocalFile, { destination: filePath });
    })
    .then(() => {
      console.log('Blurred image has been uploaded to', filePath);
      // Indicate that the message has been moderated.
      return admin.database().ref(`/messages/${messageId}`).update({ moderated: true });
    })
    .then(() => {
      console.log('Marked the image as moderated in the database.');
    });
}


// TODO(DEVELOPER): Write the sendNotification Function here.

// (OPTIONAL) TODO(DEVELOPER): Write the annotateMessages Function here.
