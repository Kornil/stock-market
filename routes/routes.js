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
  var globalData, symArr;

  app.get('/', function (req, res) {
    Stock.find({}).exec()
      .then(function(arr){
        var symArray = arr.map((n)=>n.name);
        symArr = symArray;
        yahooFinance.historical({
          symbols: symArray,
          from: dateFormat(Date.now()-(604800000*4)*12, "yyyy-mm-dd"), // a week
          to: dateFormat(Date.now(), "yyyy-mm-dd"),
          period: 'd'
          }).then(function(data){
            var formattedArr = [];
            for(var i=0;i<symArray.length;i++){
              data[symArray[i]].map((e)=>formattedArr.push({date: Date.parse(e.date),symbol: e.symbol,open: e.open}))
            }

            /*var betterFormat = []; // my lazyness has decided that I prefer to format an entire json than change my d3 graph
            for(var i=0;i<symArr.length;i++){
              betterFormat.push({key: symArr[i], values: []});
            }
            var counter = 0;
            for(var i=0;i<formattedArr.length;i++){
              if(formattedArr[i].symbol===betterFormat[counter].key){
                betterFormat[counter].values.push(formattedArr[i].open,formattedArr[i].date,formattedArr[i].symbol)
              }else{
                counter++;
                betterFormat[counter].values.push(formattedArr[i].open,formattedArr[i].date,formattedArr[i].symbol)
              }
            }*/

            res.render('index', {daily: formattedArr})
          })
      }).catch(function(err){
        throw err;
      });
    
  });

  app.post('/addsymbol', function(req, res){

    var symbol = req.body.symbol.toUpperCase();
    Stock.find({name: symbol}).exec()
      .then(function(data){
        
        if(!data.length){
          yahooFinance.snapshot({
          symbol: symbol,
          fields: ['n']
          }).then(function(snapshot){
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

  app.delete('/profile/:symbol', function(req, res){
    Stock.find({ name: req.params.symbol }).remove().exec()
      .then(function(){
        res.redirect('/');
      }).catch(function(err){
        throw err;
      });
  });

}
