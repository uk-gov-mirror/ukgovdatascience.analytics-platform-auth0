function (user, context, callback) {
  if (context.clientID !== '4pDwZwbnKOPHk0q02KQSg14KNTEew6kY')
   return callback(null, user, context);

  user.userEmail = user.email.toLowerCase();

  context.samlConfiguration.mappings = {
     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":  "userEmail",
  };

  callback(null, user, context);
}
