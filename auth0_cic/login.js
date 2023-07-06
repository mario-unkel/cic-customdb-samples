unction login(email, password, callback) {
 
  const LOG_LEVEL_DEBUG = 'DEBUG';
  const LOG_LEVEL_INFO = 'INFO';
  const LOG_LEVEL_WARN = 'WARN';
  const LOG_LEVEL_ERROR = 'ERROR';
   
  //Adjust this according to needs
  const TIMEOUT_IN_MILLI_SECONDS = 5000;
 
  sendLog('DEBUG', 'Inside login script');
 
  const axios = require('axios');
  const http = require('http');
  const https = require('https');
  const jwt = require('jsonwebtoken');
 
  var authenticateUrl = "https://" + configuration.API_URL + '/oauth/token';
 
 
  sendLog(LOG_LEVEL_DEBUG, 'authenticateUrl is:' + authenticateUrl);
 
  var authenticatePostBody = {
     'grant_type': "http://auth0.com/oauth/grant-type/password-realm",
      'realm': configuration.CONNECTION,
      'scope': 'openid profile email',
      'client_id': configuration.CLIENT_ID,
      'client_secret': configuration.CLIENT_SECRET,
      'username': email,
      'password': password
  };
  var authenticateHeaders = {
    'content-type': 'application/json'
  };
 
  return authenticateUserAndReturnProfile();
 
  function authenticateUserAndReturnProfile() {
    axios.post(authenticateUrl, authenticatePostBody,
      {
        headers: authenticateHeaders,
        timeout: TIMEOUT_IN_MILLI_SECONDS,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true })
      })
      .then(function (response) {
        sendLog(LOG_LEVEL_DEBUG, 'Successfully authenticated user');       
 
        return mapToAuth0Profile(response.data);
      })
      .catch(function (error) {
        sendLog(LOG_LEVEL_ERROR, 'Authenticate call failed with error: Error Response:' + error);
        return callback(new WrongUsernameOrPasswordError(email, "Incorrect username/email or password."));
      });
  }
   
 
  function mapToAuth0Profile(body) {
    const idToken = jwt.decode(body.id_token); // jwt_decode
    const profile = {
      //remove the 'auth0|' prefix from the user id as it gets added back automatically
      "user_id": idToken.sub.replace(/^auth0\|/, ''),
      "name": idToken.name,
      "given_name": idToken.given_name,
      "family_name": idToken.family_name,
      "middle_name": idToken.middle_name,
      "nickname": idToken.nickname,
      "preferred_username": idToken.preferred_username,
      "profile": idToken.profile,
      "picture": idToken.picture,
      "website": idToken.website,
      "email": idToken.email,
      "email_verified": idToken.email_verified,
      "gender": idToken.gender,
      "birthdate": idToken.birthdate,
      "zoneinfo": idToken.zoneinfo,
      "locale": idToken.locale,
      "phone_number": idToken.phone_number,
      "phone_number_verified": idToken.phone_number_verified,
      "address": idToken.address,
      "updated_at": idToken.updated_at,
    };
 
    sendLog(LOG_LEVEL_DEBUG, 'user profile retrieved is:' + JSON.stringify(profile));   
    return callback(null, profile);
  }
 
  function sendLog(logLevel, message) {
    const logLevels = new Map([[LOG_LEVEL_DEBUG, 1], [LOG_LEVEL_INFO, 2], [LOG_LEVEL_WARN, 3], [LOG_LEVEL_ERROR, 4]]);
 
    const isWriteLog = logLevels.get(logLevel.toUpperCase()) >= logLevels.get(configuration.LOG_LEVEL.toUpperCase());
 
    if (isWriteLog) {
      var logData = {
        status: logLevel || LOG_LEVEL_DEBUG,
        message
      };
      console.log(logData);
    }
  }
}
 
//This code is for reference purposes only and not assumed to be production ready.
