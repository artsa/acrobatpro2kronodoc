/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable prefer-template */

const toBase64 = function toBase64(text) {
  const tempStream = util.streamFromString(text);
  const tempStreamEncoded = Net.streamEncode(tempStream, 'base64');

  return Net.stringFromStream(tempStreamEncoded);
};

const toUidPwd = function toUidPwd(username, password) {
  return toBase64(username + ':' + password);
};

const generateMultipartFormData = function generateMultipartFormData(params, boundary) {
  // Store our body request in a string.
  var data = '';

  // eslint-disable-next-line no-restricted-syntax
  for (var param of params) {
    // Start new mutipart parameter
    data += '--' + boundary + '\r\n';
    data += 'content-disposition: form-data; ';

    // Mimetype is used when uploading the file
    if (param.mimetype !== undefined) {
      // Define the name of the form data
      data += 'name="' + param.name + '"; ';
      // Provide the real name of the file
      data += 'filename="' + param.filename + '"\r\n';
      // And the MIME type of the file
      data += 'Content-Type: ' + param.mimetype + '\r\n';
      data += 'Content-Transfer-Encoding: base64\r\n';

      // Add a blank line and the binary data
      data += '\r\n';
      data += param.value + '\r\n';
    } else {
      // The other params then the file
      data += 'name="' + param.name + '"\r\n';
      // Add a blank line and the data
      data += '\r\n';
      data += param.value + '\r\n';
    }
  }

  // End multipart POST
  data += '--' + boundary + '--';

  return data;
};

const addToMenu = function addToMenu(menuText) {
  // Add the menu item
  app.addMenuItem({ cName: '-', cParent: 'File', cExec: ' ' });
  app.addMenuItem({
    cName: menuText,
    cParent: 'File',
    cExec: 'uploadToKD(this);',
    cEnable: 'event.rc = (event.target != null);',
  });
};
