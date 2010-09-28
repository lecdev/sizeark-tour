var sys = require('sys'), 
    couchdb = require('couchdb'),
    client = couchdb.createClient(38284, 'localhost'),
    db = client.db('tourarchive'),
    http = require('http'),
    url = require('url');
    
http.createServer(function (req,res) {
  res.writeHead(200, {'Content-Type':'text/plain'});
  
  var path = url.parse(req.url), base = path.pathname, parts = base.split('/'), i = parts.length;
  while (i--) {
    if (parts[i].length === 0) { parts.splice(i,1); }
  }
  if (parts.length > 0) {
    if (parts[0] == 'tour') {
      // THE TOUR ARCHIVE LIVES HERE
      var key, buffer = ['d'], doEndKey = true, endkey = ['d'];
      if (parts.length > 1) {
        var year = parts[1];
        buffer.push(year);
        
        if (parts.length > 2) {
          var month = parts[2];
          buffer.push(month);
          if (parts.length > 3) {
            var day = parts[3];
            buffer.push(day);
            doEndKey = false;
          } else {
            var nextmonth = parseInt(month)+1;
            if (nextmonth < 10) { nextmonth = "0"+nextmonth; }
            endkey.push(year,nextmonth);
          }
        } else {
          var nextYear = parseInt(year)+1;
          endkey.push(nextYear);          
        }        
        key = buffer.join('');
        
        if (doEndKey) {
          db.allDocs({startkey:key,endkey:endkey.join('')}, function(err,resp){
            var rows = resp.rows, i = rows.length;
            for (var j=0;j < i; j++) {
              var k = rows[j].id;
              db.getDoc(k+'', function(e,r){
                if (r !== undefined) {
                  res.write(r.venue + ', ' + r.city + '\n');
                }
              });
            }
          });
        } else {
          db.getDoc(key, function(e,r){
            if (r !== undefined) {
              res.write(r.venue + ', ' + r.city + '\n');            
            }
          });
        }
        
      }
      // END TOUR ARCHIVE
    } else {
      res.write(['One day ',parts[0],' could be yours\n'].join(''));
    }
  }
  
  setTimeout(function(){res.close()},5000);
}).listen(59175,"127.0.0.1");    
console.log('Server running at http://127.0.0.1:59175');
    

// for each year from current year back to 1999 inclusive, this'll need to fetch 
// all docs for startkey: d+year, endkey: d+year+1