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

    //オブジェクトグループの取得
    this.npc = this.tmx.getObjectGroup("NPCGroup");
    this.addNPC();

    //プレイヤー用キャラクタ    
    this.player = Character(0).setPosition(160, 160).addChildTo(this.map);

    this.moving = false;
    this.textWait = false;
    this.talkingChr = null;
    this.tweener.clear().setUpdateType('fps');

    //メッセージウィンドウ
    var that = this;
    this.messageWindow = phina.display.RectangleShape({
      cornerRadius: 10,
      width: SC_W*0.9,
      height:SC_H*0.3,
      strokeWidth: 5,
      stroke: 'white',
      fill: 'black',
    }).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
    this.messageWindow.update = function() {
      if (that.labelArea.text == "") this.visible = false;
      else this.visible = true;
    }
    this.labelArea = phina.ui.LabelArea({
      text: "",
      width: SC_W*0.9-10,
      height: SC_H*0.3-10,
      fill: 'white',
      fontSize: 15,
    }).addChildTo(this.messageWindow).setPosition(5, 5);
  },

  update: function() {
    var spd = 20;
    var kb = app.keyboard;
    if (!this.moving && !this.textWait) {
      var mx = -this.map.x;
      var my = -this.map.y;
      if (kb.getKey("up")) {
        this.player.setDirection("up");
        if (this.player.y > 0 && !this.mapCollision(this.player.x, this.player.y-32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: -32}, spd);
          if (0 < my && this.player.y < this.map.height - SC_H/2+32) this.map.tweener.clear().by({y: 32}, spd);
        }
      }
      if (kb.getKey("down")) {
        this.player.setDirection("down");
        if (this.player.y < this.map.height-32 && !this.mapCollision(this.player.x, this.player.y+32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: 32}, spd);
          if (my < this.map.height && this.player.y > 128 && this.player.y < this.map.height-SC_H/2)this.map.tweener.clear().by({y: -32}, spd);
        }
      }
      if (kb.getKey("left")) {
        this.player.setDirection("left");
        if (this.player.x > 0 && !this.mapCollision(this.player.x-32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: -32}, spd);
          if (0 < mx && this.player.x < this.map.width - SC_W/2+32) this.map.tweener.clear().by({x: 32}, spd);
        }
      }
      if (kb.getKey("right")) {
        this.player.setDirection("right");
        if (this.player.x < this.map.width-32 && !this.mapCollision(this.player.x+32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: 32}, spd);
          if (mx < this.map.width && this.player.x > 128 && this.player.x < this.map.width-SC_W/2) this.map.tweener.clear().by({x: -32}, spd);
        }
      }
      if (kb.getKey("z")) {
        if (!this.moving && !this.textWait) {
          var ax = this.player.x, ay = this.player.y;
          var dir = "down";
          switch(this.player.direction) {
            case "up": ay -= 32; dir = "down"; break;
            case "down": ay += 32; dir = "up"; break;
            case "left": ax -= 32; dir = "right"; break;
            case "right": ax += 32; dir = "left"; break;
          }
          var chr = this.checkMap(ax, ay);
          if (chr && chr.data.properties.talk1) {
            this.moving = true;
            this.textWait = true;
            this.labelArea.text = chr.data.properties.talk1;
            if (chr.data.properties.talk2) {
              this.labelArea.text += "\n"+chr.data.properties.talk2;
            }
            chr.setDirection(dir);
            chr.wait = true;
            this.talkingChr = chr;
          }
        }
      }

      if (this.moving) {
        this.tweener.clear().wait(spd).call(function(){this.moving = false;}.bind(this));
      }
    }

    //メッセージ表示待機の解除
    if (!this.moving && this.textWait) {
      if (kb.getKey("z")) {
        this.moving = true;
        this.textWait = false;
        this.labelArea.text = "";
        this.talkingChr.wait = false;
        this.talkingChr.moveWaitCount = 60;
        this.talkingChr = null;
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
    if (chip !== -1) return true;

    //マップ上キャラクタとの衝突判定
    var children = this.map.children;
    for (var i = 0; i < children.length; i++) {
      var chr = children[i];
      if (chr.type != 0 && x == chr.x && y == chr.y) return true;
    }

    return false;
  },

  //NPC存在チェック
  checkMap: function(x, y) {
    var children = this.map.children;
    for (var i = 0; i < children.length; i++) {
      var chr = children[i];
      if (chr.type != 0 && x == chr.x && y == chr.y) return chr;
    }
  },

  //Non Player Characterをマップに追加
  addNPC: function() {
    for(var i = 0; i < this.npc.objects.length; i++) {
      var npc = this.npc.objects[i];
      var chr = Character(npc.properties.chrtype)
        .setPosition(npc.x, npc.y)
        .addChildTo(this.map);
        chr.data = npc;
        chr.move = chr.data.properties.move == "true"? true: false;
        chr.parentScene = this;
    }
  },
});

