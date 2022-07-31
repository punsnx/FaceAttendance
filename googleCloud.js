const fs = require('fs');
/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
 const bucketName = 'skdev-356007.appspot.com';
// The ID of your GCS file
// const fileName = 'IMG/user_profile/47539_punsn.jpeg';
// The filename and file path where you want to download the file
// const destFileName = '/Users/sirisuk/Downloads/47539_punsn.jpeg';
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client
const storage = new Storage({keyFilename: 'skdev-356007-70b2ea60723d.json'});

exports.downloadFile = async (filePathName, destFileName) => {
    const options = {
      destination: destFileName,
    };
  
    // Downloads the file
    await storage.bucket(bucketName).file(filePathName).download(options);
  
    console.log(
      `gs://${bucketName}/${fileName} downloaded to ${destFileName}.`
    );
};
exports.uploadFile = async (uploadFilePath, destFileName) => {
  await storage.bucket(bucketName).upload(uploadFilePath, {
    destination: destFileName,
  });
};
//background-color: rgb(128, 0, 255);
//background-color: rgb(60, 0, 120);
//background-color: #282a35;