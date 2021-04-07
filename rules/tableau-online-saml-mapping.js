function (user, context, callback) {
  if (context.clientID !== 'mA8J66yBVLh76lAUQklTj546SzXR0Qht')
   return callback(null, user, context);

  user.userEmail = user.email.toLowerCase();

  context.samlConfiguration.mappings = {
     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":  "userEmail",
  };

  callback(null, user, context);
}
