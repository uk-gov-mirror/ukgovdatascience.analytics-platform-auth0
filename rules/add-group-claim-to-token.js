function (user, context, callback) {

    var request   = require('request');
    var namespace = 'https://api.alpha.mojanalytics.xyz/claims/';  // For custom claims, you must define a namespace for oidc compliance. See https://auth0.com/docs/api-auth/tutorials/adoption/scope-custom-claims
    var options   = {
        url: 'https://api.github.com/user/teams',
        headers: {
            'Authorization': 'token ' + github_access_token(),
            'User-Agent': 'request'
        }
    };

    function github_access_token() {
        var github_identity = _.find(user.identities,
            {connection: 'github'});
        var token = github_identity.access_token;
        return token;
    }

    // Apply to github only
    if (context.connection === 'github') {

        request(options, function (error, response, body) {
            if (response.statusCode !== 200) {

                return callback(new Error('Error retrieving teams from github: ' + body || error));

            } else {

                var git_team = JSON.parse(body).map(function (team) {
                    return team.slug;
                });

                // Add the namespaced claims to ID token
                context.idToken[namespace + "groups"] = git_team.concat(user.groups);

            }

            return callback(null, user, context);
        });
    }
}
