var STA = {
  init: function init(canvasWidth, context) {
    this.yearCoords = {};
    this.level = 0;
    this.m.drawTimeline(canvasWidth, context, this.level);
  },
  m: {
    drawTimeline: function drawTimeline(canvasWidth, context, level) {
      // level will denote whether we draw the timeline with years on it, for a specific year, for a month in a year, etc.
      // it'll be controlled by the zoom level the user has navigated to
      var now = new Date(), year = now.getYear(), span, yearWidth, lastX, lastYear, yearCoords = STA.yearCoords;
      if (year < 1900) { year += 1900; }
      lastYear = year + 1;
      span = year - 1999;
      yearWidth = (Math.floor(canvasWidth / span)) - 2;
      lastX = canvasWidth;
      while (lastYear--) {
        context.textAlign = "right";
        context.textBaseline = "top";
        context.fillStyle = "#fff";
        context.fillText(lastYear+"", lastX, 80);
        yearCoords[lastYear] = lastX;
        lastX -= yearWidth;
        if (lastYear === 1999) {break;}
      }
      STA.yearCoords = yearCoords;
      this.plotGigCounts(yearCoords, context);
    },
    plotGigCounts: function plotGigCounts(yearCoords, context) {
      // for each year, pull the gig count from the node stream & plot the total using the STA.yearCoords x value
      for (var year in yearCoords) {
        var thisX = yearCoords[year];
        context.fillStyle = "#fff";
        context.fillRect(thisX, 0, 30, 30);
        context.fillStyle = "#000";
        context.font = "18px";
        context.fillText("24",thisX, 20);
      }
    },
    randomEvent: function randomEvent() {
      // this will run on setInterval and will plot various events like the release dates of albums / EPs on the timeline
      // just to make it interesting, a bit of an easter egg.
    },
    pullComments: function pullComments() {
      // Any comments added (once comments functionality exists) should be pulled out in to the UI
    }
  }
};

window.onload = function() {
  var canvas = document.getElementById('timeline'), ctx = canvas.getContext('2d'), fullWidth = window.innerWidth - 40;
  canvas.width = fullWidth;
  canvas.height = 200;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,40,fullWidth,2);
  STA.init(fullWidth, ctx);
};