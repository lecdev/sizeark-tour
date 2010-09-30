var sys = require('sys'), 
    couchdb = require('couchdb'),
    client = couchdb.createClient(38284, 'localhost'),
    db = client.db('tourarchive'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url');
    
http.createServer(function (req,res) {  
    
  var p = url.parse(req.url), base = p.pathname;  
  if (base.indexOf('data') != -1) {
    // RETURNING DATA FOR AJAX CALL
    res.writeHead(200,{'Content-Type':'application/json'});
    var parts = base.split('data/')[1].split('/'), l = parts.length;
    if (l > 0) {
      if (parts[0] == 'tour') {
        // TOUR ARCHIVE LIVES HERE
        var query = {}, key, endk, buffer = ['d'], doEndKey = (l < 4), endkey = ['d'];
        if (l > 1) {
          for (var i = 1; i < l; i++) {
            var val = parts[i];
            buffer.push(val);
            if (doEndKey) {                        
              if (i == (l-1)) { 
                var newVal = (parseInt(val)+1)+"";
                if (newVal.length == 1) { newVal = "0"+newVal; }
                val = newVal;
              } 
              endkey.push(val);
            }
          }
          key = buffer.join('');
          if (doEndKey) { endk = endkey.join(''); }
          query.startkey = key;
          if (endk !== undefined) { query.endkey = endk; } 
        } else {
          var today = new Date(), month = (today.getUTCMonth()+1), day = (today.getUTCDate()-1);
          query.endkey = ['d',today.getUTCFullYear(),((month < 10) ? '0'+month:month),((day < 10) ? '0'+day:day)].join('');
        }
        
        if (doEndKey) {
          query.include_docs = true; 
          db.allDocs(query, function(err, resp){
            res.write(JSON.stringify(resp,['total_rows','rows','doc','_id','venue','city','country','otherbands','setlist','comments']));
            res.end();            
          });
        } else {
          db.getDoc(key, function(e,r){
            if (r !== undefined) {
               res.write(JSON.stringify(r,['_id','venue','city','country','otherbands','setlist','comments']));
               res.end();
            }
          });
        }
        
      }
    } else {
      res.end();
    }
    
  } else {
    // REGULAR SERVER
    if (base == '/') { base = '/index.html'; }
    var h = (base.indexOf('.css') != -1) ? 'text/css' : (base.indexOf('.js') != -1) ? 'text/javascript' : (base.indexOf('.png') != -1) ? 'image/png' : (base.indexOf('.jpg') != -1) ? 'image/jpeg' : (base.indexOf('.html') != -1) ? 'text/html' : 'application/octet-stream', filename = path.join(process.cwd(), base);
    path.exists(filename, function(exists) {  
      if(!exists) {  
        res.writeHead(404, {'Content-Type':h});
        res.write("404 Not Found\n");  
        res.end();
        return;  
      }  

      fs.readFile(filename, "binary", function(err, file) {  
        if(err) {  
          res.writeHead(500, {'Content-Type':'text/plain'});
          res.write(err + "\n");  
          res.end();
          return;  
        }            
        res.writeHead(200, {'Content-Type':h});          
        res.write(file, "binary");  
        res.end();
      });  
    });
      
  } /*else if (parts[0] == 'tour') {
      // THE TOUR ARCHIVE LIVES HERE
      var key, buffer = ['d'], doEndKey = true, endkey = ['d'], h = 'text/html';
      res.writeHead(200, {'Content-Type':h});
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
        }
        
      }
      // END TOUR ARCHIVE
    } else {
      if (base.indexOf('favico') == -1) {
        res.writeHead(200,{'Content-Type':'text/html'})
//        contentBuffer.push(['One day ',parts[0],' could be yours\n'].join(''));
        res.write(layout(contentBuffer.join('')));      
        contentBuffer = [];
      }
    }
  } */    
}).listen(59175,"127.0.0.1");    
console.log('Server running at http://127.0.0.1:59175');