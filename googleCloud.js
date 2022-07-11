const fs = require('fs');
/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
 const bucketName = 'skdev-356007.appspot.com';
// The ID of your GCS file
 const fileName = 'IMG/user_profile/47539_punsn.jpeg';
// The filename and file path where you want to download the file
// const destFileName = '/Users/sirisuk/Downloads/47539_punsn.jpeg';
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client
const storage = new Storage({keyFilename: 'skdev-356007-70b2ea60723d.json'});

async function streamFileDownload(req, res) {
    // Lists files in the bucket
    const [files] = await storage.bucket(bucketName).getFiles();

    console.log(files);
    console.log('Files:');
    files.forEach(file => {
        console.log(file.name);
    });
    await storage.bucket(bucketName).file(fileName).createReadStream().pipe(res);
  
  
}
async function uploadFile(uploadFilePath, destFileName) {
    await storage.bucket(bucketName).upload(uploadFilePath, {
      destination: destFileName
    });
  
    console.log(`${uploadFilePath} uploaded to ${bucketName}`);
}


