var Stock = require('../models/stock');
var dateFormat = require('dateformat');

module.exports = function (app, io) {

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
    Stock.find({}).exec()
      .then(function(arr){
        var symArray = arr.map((n)=>n.name);
        yahooFinance.historical({
          symbols: symArray,
          from: dateFormat(Date.now()-604800000, "yyyy-mm-dd"), // a week
          to: dateFormat(Date.now(), "yyyy-mm-dd"),
          period: 'd'
          }).then(function(data){
            var formattedArr = [];
            for(var i=0;i<symArray.length;i++){
              data[symArray[i]].map((e)=>formattedArr.push(e))
            }
            //var formattedArr = 
            res.render('index', {daily: formattedArr})
          })
      }).catch(function(err){
        throw err;
      });
    //dateFormat(now, "yyyy-mm-dd");
    //res.render('index');
    
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
          fields: ['n']
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
