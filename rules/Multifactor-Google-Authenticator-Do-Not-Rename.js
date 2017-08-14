function (user, context, callback) {

  var client_with_mfa = [
    // RStudio client id
    'rpYFh3GD2vmk13Rtcvre2gZY2dAvdBSS'
  ].indexOf(context.clientID) !== -1;

  var user_with_mfa = user.app_metadata && user.app_metadata.use_mfa;

  if (
    //!user.impersonated &&
    //user_with_mfa &&
    client_with_mfa
  ) {

    context.multifactor = {
      provider: 'google-authenticator',

      // optional, the label shown in the authenticator app
      issuer: 'MOJ Analytical Platform (Alpha)',

      // optional, the key to use for TOTP. By default one is generated for you
      // key: '{YOUR_KEY_HERE}',

      // optional, defaults to true. false forces 2FA every time.
      allowRememberBrowser: false
    };
  }

  callback(null, user, context);
}
