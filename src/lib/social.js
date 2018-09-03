// 
const FB = require('fb');
const google = require('googleapis');

const plus = google.plus('v1');

function getFacebookProfile(accessToken) {
  return FB.api('me', { fields: ['name, email'], access_token: accessToken }).then(
    (auth) => ({
      id: auth.id,
      name: auth.name,
      email: auth.email || null,
    })
  );
}

function getGoogleProfile(accessToken) {
  return new Promise((resolve, reject) => {
    plus.people.get({
      userId: 'me', 
      access_token: accessToken
    }, (err, auth) => {
      if(err) reject(err);

      const {
        id, image, emails, displayName,
      } = auth;

      resolve({
        id,
        name: displayName && displayName.split(' (')[0],
        email: emails[0].value
      });
    });
  });
}

exports.getProfile = (provider, accessToken) => {
  const getters = {
    google: getGoogleProfile,
    facebook: getFacebookProfile
  };
  
  return getters[provider](accessToken);
};