/*

  Tiledmapサンプル

*/

var SC_W = 320;
var SC_H = 320;

var ASSETS = {
  image: {
    "player": "assets/chara01_a1.png",
  },
  //LoadingSceneで読み込む場合の設定
  tmx: {
    "map": "assets/map.tmx",
  }
};

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',
  init: function() {
    this.superInit({width:SC_W, height: SC_H});

    this.mapBase = phina.display.DisplayElement()
      .setPosition(0, 0)
      .addChildTo(this);

    //.tmxファイルからマップをイメージとして取得し、スプライトで表示
    this.tmx = phina.asset.AssetManager.get("tmx", "map");
    this.map = phina.display.Sprite(this.tmx.image)
      .setOrigin(0, 0)
      .setPosition(0, 0)
      .addChildTo(this.mapBase);
    this.map.tweener.clear().setUpdateType('fps');
    
    this.player = Player()
        .setPosition(160, 160)
        .addChildTo(this.map);

    this.moving = false;
    this.tweener.clear().setUpdateType('fps');
  },

  update: function() {
    var kb = app.keyboard;
    if (!this.moving) {
      var spd = 20;
      var mx = -this.map.x;
      var my = -this.map.y;
      if (kb.getKey("up")) {
        this.player.setDirection("up");
        if (this.player.y > 0 && this.mapCollision(this.player.x, this.player.y-32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: -32}, spd);
          if (0 < my && this.player.y < this.map.height - SC_H/2+32) this.map.tweener.clear().by({y: 32}, spd);
        }
      }
      if (kb.getKey("down")) {
        this.player.setDirection("down");
        if (this.player.y < this.map.height-32 && this.mapCollision(this.player.x, this.player.y+32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: 32}, spd);
          if (my < this.map.height && this.player.y > 128 && this.player.y < this.map.height-SC_H/2)this.map.tweener.clear().by({y: -32}, spd);
        }
      }
      if (kb.getKey("left")) {
        this.player.setDirection("left");
        if (this.player.x > 0 && this.mapCollision(this.player.x-32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: -32}, spd);
          if (0 < mx && this.player.x < this.map.width - SC_W/2+32) this.map.tweener.clear().by({x: 32}, spd);
        }
      }
      if (kb.getKey("right")) {
        this.player.setDirection("right");
        if (this.player.x < this.map.width-32 && this.mapCollision(this.player.x+32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: 32}, spd);
          if (mx < this.map.width && this.player.x > 128 && this.player.x < this.map.width-SC_W/2) this.map.tweener.clear().by({x: -32}, spd);
        }
      }
      if (this.moving) {
        this.tweener.clear().wait(spd).call(function(){this.moving = false;}.bind(this));
      }
    }
  },

  //マップ衝突判定
  mapCollision: function(x, y) {
    var mapx = Math.floor(x / 32);
    var mapy = Math.floor(y / 32);

    //マップデータから'Collision'レイヤーを取得
    var collision = this.tmx.getMapData("collision");

    //指定座標にマップチップがあると真を返す
    var chip = collision[mapy * this.tmx.width + mapx];
    if (chip === -1) return true;
    return false;
  },
});

phina.define('Player', {
  superClass: 'phina.display.DisplayElement',
  init: function() {
    this.superInit();
    this.setOrigin(0, 0);

    this.sprite = phina.display.Sprite("player", 24, 32)
      .setPosition(16, 10)
      .addChildTo(this);

    this.frameUp = [0, 1, 2, 1];
    this.frameRight = [12, 13, 14, 13];
    this.frameDown = [24, 25, 26, 25];
    this.frameLeft = [36, 37, 38, 37];

    this.frame = this.frameDown;
    this.index = 0;
    this.sprite.frameIndex = 25;
    this.moving = false;

    this.tweener.clear().setUpdateType('fps');
    this.time = 0;
  },

  update: function(e) {
    if (e.ticker.frame % 15 == 0) {
      this.index = (this.index+1)%4;
      this.sprite.frameIndex = this.frame[this.index];
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
