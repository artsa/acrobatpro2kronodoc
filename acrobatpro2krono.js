/* eslint-disable no-undef */
/* eslint-disable prefer-template */
/* eslint-disable prefer-arrow-callback */

// TODO: Fetch credentials, menuText and targetURL from a config file (preferably krono.ini)
// TODO: Fix to work with the latest version. Now works with PP 2012.1.
const menuText = 'Send to Kronodoc';
const debugLevel = 0;
const targetUrl = 'http://127.0.0.1:8800/kronodoc';
const username = 'admin';
const password = 'kronodoc';
const uidPwd = toUidPwd(username, password);
const uploadid = Math.random().toString(36).substring(2, 15);

// Some string as the separator of multipart form data
const boundary = 'KronodocRulez';

addToMenu(menuText);

const uploadparams = [];
uploadparams.push({ name: 'uploadtype', value: 'JUpload' });
uploadparams.push({ name: 'uploadid', value: uploadid });
uploadparams.push({ name: 'force', value: 1 });
uploadparams.push({ name: 'action', value: 'filetransop' });
uploadparams.push({ name: 'uidpwd', value: uidPwd });

if (debugLevel > 0) {
  console.show();
}

const uploadToKD = function uploadToKD(document) {
  const rStream = util.readFileIntoStream(document.path, true);
  const cFile = util.stringFromStream(rStream, 'utf-8');
  if (debugLevel > 1) {
    console.println('rStream length: ' + rStream.length);
    console.println('  cFile length: ' + cFile.length);
    console.println(util.printx('??????????', cFile));
  }

  uploadparams.push({
    name: 'filename',
    mimetype: 'application/pdf',
    value: cFile,
    filename: document.documentFileName,
  });

  const postContent = generateMultipartFormData(uploadparams, boundary);
  if (debugLevel > 1) {
    console.println(postContent);
    console.println(targetUrl);
  }

  const params = {
    cVerb: 'POST',
    cURL: targetUrl,
    oRequest: util.streamFromString(postContent),
    aHeaders: [{ name: 'Content-Type', value: 'multipart/form-data; boundary=' + boundary }],
    oHandler: {
      response: function response(oRequest, cURL, oException, aHeaders) {
        if (debugLevel > 0) {
          console.println('Response body: \n' + JSON.stringify(oRequest));
          console.println('URL: \n' + cURL);
          console.println('Response headers: \n' + JSON.stringify(aHeaders));
        }
        if (oException !== undefined) {
          console.println('An error occured:');
          console.println('Error text: ' + oException.text);
          console.println('Error code: ' + oException.error);
          console.println('Error type: ' + oException.type);
        }
      },
    },
  };

  Net.HTTP.request(params);
  app.launchURL(targetUrl + '?action=easyup_tgtsel&tplset=officeint&uploadid=' + uploadid, true);
};
