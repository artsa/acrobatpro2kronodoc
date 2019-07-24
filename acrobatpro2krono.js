
app.addMenuItem({cName:"-", cParent:"Help", cExec:" "}); 
app.addMenuItem({cName:"UPLOAD", cParent:"Help", cExec:"uploadToKD(this);", cEnable: "event.rc = (event.target != null);"});
app.addMenuItem({cName:"SUBMIT", cParent:"Help", cExec:"submitToKD(this);", cEnable: "event.rc = (event.target != null);"});
app.addMenuItem({cName:"SOAP", cParent:"Help", cExec:"uploadViaSOAP(this);", cEnable: "event.rc = (event.target != null);"});

// var targetUrl = 'https://ppdemo.bluecieloecm.com/kronodoc';
var targetUrl = "http://127.0.0.1:8800/kronodoc"
var sUidpwd = 'YWRtaW46a3Jvbm9kb2MK';

var uploadid = Math.random().toString(36).substring(2, 15);

var text = "Some text data"
var uploadparams = [];
uploadparams.push({name: 'uploadtype', value: 'JUpload'});
uploadparams.push({name: 'uploadid', value: uploadid});
uploadparams.push({name: 'force', value: 1});
uploadparams.push({name: 'action', value: 'filetransop'});
uploadparams.push({name: 'uidpwd', value: sUidpwd});
// console.println('params1: ' + uploadparams);

console.show();

generateMultipartFormData = function (params) {
    // We need a separator to define each part of the request
    var boundary = "blob";

    // Store our body request in a string.
    var data = "";

    for (var p of params) {
      // console.println('p: ' + p);

      // Start a new part in our body's request
      data += "--" + boundary + "\r\n";

      // Describe it as form data
      data += 'content-disposition: form-data; ';

      if (p.type !== undefined) {
        // Define the name of the form data
        data += 'name="'         + p.name          + '"; ';
        // Provide the real name of the file
        data += 'filename="'     + p.filename + '"\r\n';
        // And the MIME type of the file
        data += 'Content-Type: ' + p.type + '\r\n';
        data += 'Content-Transfer-Encoding: base64\r\n';

        // There's a blank line between the metadata and the data
        data += '\r\n';
        
        // Append the binary data to our body's request
        data += p.value + '\r\n';
      } else {
        data += 'name="' + p.name + '"\r\n';
        // There's a blank line between the metadata and the data
        data += '\r\n';

        // Append the text data to our body's request
        data += p.value + "\r\n";
      }
    }

    // Once we are done, "close" the body's request
    data += "--" + boundary + "--";

    return data;
}

var uploadToKD = app.trustedFunction(function (foo) {
  var a = foo.path;
  console.println(app.getPath("app","javascript"));
  // console.println(a);
  var rStream = util.readFileIntoStream(foo.path, true);
  console.println('rStream length: ' + rStream.length);
  var cFile = util.stringFromStream(rStream, 'utf-8');
  console.println('  cFile length: ' + cFile.length);
  console.println(util.printx("??????????", cFile));
  // var binary_file = Base64.decode(cFile);
  // console.println('bFile length: ' + binary_file.length);

  // uploadparams.push({name: 'filename', type: 'text/plain', value: 'jalla', filename: 'jalla.txt'});
  uploadparams.push({name: 'filename', type: 'application/pdf', value: cFile, filename: foo.documentFileName});

  var postContent = generateMultipartFormData(uploadparams);
  console.println(postContent);
  console.println(targetUrl)
  var params = {
    cVerb: "POST",
    cURL: targetUrl,
    oRequest: util.streamFromString( postContent ),
    aHeaders: [{name: 'Content-Type', value: 'multipart/form-data; boundary=blob'}],
    oHandler: {
      response: function(oRequest, cURL, oException, aHeaders) {
        console.println(JSON.stringify(oRequest));
        console.println(JSON.stringify(cURL));
        console.println(JSON.stringify(oException));
        console.println(JSON.stringify(aHeaders));
        if ( oException != undefined ) {
          console.println('An error occured:')
          console.println('Error text: ' + oException.text);
          console.println('Error code: ' + oException.error);
          console.println('Error type: ' + oException.type);
        }
      }
    }
  };
  app.beginPriv();
  Net.HTTP.request(params);
  app.launchURL(targetUrl + "?action=easyup_tgtsel&tplset=officeint&uploadid=" + uploadid, true);
  app.endPriv();
});
// app.trustedFunction(uploadToKD);

submitToKD = app.trustedFunction(function (foo) {
  console.show();
  console.println(app.getPath("app","javascript"));

  var rStream = util.readFileIntoStream(foo.path, true);
  var cFile = util.stringFromStream(rStream);

  var post_content = {
    "uidpwd": sUidpwd,
    "workspaceid": 1820,
    "documentid": 65462,
    "filebase64": rStream,
    "filename": "uploadtest.pdf",
    "force": 1
  }

  var sUidpwd = "QXJpVGVzdGFhOnRoMHdzMVZFCg==";
  var post_content_json = {
    "uidpwd": sUidpwd,
    "filename": rStream,
  }

  var params = {
    cVerb: "POST",
    cURL: targetUrl + "/ws/json?action=filetransop&uploadid=ODE&uploadtype=JSUpload",
    oHandler: {
      response: function(msg, uri, e) {
        if ( e != undefined ) {
          app.alert("Failed: " + e);
        } else {
          var tmpMsg = ''
          for ( var i in msg ) tmpMsg = tmpMsg + '\n' + i;
          var tmpE = '';
          for ( var i in e ) tmpE = tmpE + '\n' + i;
          app.alert("Msg. " + tmpMsg);
          app.alert("E. " + tmpE);
          console.log('msg: ' + tmpMsg)
          console.log('e: ' + tmpE)
        }
      }
    }
  };

  foo.submitForm({cURL: targetUrl + "?action=filetransop&uploadid=ODE&uploadtype=JSUpload", cSubmitAs: "PDF"});
});

uploadViaSOAP = app.trustedFunction(function (foo) {
  console.show();
  jalla();

  // var cURL = 'https://ppdemo.bluecieloecm.com/KRONO-WWW/ws/Kronodoc.wsdl';
  var cURL = 'http://127.0.0.1:8800/KRONO-WWW/ws/Kronodoc.wsdl';

  var service = SOAP.connect(cURL);
   // Print out the methods this service supports to the console
  // for ( var i in service ) console.println(i);
  var oRequest = {
        soapValue:  "<ListWorkspaces xmlns='http://www.kronodoc.fi/ws'>"+
                    "<uidpwd>YWRtaW46a3Jvbm9kb2MK</uidpwd>"+
                    "</ListWorkspaces>"};
  SOAP.wireDump = "true";
  var response = SOAP.request({
      cURL: 'http://127.0.0.1:8800/kronodoc/ws',
      oRequest:oRequest,
      bEncoded:false
      });
  //  var rStream = util.readFileIntoStream(foo.path, true);
  //  var cFile = util.stringFromStream(rStream);
  // var res = service.ListWorkspaces();
  // var res = service.ListWorkspaces({'uidpwd': 'YWRtaW46a3Jvbm9kb2MK'});
  //  var res = service.UploadFile({ soapType: "xsd:int", soapValue: "1000" }, { soapType: "xsd:int", soapValue: "1020" }, 'foo.txt', cFile, { soapType: "xsd:int", soapValue: "1" });
  console.println(response)
});