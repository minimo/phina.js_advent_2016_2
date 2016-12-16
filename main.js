/*

  Tiledmapサンプル

*/

var SC_W = 320;
var SC_H = 320;

var ASSETS = {
  image: {
    "player": "assets/chara01_a1.png",
  },
  tmx: {
    "map": "assets/map.tmx", 
  }
};

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',
  init: function() {
    this.superInit({width:SC_W, height: SC_H});

    this.tmx = phina.asset.AssetManager.get("tmx", "map");
    this.map = phina.display.Sprite(this.tmx.image)
      .setOrigin(0, 0)
      .setPosition(0, 0)
      .addChildTo(this);
    this.map.tweener.clear().setUpdateType('fps');
    
    this.player = Player()
        .setPosition(160, 160)
        .addChildTo(this.map);

    this.moving = false;
    this.tweener.clear().setUpdateType('fps');

    var that = this;
    phina.display.Label({fontSize:20}).addChildTo(this).setPosition(0,0).setOrigin(0, 0)
      .update = function() {
        this.text = "map x:"+~~that.map.x+" y:"+~~that.map.y;
      }
    phina.display.Label({fontSize:20}).addChildTo(this).setPosition(0,64).setOrigin(0, 0)
      .update = function() {
        this.text = "x:"+~~that.player.x+" y:"+~~that.player.y;
      }
  },

  update: function() {
    var kb = app.keyboard;
    if (!this.moving) {
      var mx = -this.map.x;
      var my = -this.map.y;
      if (kb.getKey("up")) {
        this.moving = true;
        this.player.tweener.clear().by({y: -32}, 30);
        this.player.setDirection("up");
        if (my > 0) this.map.tweener.clear().by({y: 32}, 30);
      }
      if (kb.getKey("down")) {
        this.moving = true;
        this.player.tweener.clear().by({y: 32}, 30);
        this.player.setDirection("down");
        if (my > this.map.height)this.map.tweener.clear().by({y: -32}, 30);
      }
      if (kb.getKey("left")) {
        this.moving = true;
        this.player.tweener.clear().by({x: -32}, 30);
        this.player.setDirection("left");
        if (this.player.x > 160 && this.player.x < this.map.width-SC_W) this.map.tweener.clear().by({x: 32}, 30);
      }
      if (kb.getKey("right")) {
        this.moving = true;
        this.player.tweener.clear().by({x: 32}, 30);
        this.player.setDirection("right");
        if (this.player.x > 128 && this.player.x < this.map.width-SC_W) this.map.tweener.clear().by({x: -32}, 30);
      }
      if (this.moving) {
        this.tweener.clear().wait(30).call(function(){this.moving = false;}.bind(this));
      }
    }
  },

  //マップ衝突判定
  mapCollision: function(x, y) {
    //マップデータから'Collision'レイヤーを取得
    var collision = this.tmx.getMapData("Collision");
    var chip = collision[y * 32 + x];
    if (chip === "0") return true;
    return false;
  },
});

phina.define('Player', {
  superClass: 'phina.display.Sprite',
  init: function() {
    this.superInit("player", 24, 32);

    this.setOrigin(0, 0);

    this.frameUp = [0, 1, 2, 1];
    this.frameRight = [12, 13, 14, 13];
    this.frameDown = [24, 25, 26, 25];
    this.frameLeft = [36, 37, 38, 37];

    this.frame = this.frameDown;
    this.index = 0;
    this.frameIndex = 25;
    this.moving = false;

    this.tweener.clear().setUpdateType('fps');
    this.time = 0;
  },

  update: function(e) {
    if (e.ticker.frame % 15 == 0) {
      this.index = (this.index+1)%4;
      this.frameIndex = this.frame[this.index];
    }
    this.time++;
  },

  setDirection: function(dir) {
    switch (dir) {
      case "up":
        this.frame = this.frameUp;
        break;
      case "down":
        this.frame = this.frameDown;
        break;
      case "left":
        this.frame = this.frameLeft;
        break;
      case "right":
        this.frame = this.frameRight;
        break;
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
