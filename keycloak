async function login(email, password, callback) {
  var jwt = require('jsonwebtoken');
  var request = require("request");
  const axios = require("axios");
  const transformRequest = (jsonData = {}) => Object.entries(jsonData).map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
	const url = "https://keycloakserver/realms/demo/protocol/openid-connect/token";
var input = {
  client_id: 'account',
  username: email,
  password: password,
  grant_type: 'password',
  scope: 'openid',
  response_type: 'token id_token'
   };
 const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
  try {
    const response = await axios.post(url, transformRequest(input),config );
    const data = response.data;
    var decoded = jwt.decode(data.id_token);
    console.log(decoded);
    var profile = { id : decoded.sub};
    profile.emails = decoded.emails;
    profile.name = decoded.name;
    profile.user_metadata = {};
    profile.user_metadata.given_name = decoded.given_name;
    profile.user_metadata.family_name = decoded.family_name;
    console.log(profile);
    return callback(null, profile, callback);
  } catch (error) {
      console.log(error);
      return callback(new WrongUsernameOrPasswordError(email, error.error_description));
  }
}
