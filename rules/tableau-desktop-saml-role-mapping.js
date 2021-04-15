function(user, context, callback) {
    // Apply to Tableau Desktop client only
  if (context.clientID !== 'Gve0EsRwmVSnXZEfv1zGoL1CLivikzUa')
   return callback(null, user, context);

    var whitelist = 'tableau-desktop-users'; // authorized github team

    // Apply to 'github' connections only
    var github_identity = _.find(user.identities, {
        connection: 'github'
    });
    if (github_identity) {
        var request = require('request');
        var access_token = github_identity.access_token;

        request({
            url: 'https://api.github.com/user/teams',
            headers: {
                'Authorization': 'token ' + access_token,
                'User-Agent': 'request'
            }
        }, function(err, resp, body) {

            if (resp.statusCode !== 200) {
                return callback(new Error('Error retrieving team from github: ' + body || err));
            } else {
                var github_orgs = [
                    "ministryofjustice",
                    "moj-analytical-services",
                ];

                var git_teams = JSON.parse(body).map(function(team) {
                    if (github_orgs.includes(team.organization.login)) {
                        return team.slug;
                    }
                });

                var authorized = git_teams.includes(whitelist);

                if (authorized) {
                    var role_arn = (
                        'arn:aws:iam::' +
                        configuration.AWS_ACCOUNT_ID +
                        ':role/' +
                        configuration.ENV + '_tableau_desktop'
                    );

                    var provider_arn = (
                        'arn:aws:iam::' +
                        configuration.AWS_ACCOUNT_ID +
                        ':saml-provider/' +
                        configuration.ENV + '-' +
                        'auth0'
                    );

                    user.awsRole = role_arn + ',' + provider_arn;
                    user.awsRoleSession = user.nickname.toLowerCase();

                    context.samlConfiguration.mappings = {
                        'https://aws.amazon.com/SAML/Attributes/Role': 'awsRole',
                        'https://aws.amazon.com/SAML/Attributes/RoleSessionName': 'awsRoleSession'
                    };

                    return callback(null, user, context);
                } else {
                    return callback(new UnauthorizedError('Access denied.'));
                }
            }
        });

    } else {
        callback(null, user, context);
    }
}
