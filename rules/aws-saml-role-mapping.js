function (user, context, callback) {

  var role_arn = (
    'arn:aws:iam::' +
    configuration.AWS_ACCOUNT_ID +
    ':role/' +
    configuration.ENV + '_user_' +
    user.nickname.toLowerCase()
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

  callback(null, user, context);
}
