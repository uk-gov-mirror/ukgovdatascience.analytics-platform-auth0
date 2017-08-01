function (user, context, callback) {
    var whitelist = ['digital.justice.gov.uk']; //authorized domains

    // Apply to 'google-oauth2' connections only
    if(context.connection === 'google-oauth2'){

      var userHasAccess = whitelist.some(
        function (domain) {
          var emailSplit = user.email.split('@');
          return emailSplit[emailSplit.length - 1].toLowerCase() === domain;
        });

      if (!userHasAccess) {
        return callback(new UnauthorizedError('Access denied.'));
      }

    }

    return callback(null, user, context);
}
