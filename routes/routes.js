module.exports = function (app) {


  app.use(require('body-parser').urlencoded({ extended: true }));  
  var yahooFinance = require('yahoo-finance');

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.post('/addsymbol', function(req, res){
    yahooFinance.historical({
    symbol: req.body.symbol,
    from: '2016-01-01',
    to: '2016-12-31',
    period: 'm'
    }, function (err, data) {
      if (err) throw err;
      res.send(data);
    });
  })

}
