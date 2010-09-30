(function(){
  String.prototype.dateify = function() {
    return [this.substr(7,2),'.',this.substr(5,2),'.',this.substr(1,4)].join('');
  };

  String.prototype.idify = function() {
    return this.substr(1,6);
  };
  
  $(document).ready(function(){
    var  timeout = 100, timeline = $('#timeline'), firstYear = 1999, currentYear = new Date().getFullYear(), yearsActive = currentYear - firstYear, buffer = [], months = ['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    for (var i = firstYear; i <= currentYear; i++) {
      var c = (i == currentYear) ? ' last' : (i == firstYear) ? ' first' : '';
      buffer.push('<div class="year',c,'" id="y',i,'">');      
      for (var j = 1;j <= 12; j++) {
        var idj = (j < 10) ? '0'+j : j;
        buffer.push('<div class="month" id="m',i,idj,'"><em>',months[j],'</em></div>');
      }      
      buffer.push('<span>',i,'</span></div>');
    }
    timeline.html(buffer.join('')).mouseover(function(e){
      var target = e.target;
      // mouseover area = highlight year
    }).click(function(e){
      timeout = 0;
      var target = e.target;
      if (target.className.indexOf('gig') != -1) {
        var gigId = target.className.split('gig ')[1];
        $('#gigDetail').html($('.'+gigId).html());
      }
    });
    $('.year').width((100/yearsActive)-1.1+'%');
    
    var rows, len, index = 0, gigCount, plotGigs = function plotGigs() {
      len = len || 0;
      if (index < len) {
        if (gigCount == undefined) { gigCount = $('#summary p span'); }
        if (timeout > 0 && index > 50) { timeout--; }
        var gig = rows[index].doc, gigDate = gig._id.dateify(), monthId = gig._id.idify(), gigCountry = gig.country, otherBands = gig.otherbands;
        // need to clean the data so these country arrays are really arrays. quick hack for now...
        if (gigCountry.indexOf('england') != -1 || gigCountry.indexOf('scotland') != -1 || gigCountry.indexOf('wales') != -1) { gigCountry = 'UK'; } else if (gigCountry.indexOf('etherlands') != -1) { gigCountry = 'Netherlands'; }
        $('.new').removeClass('new');
        $('#m'+monthId).append(['<span class="new gig ',gig._id,'"><div class="gigInfo"><h3>',gigDate,'</h3><h2>',gig.venue,'</h2>',gig.city,', ',gigCountry,'<div id="others">',otherBands,'</div></div></span>'].join(''));        
        index++;
        gigCount.text(index+'*');
        setTimeout(function(){plotGigs();},timeout);
      }
      
    };
    
    $.ajax({
      url: '/data/tour',
      success: function(data) {
        if (data && data.hasOwnProperty('rows')) {
          rows = data.rows;
          len = rows.length;
          $('#summary').html(['<p><span>',index,'*</span> completed gigs<em>*Total is a tentative number.</em></p><div id="gigDetail"></div>'].join(''));
          plotGigs();
        }
      }
    });
    
  });
})();