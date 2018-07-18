function (user, context, callback) {
    var rangeCheck = require('range_check');

    var AUTHENTICATOR_LABEL = 'MOJ Analytical Platform (Alpha)';
    var CONNECTION = user.identities[0].connection;
    var ENABLED_CONNECTIONS = [
        'github',
        'google-oauth2',
    ];

    //console.log('ip: ' + context.request.ip);

    var disabled_for_user = user.app_metadata && user.app_metadata.use_mfa === false;
    var disabled_for_connection = ENABLED_CONNECTIONS.indexOf(CONNECTION) === -1;
    var is_refresh_token_grant = context.protocol === 'oauth2-refresh-token';

    if (disabled_for_user || disabled_for_connection || is_refresh_token_grant) {
        return callback(null, user, context);
    }

    // Skip MFA if user's IP is on a corporate network
    // configuration.CORPORATE_NETWORK_CIDRS is a space separated list of IP address ranges (CIDR notation)
    var userIsOnCorporateNetwork =
        rangeCheck.inRange(context.request.ip, configuration.CORPORATE_NETWORK_CIDRS.split(' '));
    if (!userIsOnCorporateNetwork) {
        //console.log('Not on corporate network. Enabling MFA.');
        enableMFA(context);
    }
    //else {
    //    console.log('On corporate network. No MFA challenge (from Auth0 at least).');
    //}

    function enableMFA(context) {
        context.multifactor = {
            provider: 'google-authenticator',
            // optional, the label shown in the authenticator app
            issuer: AUTHENTICATOR_LABEL,
            // optional, defaults to true. false forces 2FA every time.
            allowRememberBrowser: false,
        };
    }

    return callback(null, user, context);
}
