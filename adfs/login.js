async function login(email, password, callback) {
  const jwt = require('jsonwebtoken');
  const axios = require('axios');
  const transformRequest = (jsonData = {}) => Object.entries(jsonData).map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
  const adfs_domain = '[YOUR ADFS DOMAIN]';
  const client_id = '[YOUR ADFS APP CLIENT ID]';
  const client_secret = '[YOUR ADFS CLIENT SECRET]';
  const url = `https://${adfs_domain}/adfs/oauth2/token`;
  const input = { 
    client_id,
    client_secret,
    scope: 'openid',
    username: email,
    password: password,
    grant_type: 'password',
  };
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  try {
    const response = await axios.post(url, transformRequest(input), config);
    const {data} = response;
    //console.log({data});
    const decoded = jwt.decode(data.id_token);
    //console.log(decoded);
    const profile = { id : decoded.sub};
    profile.email = email;
    profile.name = decoded.name;
    profile.user_metadata.given_name = decoded.given_name;
    profile.user_metadata.family_name = decoded.family_name;
    
    return callback(null, profile, callback);
  } catch (error) {
    console.log(error);
    return callback(error);
  }
}
