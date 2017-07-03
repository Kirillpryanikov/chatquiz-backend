module.exports = {
  database : 'mongodb://localhost:27017/chatquizapp',
  secret : 'rghehryynv8yofq384y809tpyuowEWY24397',
  appkey: '1234567890'
};

var env = process.env.NODE_ENV || 'development';
console.log(env + ' ENV');
if (env === 'development') {
    process.env.PORT = 8080;
} else if (env === 'production') {
    process.env.PORT = 8080;
}
