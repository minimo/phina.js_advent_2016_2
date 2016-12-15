/*

  Tiledmapサンプル

*/

var SC_W = 320;
var SC_H = 320;

var ASSETS = {
  image: {
    "player": "assets/chara01_a1.png",
  }
};

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',
  init: function() {
    this.superInit({width:SC_W, height: SC_H});

    this.player = Player()
        .addChildTo(this)
        .setPosition(SC_W/2, SC_H/2);
  },

  update: function() {
    var kb = app.keyboard;
    if (kb.getKey("up")) {
    }
    if (kb.getKey("left")) {
    }
    if (kb.getKey("right")) {
    }
    if (kb.getKey("down")) {
    }
  },
});

phina.define('Player', {
  superClass: 'phina.display.Sprite',
  init: function() {
    this.superInit("player", 24, 32);

    this.frameUp = [0, 1, 2, 1];
    this.frameRight = [12, 13, 14, 13];
    this.frameDown = [24, 25, 26, 25];
    this.frameLeft = [36, 37, 38, 37];

    this.frame = this.frameDown;
    this.index = 0;
    this.frameIndex = 25;
    this.move = true;
  },

  update: function(e) {
    this.move = true;
    var kb = app.keyboard;
    if (kb.getKey("left")) {
        this.frame = this.frameLeft;
    } else if (kb.getKey("right")) {
        this.frame = this.frameRight;
    } else if (kb.getKey("up")) {
        this.frame = this.frameUp;
    } else if (kb.getKey("down")) {
        this.frame = this.frameDown;
    } else {
        this.move = false;
    }

    if (e.ticker.frame % 10 == 0 && this.move) {
        this.index = (this.index+1)%4;
        this.frameIndex = this.frame[this.index];
    }
  },
});

phina.define("SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "load",
            scenes: [{
                label: "load",
                className: "phina.game.LoadingScene",
                arguments: {
                    assets: ASSETS,
                },
                nextLabel: "main",
            },{
                label: "main",
                className: "MainScene",
            }],
        });
    }
});

phina.main(function() {
  app = phina.game.GameApp({
    width: SC_W,
    height: SC_H,
    backgroundColor: "#ccc",
  });
  app.fps = 60;
  app.enableStats();

  app.replaceScene(SceneFlow());

  app.run();
});
