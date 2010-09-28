var sys = require('sys'), 
    couchdb = require('couchdb'),
//    client = couchdb.createClient(38284, '174.123.227.231'),
    client = couchdb.createClient(38284, 'localhost'),
    db = client.db('tourarchive'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    layout = function layout(content) {
      console.log('layout called');
      console.log('content: ' + content);
      var aboveContent = '<!DOCTYPE html><html lang="en"><head><title>Oceansize: Tour Archive</title><link rel="stylesheet" type="text/css" href="/styles/style.css"/><script type="text/javascript" src="/js/ta.js"></script></head><body><hgroup><h1>Oceansize Tour Archive</h1><hr /></hgroup>',
          belowContent = '<footer><hr /><p>The Oceansize Tour Archive is a component of <em>sizeArk</em>, brought to you by <a href="http://sizeboard.com">sizeboard</a> and is a <a href="http://davestevens.us">Dave Stevens</a> production, handcrafted from the finest code for that rich, smooth \'size taste since 2003. That beautiful illustration over there? That\'s the work of the incredibly talented <a href="http://www.steevilweevil.com">Steve McCarthy</a>. You should follow us on twitter <a href="http://twitter.com/sizeboard">here</a></p></footer></body></html>';
      
      return [aboveContent,content,belowContent].join('');              
    };


    
http.createServer(function (req,res) {  
  var p = url.parse(req.url), base = p.pathname, parts = base.split('/'), i = parts.length, contentBuffer = [];
  while (i--) {
    if (parts[i].length === 0) { parts.splice(i,1); }
  }
  if (parts.length > 0) {
    if (parts[0] == "styles" || parts[0] == "js" || parts[0] == "img") {
      var h = (parts[0] == "styles") ? 'text/css' : (parts[0] == "js") ? 'text/javascript' : (base.indexOf('png') != -1) ? 'image/png' : 'image/jpeg', filename = path.join(process.cwd()+'sizeark-tour/', base);  
      path.exists(filename, function(exists) {  
        if(!exists) {  
          res.writeHead(404, {'Content-Type':h});
          res.write("404 Not Found\n");  
          return;  
        }  

        fs.readFile(filename, "binary", function(err, file) {  
          if(err) {  
            res.writeHead(500, {'Content-Type':'text/plain'});
            res.write(err + "\n");  
            return;  
          }            
          res.writeHead(200, {'Content-Type':h});          
          res.write(file, "binary");  
        });  
      });
      
    } else if (parts[0] == 'tour') {
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
          db.allDocs({startkey:key,endkey:endkey.join('')}, function(err,resp){
            var rows = resp.rows, i = rows.length;
            contentBuffer.push('<ul>');
            for (var j=0;j < i; j++) {
              var k = rows[j].id;
              db.getDoc(k+'', function(e,r){
                if (r !== undefined) {
                  var id = r._id+'', gigDate = [id.substr(7,2),'.',id.substr(3,2),'.',id.substr(1,4)].join('');
                  contentBuffer.push(['<li>',gigDate,' - ',r.venue,', ',r.city,'</li>'].join(''));          
                }
              });
            }
            setTimeout(function(){
              contentBuffer.push('</ul>');              
              res.write(layout(contentBuffer.join('')));                  
            },20000);
          });
        } else {
          db.getDoc(key, function(e,r){
            if (r !== undefined) {
              var gigDate = r.id.substring(7,2) + '.' + r.id.substring(3,2) + '.' + r.id.substring(1,4);
              contentBuffer.push('<li>gigDate - ' + r.venue + ', ' + r.city + '</li>');          
              res.write(layout(contentBuffer.join('')));      
                
            }
          });
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
  }
    
  setTimeout(function(){res.end()},30000);
}).listen(59175,"127.0.0.1");    
console.log('Server running at http://127.0.0.1:59175');
    

// for each year from current year back to 1999 inclusive, this'll need to fetch 
// all docs for startkey: d+year, endkey: d+year+1