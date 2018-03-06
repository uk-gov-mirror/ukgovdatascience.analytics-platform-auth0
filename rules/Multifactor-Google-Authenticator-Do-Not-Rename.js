function (user, context, callback) {
    var AUTHENTICATOR_LABEL = 'MOJ Analytical Platform (dev)';
    var DISABLED_CLIENTS = [
        'p4L2qRcSgWyqHjoHanJ4QyhWL1iX612i', // kubectl-oidc
    ];
    var ENABLED_CONNECTIONS = [
        'github',
        'google-oauth2',
    ];
    var MFA_CHALLENGE_EVERY_MINUTES = 8 * 60; // 8 hours


    var enabled_for_user = !user.app_metadata || user.app_metadata.use_mfa !== false;
    var enabled_for_connection = ENABLED_CONNECTIONS.indexOf(context.connection) !== -1;
    var enabled_for_client = DISABLED_CLIENTS.indexOf(context.clientID) === -1;

    if ( !enabled_for_user || !enabled_for_connection || !enabled_for_client ) {
        console.log('2FA disabled for user, connection or client');
        return callback(null, user, context);
    }

    getUserProfile(user)
        .then(function (user_profile) {
            if ( !loggedInRecently(user_profile) ) {
                console.log('user did not log in recently - enabling MFA');
                enableMFA(context);
            }

            return callback(null, user, context);
        })
        .catch(function(err) {
            enableMFA(context);
            return callback(null, user, context);
        });


    // Utility functions

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
