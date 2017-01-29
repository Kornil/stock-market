var Stock = require('../models/stock');

module.exports = function (app, io) {

  /*function refreshStock(symbs){
    setInterval(function(){
      yahooFinance.snapshot({
          symbols: symbs,
          fields: ['s', 'n', 'o', 'c1', 'p2']  
        }, function(err, data){
          if (err) throw err;
          return data;
        })
        }, 500);
}*/

  var newData;

  setInterval(function(){
    Stock.find({}).exec()
      .then(function(symbols){
        var sym = symbols.map((n)=>n.name);
        yahooFinance.snapshot({
          symbols: sym,
          fields: ['s', 'n', 'o', 'c1', 'p2']  
        }).then(function(data){
          newData = data;
        })
      }).catch(function(err){
        throw err;
      });
  }, 500);
io.on('connection', function(socket){
  setInterval(function(){
      io.emit('news_by_server', {newData}); 
  }, 1000);
});

  app.use(require('body-parser').urlencoded({ extended: true }));  
  var yahooFinance = require('yahoo-finance');

  app.get('/', function (req, res) {

    res.render('index');
    
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
        
        if(!data.length){
          var symbol = req.body.symbol.toUpperCase();
          yahooFinance.snapshot({
          symbol: symbol,
          fields: ['n']  // ex: ['s', 'n', 'd1', 'l1', 'y', 'r']
          }, function (err, snapshot) {
            if (err) throw err;
            if(!snapshot.name){
              res.redirect('/')
            }else{
              var newStock = Stock({
              name: symbol
            })
            newStock.save()
              .then(function(){
                res.redirect('/');
              })
            }
            
          });
          
        }else{
          res.redirect('/');
        }
      }).catch(function(err){
        throw err;
      });

  });

}
