function (user, context, callback) {
  user.original_nickname = user.nickname;
  user.nickname = user.nickname.toLowerCase();
  context.idToken.original_nickname = user.original_nickname;
  context.idToken.nickname = user.nickname;

  callback(null, user, context);
}
