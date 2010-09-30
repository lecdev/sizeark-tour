//                  var id = r._id+'', gigDate = [id.substr(7,2),'.',id.substr(5,2),'.',id.substr(1,4)].join('');
//                  contentBuffer.push(['<li>',gigDate,' - ',r.venue,', ',r.city,'</li>'].join(''));          
(function(){
  String.prototype.dateify = function() {
    return [this.substr(7,2),'.',this.substr(5,2),'.',this.substr(1,4)].join('');
  };

  String.prototype.idify = function() {
    return this.substr(1,6);
  };
  
  $(document).ready(function(){
    var timeline = $('#timeline'), firstYear = 1999, currentYear = new Date().getFullYear(), yearsActive = currentYear - firstYear, buffer = [], months = ['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    for (var i = firstYear; i <= currentYear; i++) {
      var class = (i == currentYear) ? ' last' : (i == firstYear) ? ' first' : '';
      buffer.push('<div class="year',class,'" id="y',i,'">');      
      for (var j = 1;j <= 12; j++) {
        var idj = (j < 10) ? '0'+j : j;
        buffer.push('<div class="month" id="m',i,idj,'"><em>',months[j],'</em></div>');
      }      
      buffer.push('<span>',i,'</span></div>');
    }
    timeline.html(buffer.join(''));
    $('.year').width((100/yearsActive)-1.1+'%');
    
    $.ajax({
      url: '/data/tour',
      success: function(data) {
        if (data && data.hasOwnProperty('rows')) {
          var rows = data.rows, len = rows.length;
          for (var i = 0; i < len; i++) {
            var gig = rows[i].doc, gigDate = gig._id.dateify(), monthId = gig._id.idify();
            $('.new').removeClass('new');
            $('#m'+monthId).append(['<span class="new gig ',gig.id,'"><div>',gig.venue,', ',gig.city,'</div></span>'].join(''));
          }
        }
      }
    });
    
  });
})();