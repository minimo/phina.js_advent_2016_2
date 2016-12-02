/*

  Tiledmapサンプル

*/

var SC_W = 640;
var SC_H = 640;

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',
  init: function() {
    this.superInit({width:SC_W, height: SC_H});
  },

  update: function() {
  },
});

phina.main(function() {
  app = phina.game.GameApp({
    startLabel: 'main',
    width: SC_W,
    height: SC_H,
    backgroundColor: "#ccc",
  });
  app.fps = 60;
  app.enableStats();
  app.run();
});

