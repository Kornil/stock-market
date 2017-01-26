var Stock = require('../models/stock');

module.exports = function (app) {

  app.use(require('body-parser').urlencoded({ extended: true }));  
  var yahooFinance = require('yahoo-finance');

  app.get('/', function (req, res) {
    Stock.find({}, function(err, data){
      if (err) throw err;
      res.render('index', {stocks: data});
    })
  });

  app.post('/addsymbol', function(req, res){
    /*yahooFinance.historical({
    symbol: req.body.symbol,
    from: '2016-01-01',
    to: '2016-12-31',
    period: 'm'
    }, function (err, data) {
      if (err) throw err;
      res.send(data);
    });*/

    Stock.find({name: req.body.symbol}).exec()
      .then(function(data){
        if(data.length){
          var newStock = Stock({
            name: req.body.symbol
          })
          newStock.save()
            .then(function(){
              res.redirect('/');
            })
        }else{
          res.redirect('/');
        }
      }).catch(function(err){
        throw err;
      });

  });

}
