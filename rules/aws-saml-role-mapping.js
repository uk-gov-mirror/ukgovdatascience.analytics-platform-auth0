function (user, context, callback) {
  user.awsRole = 'arn:aws:iam::' + configuration.AWS_ACCOUNT_ID + ':role/auth0' +
    ',arn:aws:iam::' + configuration.AWS_ACCOUNT_ID + ':saml-provider/auth0';
  user.awsRoleSession = user.nickname;

  context.samlConfiguration.mappings = {
    'https://aws.amazon.com/SAML/Attributes/Role': 'awsRole',
    'https://aws.amazon.com/SAML/Attributes/RoleSessionName': 'awsRoleSession'
  };

  callback(null, user, context);
}
