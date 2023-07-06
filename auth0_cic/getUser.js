function getByEmail(email, callback) {
  console.log('########## Get User Script ##########')
 
  function handleErr(err) {
    console.log('ERROR": ' + err);
    return callback(err);
  }
 
  function handleResponseErr(res) {
    console.log('RES": ' + JSON.stringify(res, null, 2));
    return callback(res.statusCode)
  }
 
  function handleNoUserFound(users) {
    console.log('NO MATCHING USER FOUND: ' + JSON.stringify(users, null, 2))
    return callback(null);
  }
 
  function getToken(cb) {
    // check that a cached token exists and it is not expired
    if (global.ACCESS_TOKEN && new Date() < global.ACCESS_TOKEN.expiresAt) {
        return cb(global.ACCESS_TOKEN.token);
    }
 
    request.post({
      url: "https://" + configuration.DOMAIN + "/oauth/token",
      json: {
        client_id: configuration.CLIENT_ID,
        client_secret: configuration.CLIENT_SECRET,
        audience: "https://" + configuration.DOMAIN + "/api/v2/",
        grant_type: "client_credentials"
      }
    },
      function (err, res, data) {
        if (err) return handleErr(err);
        if (res.statusCode !== 200) return handleResponseErr(res);
 
        const EXPIRATION_LEEWAY = 2000; // milliseconds
        const expiresAt = new Date(new Date().getTime() - EXPIRATION_LEEWAY + (data.expires_in * 1000));
 
        global.ACCESS_TOKEN = {
            expiresAt : expiresAt,
            token: data.access_token
        };
 
        return cb(data.access_token);
      }
    );
  }
 
  function getUser(accessToken) {
    request.get({
      url: "https://" + configuration.DOMAIN + "/api/v2/users-by-email",
      json: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      qs: {
        "email": email
      }
    }, function (err, res, data) {
      if (err) return handleErr(err);
      if (res.statusCode !== 200) return handleResponseErr(res);
 
      const users = data
      // This assumes that you want the identity that was created for this connection and not a linked identity
      const userByConnection = users.filter(usr => usr.identities[0].connection === configuration.CONNECTION)
 
      if (userByConnection < 1) return handleNoUserFound(users);
      if (userByConnection > 1) return handleErr('more than one user found');
 
      const user = userByConnection[0];
      const profile = {
        "user_id": user.user_id.split('|')[1],
        "name": user.name,
        "given_name": user.given_name,
        "family_name": user.family_name,
        "middle_name": user.middle_name,
        "nickname": user.nickname,
        "preferred_username": user.preferred_username,
        "profile": user.profile,
        "picture": user.picture,
        "website": user.website,
        "email": user.email,
        "email_verified": user.email_verified,
        "gender": user.gender,
        "birthdate": user.birthdate,
        "zoneinfo": user.zoneinfo,
        "locale": user.locale,
        "phone_number": user.phone_number,
        "phone_number_verified": user.phone_number_verified,
        "address": user.address,
        "updated_at": user.updated_at,
      };
      return callback(null, profile);
    });
  }
 
  getToken(token => getUser(token));
}
 
//This code is for reference purposes only and not assumed to be production ready.
