module.exports = {
  appkey: '1234567890'
};

var env = process.env.NODE_ENV || 'development';
console.log(env + ' ENV');
if (env === 'development') {
    process.env.PORT = 8080;

} else if (env === 'production') {
    process.env.PORT = 8080;
}
process.env.APIURL = 'https://apidev.growish.com/v1';
process.env.APPKEY = '1234567890';
