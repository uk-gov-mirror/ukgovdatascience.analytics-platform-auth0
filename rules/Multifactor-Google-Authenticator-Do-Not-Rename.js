function (user, context, callback) {
    var AUTHENTICATOR_LABEL = 'MOJ Analytical Platform (Alpha)';
    var DISABLED_CLIENTS = [
        'oUb1V330oXKyMpTagAYDzWDY10U4ffWF', // kubectl-oidc
    ];
    var ENABLED_CONNECTIONS = [
        'github',
        'google-oauth2',
    ];
    var MFA_CHALLENGE_EVERY_MINUTES = 8 * 60; // 8 hours


    var disabled_for_user = user.app_metadata && user.app_metadata.use_mfa === false;
    var disabled_for_connection = ENABLED_CONNECTIONS.indexOf(context.connection) === -1;
    var disabled_for_client = DISABLED_CLIENTS.indexOf(context.clientID) !== -1;

    if (disabled_for_user || disabled_for_connection || disabled_for_client) {
        return callback(null, user, context);
    }

    getUserProfile(user)
        .then(function (user_profile) {
            if (!loggedInRecently(user_profile)) {
                enableMFA(context);
            }

            return callback(null, user, context);
        })
        .catch(function(err) {
            enableMFA(context);
            return callback(null, user, context);
        });


    function enableMFA(context) {
        context.multifactor = {
            provider: 'google-authenticator',
            // optional, the label shown in the authenticator app
            issuer: AUTHENTICATOR_LABEL,
            // optional, defaults to true. false forces 2FA every time.
            allowRememberBrowser: false,
        };
    }

    function loggedInRecently(user_profile) {
        if (user_profile.last_login) {
            var secs_from_last_login = (new Date() - new Date(user_profile.last_login)) / 1000;

            // User goes throught this rule twice apparently.
            // 1) The first time, if the user didn't log in recently we'll
            // add the MFA configuration to the context.
            // 1a) Auth0 updates the user `last_login` even if they were not
            // challenged for 2FA yet
            // 2) The second time we'll need to add the MFA configuration to the
            // context again or they will not be challenged.
            //
            // Because we need to account for 1a) we don't consider a login in
            // the last 5 seconds as a login. That's an arbitrary short number
            // of seconds to account for the redirect to challenge users for MFA.
            if (secs_from_last_login < 5) {
                return false;
            }

            return (secs_from_last_login / 60) < MFA_CHALLENGE_EVERY_MINUTES;
        }

        return false;
    }

    function getUserProfile(user) {
        var AUTH0_VERSION = '2.9.1';
        var ManagementClient = require('auth0@' + AUTH0_VERSION).ManagementClient;
        var management = new ManagementClient({
            token: auth0.accessToken,
            domain: auth0.domain,
        });

        return management.users.get({ id: user.user_id });
    }

}
