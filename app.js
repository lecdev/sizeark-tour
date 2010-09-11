var app = require('express').createServer(), couchdb = require('couchdb'),client = couchdb.createClient(5984, 'localhost'), db = client.db('tourarchive');

//db.saveDoc(new_id, this._[new_id]);
//db.getDoc(id, function(err, res) {

app.get('/',function(req,res){
  res.send('Home Page.');
});

app.get('/s/:id',function(req,res){
  res.send('Show: ' + req.params.id);
});

app.listen(3000);