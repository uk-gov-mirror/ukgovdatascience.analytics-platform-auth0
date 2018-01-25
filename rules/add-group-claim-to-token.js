function (user, context, callback) {

  function github_access_token() {
    var github_identity = _.find(user.identities, {connection: 'github'});
    return github_identity.access_token;
  }

  if (context.connection === 'github') {
    // For custom claims, you must define a namespace for oidc compliance.
    // See https://auth0.com/docs/api-auth/tutorials/adoption/scope-custom-claims
    var namespace = 'https://api.dev.mojanalytics.xyz/claims/';
    var options = {
      url: 'https://api.github.com/user/teams',
      headers: {
        'Authorization': 'token ' + github_access_token(),
        'User-Agent': 'request'
      }
    };

    var request = require('request');
    request(options, function (error, response, body) {
      if (response.statusCode !== 200) {
        return callback(new Error('Error retrieving teams from github: ' + body || error));

      } else {
        var git_teams = JSON.parse(body).map(function (team) {
          return team.slug;
        });

        // Add the namespaced claims to ID token
        context.idToken[namespace + "groups"] = git_teams.concat(user.app_metadata.authorization.groups);
      }

      return callback(null, user, context);
    });
  } else {
    return callback(null, user, context);
  }
}