phina.define('Character', {
  superClass: 'phina.display.DisplayElement',
  init: function(type) {
    this.superInit();
    this.setOrigin(0, 0);

    this.type = type;
    this.sprite = phina.display.Sprite("player", 24, 32)
      .setPosition(16, 10)
      .addChildTo(this);

    this.sprite.setFrameTrimming((type%4)*72, Math.floor(type/4)*128, 72, 128);
    this.direction = "down";
    this.frameUp = [0, 1, 2, 1];
    this.frameRight = [3, 4, 5, 4];
    this.frameDown = [6, 7, 8, 7];
    this.frameLeft = [9, 10, 11, 10];

    this.frame = this.frameDown;
    this.index = 0;
    this.sprite.frameIndex = 25;
    this.moving = false;
    this.move = false;
    this.moveWaitCount = 30;
    this.wait = false;

    this.tweener.clear().setUpdateType('fps');
    this.time = 0;
  },

  update: function(e) {
    if (e.ticker.frame % 15 == 0) {
      this.index = (this.index+1)%4;
      this.sprite.frameIndex = this.frame[this.index];
    }

    //うろうろ動く
    if (!this.wait && this.move && this.moveWaitCount == 0) {
      this.moveWaitCount = 90;
      var ax = 0, ay = 0;
      var dice = Math.randint(0, 3);
      var dir = ["up", "down", "left", "right"];
      switch (dir[dice]) {
        case "up": ay = -32; break;
        case "down": ay = 32; break;
        case "left": ax = -32; break;
        case "right": ax = 32; break;
      }
      if (!this.parentScene.mapCollision(this.x+ax, this.y+ay)) this.tweener.clear().by({x: ax, y: ay}, 30);

      this.setDirection(dir[dice]);
    }

    this.moveWaitCount--;
    this.time++;
  },

  setDirection: function(dir) {
    switch (dir) {
      case "up":
        this.direction = "up";
        this.frame = this.frameUp;
        break;
      case "down":
        this.direction = "down";
        this.frame = this.frameDown;
        break;
      case "left":
        this.direction = "left";
        this.frame = this.frameLeft;
        break;
      case "right":
        this.direction = "right";
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

//スプライト機能拡張
phina.display.Sprite.prototype.setFrameTrimming = function(x, y, width, height) {
  this._frameTrimX = x || 0;
  this._frameTrimY = y || 0;
  this._frameTrimWidth = width || this.image.domElement.width - this._frameTrimX;
  this._frameTrimHeight = height || this.image.domElement.height - this._frameTrimY;
  return this;
}

phina.display.Sprite.prototype.setFrameIndex = function(index, width, height) {
  var sx = this._frameTrimX || 0;
  var sy = this._frameTrimY || 0;
  var sw = this._frameTrimWidth  || (this.image.domElement.width-sx);
  var sh = this._frameTrimHeight || (this.image.domElement.height-sy);

  var tw  = width || this.width;      // tw
  var th  = height || this.height;    // th
  var row = ~~(sw / tw);
  var col = ~~(sh / th);
  var maxIndex = row*col;
  index = index%maxIndex;

  var x   = index%row;
  var y   = ~~(index/row);
  this.srcRect.x = sx+x*tw;
  this.srcRect.y = sy+y*th;
  this.srcRect.width  = tw;
  this.srcRect.height = th;

  this._frameIndex = index;

  return this;
}

