var WELCOME = "Welcome to MyMai ver 0.325.6"
console.log(WELCOME);
var app = new PIXI.Application(540,540);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SIZE = 0;
if (SCREEN_HEIGHT>SCREEN_WIDTH)
    SIZE = SCREEN_WIDTH;
else
    SIZE = SCREEN_HEIGHT;
app.view.style.width = SIZE + 'px';
app.view.style.height = SIZE + 'px';
var SIN675 = 0.9238795;
var COS675 = 0.3825834;
var JUDGELONG =  9 - COS675*8;
var JUDGESHORT = 9 - SIN675*8;
var judgePosition = [
    [18-JUDGELONG,JUDGESHORT],
    [18-JUDGESHORT,JUDGELONG],
    [18-JUDGESHORT,18-JUDGELONG],
    [18-JUDGELONG,18-JUDGESHORT],
    [JUDGELONG,18-JUDGESHORT],
    [JUDGESHORT,18-JUDGELONG],
    [JUDGESHORT,JUDGELONG],
    [JUDGELONG,JUDGESHORT]
]
//circle size
var STARTLONG = 9- COS675*1.6;
var STARTSHORT = 9- SIN675*1.6;
var startPosition = [
    [18-STARTLONG,STARTSHORT],
    [18-STARTSHORT,STARTLONG],
    [18-STARTSHORT,18-STARTLONG],
    [18-STARTLONG,18-STARTSHORT],
    [STARTLONG,18-STARTSHORT],
    [STARTSHORT,18-STARTLONG],
    [STARTSHORT,STARTLONG],
    [STARTLONG,STARTSHORT]
]
for(var i=0;i<8;i++)
    for (var j=0;j<2;j++)
    {
        judgePosition[i][j] *= (540/18);
        startPosition[i][j] *= (540/18);
    }


document.body.appendChild(app.view);
PIXI.loaders.Resource.setExtensionXhrType("mp3", PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER);
PIXI.loaders.Resource.setExtensionLoadType("mp3", PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER);
const pixiloader = PIXI.loader;
pixiloader.add('map',BEATMAP)
    .add('img_tap', "asset/image/tap.png")
    .add('img_double', "asset/image/double.png")
    .add('img_hold', "asset/image/hold.png")
    .add('img_line', "asset/image/line.png")
    .add('img_bg', 'asset/image/release_bg.png')
    .add('audio_perfect', "asset/sound/perfect.mp3")
    .add('audio_flick', "asset/sound/flick.mp3")
    .add('audio_music', "night.mp3")
    // .add('map', "beatmap/maidadada.json")
    // .add('img_tap', "asset/image/tap.png")
    // .add('img_bg', 'asset/image/release_bg.png')
    // .add('audio_perfect', "asset/sound/perfect.mp3")
    // .add('audio_flick', "asset/sound/flick.mp3")
    // .add('audio_music', "music/dadada.mp3")
    .load(gameLoad);
var SPEED = 366;
var noteResList = [];
var tapMap = [[],[],[],[],[],[],[],[]];
var holdMap = [[],[],[],[],[],[],[],[]];


function gameLoad(loader, resources)
{
    //load game
    app.stage.visible = false;
    // var bg = new PIXI.Sprite(resources['img_bg'].texture);
    // app.stage.addChild(bg);

    //load res
    console.log(resources['img_tap']);
    // console.log(noteResList[0]);
    //
    noteResList.push(resources['img_tap']);
    noteResList.push(resources['img_double']);
    noteResList.push(resources['img_hold']);
    noteResList.push(resources['img_line']);

    //load map
    var map = loader.resources['map'].data;
    for (var i = 0;i < map.notes.length; i++)
    {
        if(map.notes[i]['type'] == 0)//tap
        {
            var note = new Tap(map.notes[i]['type'], (map.notes[i]['time']*map.bpm + map.offset) * 1000, map.notes[i]['position']-1, map.notes[i]['double']);
            tapMap[map.notes[i]['position']-1].push(note);
        }
        if(map.notes[i]['type'] == 1)//hold
        {
            var note = new Hold(map.notes[i]['type'], (map.notes[i]['time']*map.bpm + map.offset) * 1000, map.notes[i]['position']-1, map.notes[i]['double'],map.notes[i]['holdtime']*map.bpm*1000);
            holdMap[map.notes[i]['position']-1].push(note);
        }
        // tap.draw();
        // tap.add();
        // console.log(map.notes[i]['time']);
    }
    console.log(tapMap);
    console.log(holdMap);
    for (var i = 0;i < 8; i++)
    {
        var tap = new Tap(0,0,0,0);
        tap.draw();
        tap.set(judgePosition[i][0],judgePosition[i][1]);
    }
    // for (var i = 0;i < 8; i++)
    // {
    //     var tap = new Tap(0,0,0,0);
    //     tap.draw();
    //     tap.set(startPosition[i][0],startPosition[i][1]);
    // }

    //load audio
    new WebAudioDecoder()
        .add('audio_music',resources['audio_music'].data)
        .add('audio_perfect',resources['audio_perfect'].data)
        .add('audio_flick',resources['audio_flick'].data)
        .decode(onAudioDecoded);
}
var waitDisplay;
var display;
function onAudioDecoded(res)
{

    music = new WebAudio(res['audio_music']);
    tapSE = new WebAudio(res['audio_perfect']);
    flickSE = new WebAudio(res['audio_flick']);

    //ロード画面消去
    document.body.removeChild(document.getElementById("loading"));
    app.stage.visible = true;
    app.view.addEventListener("touchstart",onMouseDown);
    app.view.addEventListener("touchend",onMouseUp);
    app.view.addEventListener("mousedown",onMouseDown);
    // app.view.addEventListener("mouseup",onMouseUp);
    // app.view.addEventListener("touchend",onFingerUp);

    waitDisplay = new WaitDisplay();
    display = new Display();
    display.addCombo()

    // music.play();
    waitDisplay.show();
    update();
}
function transPositiontoArea(x,y)
{
    // x = x;
    // y = y;
    if(x<y)
        if(x+y<SIZE)
            if(y<SIZE/2)
                return 6;
            else
                return 5;
        else
        if(x<SIZE/2)
            return 4;
        else
            return 3;
    else
    if(x+y>SIZE)
        if(y>SIZE/2)
            return 2;
        else
            return 1;
    else
    if(x>SIZE/2)
        return 0;
    else
        return 7;
}


function update()
{
    //tap
    // console.log(music.getTime()-updatetime);
    // updatetime = music.getTime();

    for (var i = 0; i < 8; i++)
    {
        if ((tapMap[i].length!=0)&&((music.getTime()-tapMap[i][0].time)>130))//miss
        {
            // noteMap[i][0].destroy();
            tapMap[i][0].destroy();
            tapMap[i].shift();
            console.log("miss");
            display.add(i,3);
        }
        for (var j = 0; j < tapMap[i].length; j++)
            tapMap[i][j].update(music.getTime());

        if ((holdMap[i].length!=0)&&(!holdMap[i][0].hoding)&&((music.getTime()-holdMap[i][0].time)>130))//miss
        {
            // noteMap[i][0].destroy();
            holdMap[i][0].destroy(holdMap[i][0].headsprite);
            holdMap[i][0].destroy(holdMap[i][0].pigusprite);
            holdMap[i].shift();
            console.log("miss");
            display.add(i,3);
        }
        if ((holdMap[i].length!=0)&&(holdMap[i][0].hoding)&&((music.getTime()-holdMap[i][0].time-holdMap[i][0].holdtime)>130))//miss
        {
            // noteMap[i][0].destroy();
            holdMap[i][0].destroy(holdMap[i][0].pigusprite);
            holdMap[i].shift();
            console.log("miss");
            display.add(i,3);
        }
        for (var j = 0; j < holdMap[i].length; j++)
            holdMap[i][j].update(music.getTime());

        display.update();
    }
    if (music.getIsEnd())
        display.showResult();
    requestAnimationFrame(update);
}
function onMouseDown(e)
{
    tapSE.play()
    if(waitDisplay.isShow){
        waitDisplay.destroy();
        music.play();
    }
    for(var i=e.touches.length;i--;){
        var touch = e.touches[i];
        var touchArea = transPositiontoArea(touch.clientX,touch.clientY);
        if(tapMap[touchArea].length!=0)
        {
            if(Math.abs(tapMap[touchArea][0].time - music.getTime()) < 50)
            {
                tapMap[touchArea][0].destroy();
                tapMap[touchArea].shift();
                console.log("perfect");
                display.add(touchArea,0);
            }
            else if(Math.abs(tapMap[touchArea][0].time - music.getTime()) < 80)
            {
                tapMap[touchArea][0].destroy();
                tapMap[touchArea].shift();
                console.log("great");
                display.add(touchArea,1);
            }
            else if(Math.abs(tapMap[touchArea][0].time - music.getTime()) < 110)
            {
                tapMap[touchArea][0].destroy();
                tapMap[touchArea].shift();
                console.log("good");
                display.add(touchArea,2);
            }
        }
        if(holdMap[touchArea].length!=0)
        {
            if(holdMap[touchArea][0].hoding == false)
                if(Math.abs(holdMap[touchArea][0].time - music.getTime()) < 50)
                {
                    holdMap[touchArea][0].taped = true;
                    holdMap[touchArea][0].hoding = true;
                    console.log("perfect");
                    display.add(touchArea,0);
                }
                else if(Math.abs(holdMap[touchArea][0].time - music.getTime()) < 80)
                {
                    holdMap[touchArea][0].taped = true;
                    holdMap[touchArea][0].hoding = true;
                    console.log("great");
                    display.add(touchArea,1);
                }
                else if(Math.abs(holdMap[touchArea][0].time - music.getTime()) < 110)
                {
                    holdMap[touchArea][0].taped = true;
                    holdMap[touchArea][0].hoding = true;
                    console.log("good");
                    display.add(touchArea,2);
                }
    }

    }
}
function onMouseUp(e)
{
    var touchArea = transPositiontoArea(e.clientX,e.clientY);
    console.log("touch" + touchArea);
    if(holdMap[touchArea].length!=0)
    {
        if(holdMap[touchArea][0].hoding == true)
            if(Math.abs(holdMap[touchArea][0].time+holdMap[touchArea][0].holdtime - music.getTime()) < 50)
            {
                holdMap[touchArea][0].hoding = false;
                holdMap[touchArea][0].destroy(holdMap[touchArea][0].pigusprite);
                holdMap[touchArea].shift();
                console.log("perfect");
                display.add(touchArea,0);
                tapSE.play()

            }
            else if(Math.abs(holdMap[touchArea][0].time+holdMap[touchArea][0].holdtime - music.getTime()) < 80)
            {
                holdMap[touchArea][0].hoding = false;
                holdMap[touchArea][0].destroy(holdMap[touchArea][0].pigusprite);
                holdMap[touchArea].shift();
                console.log("great");
                display.add(touchArea,1);
            }
            else if(Math.abs(holdMap[touchArea][0].time+holdMap[touchArea][0].holdtime - music.getTime()) < 110)
            {
                holdMap[touchArea][0].hoding = false;
                holdMap[touchArea][0].destroy(holdMap[touchArea][0].pigusprite);
                holdMap[touchArea].shift();
                console.log("good");
                display.add(touchArea,2);
            }
            else// too early
            {
                holdMap[touchArea][0].hoding = false;
                holdMap[touchArea][0].destroy(holdMap[touchArea][0].pigusprite);
                holdMap[touchArea].shift();
                console.log("miss");
                display.add(touchArea,3);
            }
    }
}


var Tap = function (type, time, position, double)
{
    this.type = type;
    this.time = time;
    this.position = position;
    this.sprite = new PIXI.Sprite(noteResList[double].texture);
    this.drawed = false;

    this.rsize = 0;
}
Tap.prototype = {
    update:function (time) {
        //this.time -> 判定时间，perfect时间
        //time -> 当前时间
        if((this.time - time < SPEED)&&(time-this.time < 130))//移动note时间区间
        {
            // if(!this.drawed&&(time - this.time < 5000))
            // console.log(this.time);
            // console.log(time);
            var x = (judgePosition[this.position][0] - startPosition[this.position][0])*(this.time-time)/SPEED-judgePosition[this.position][0];
            var y = (judgePosition[this.position][1] - startPosition[this.position][1])/SPEED*(this.time-time)-judgePosition[this.position][1];
            this.set(-x, -y);
            // console.log("jp"+judgePosition[this.position][0]+"sp"+startPosition[this.position][0]);
            // console.log("x"+x+"y"+y);
        }
        else if((this.time - time < SPEED + 0.55*SPEED))//note放大时间区间
        {
            if(!this.drawed)
            {
                this.draw();
                this.set(startPosition[this.position][0],startPosition[this.position][1]);
                this.drawed = true;
            }
            var xsize = (time-(this.time-SPEED-0.55*SPEED))/(0.55*SPEED)*this.rsize;
            var ysize = 60/this.sprite.height/SPEED*(time-(this.time-SPEED-SPEED));
            this.sprite.scale.x = xsize;
            this.sprite.scale.y = xsize;

        }
        //     this.destroy();
    },
    draw:function () {
        this.rsize = 50/this.sprite.height;
        this.sprite.scale.x *= 0.0001;
        this.sprite.scale.y *= 0.0001;

        // this.set(300,300);
        this.sprite.anchor.set(0.5);
        app.stage.addChild(this.sprite);
    },
    set:function (x,y)
    {
        this.sprite.x = x;
        this.sprite.y = y;
    },
    destroy:function(){
        app.stage.removeChild(this.sprite);
    }
};
var Hold = function (type, time, position, double, holdtime)
{
    this.type = type;
    this.time = time;
    this.position = position;
    this.headsprite = new PIXI.Sprite(noteResList[2].texture);
    this.pigusprite = new PIXI.Sprite(noteResList[2].texture);

    this.holdtime = holdtime;
    this.headdrawed = false;
    this.pigudrawed = false;
    this.taped = false;
    this.hoding = false;

    this.rsize = 0;
    this.linegraphics = new PIXI.Sprite(noteResList[3].texture);

}
Hold.prototype = {
    update:function (time) {

        // this.drawline();
        //this.time -> 判定时间，perfect时间
        //time -> 当前时间
        if((this.time - time < SPEED))//head 移动时间
        {
            this.drawline();
            if(this.taped)//打头
            {
                this.taped = false;
                this.destroy(this.headsprite);
                this.headsprite.x = judgePosition[this.position][0];
                this.headsprite.y = judgePosition[this.position][1];
            }

            // console.log(time);
            if (!this.hoding)
            {

                var x = (judgePosition[this.position][0] - startPosition[this.position][0])*(this.time-time)/SPEED-judgePosition[this.position][0];
                var y = (judgePosition[this.position][1] - startPosition[this.position][1])/SPEED*(this.time-time)-judgePosition[this.position][1];
                this.set(this.headsprite,-x, -y);
            }

            // console.log("jp"+judgePosition[this.position][0]+"sp"+startPosition[this.position][0]);
            // console.log("x"+x+"y"+y);
        }
        else if((this.time - time < SPEED + 0.5*SPEED)&&(this.hoding == false))//head放大时间区间
        {
            if(!this.headdrawed)
            {
                this.draw();
                this.set(this.headsprite,startPosition[this.position][0],startPosition[this.position][1]);
                this.headdrawed = true;
            }
            if(!this.pigudrawed)
            {
                this.set(this.pigusprite,startPosition[this.position][0],startPosition[this.position][1]);
                // this.pigusprite.scale.x = this.rsize;
                // this.pigusprite.scale.y = this.rsize;
                app.stage.addChild(this.pigusprite);
                this.pigudrawed = true;
            }
            // var xsize = 60/this.sprite.height/SPEED*(time-(this.time-SPEED-SPEED));
            var xsize = (time-(this.time-SPEED-SPEED))/SPEED*this.rsize;
            this.headsprite.scale.x = xsize;
            this.headsprite.scale.y = xsize;
            this.pigusprite.scale.x = xsize;
            this.pigusprite.scale.y = xsize;

        }

        if (this.time + this.holdtime - time < SPEED)//pigu 移动时间
        {
            var x = (judgePosition[this.position][0] - startPosition[this.position][0])*(this.time-time+this.holdtime)/SPEED-judgePosition[this.position][0];
            var y = (judgePosition[this.position][1] - startPosition[this.position][1])/SPEED*(this.time-time+this.holdtime)-judgePosition[this.position][1];
            this.set(this.pigusprite,-x, -y);
        }

        //draw line

        // else if(time - this.time > 130)
        //     this.destroy();
    },
    draw:function () {
        this.headsprite.anchor.x = 0.5;
        this.headsprite.anchor.y = 0.9;
        this.pigusprite.anchor.x = 0.5;
        this.pigusprite.anchor.y = 0.9;
        // this.headsprite.anchor.set(0.5);
        //
        // this.pigusprite.anchor.set(0.5);

        this.rsize = 50/this.headsprite.width;

        this.headsprite.scale.x *= 0.0001;
        this.headsprite.scale.y *= 0.0001;
        // this.set(this.headsprite,400,300);

        this.headsprite.rotation += 3.14159265358979323846/8 * (this.position*2+1);
        this.pigusprite.rotation += this.headsprite.rotation + 3.14159265358979323846;
        app.stage.addChild(this.headsprite);

    },
    set:function (sprite,x,y)
    {
        sprite.x = x;
        sprite.y = y;
    },
    destroy:function(sprite){
        app.stage.removeChild(sprite);
        app.stage.removeChild(this.linegraphics);
    },
    drawline:function () {
        // console.log("dddd");
        // this.linegraphics.beginFill(0xFF3300);
        // this.linegraphics.lineStyle(4, 0xffd900, 1);
        // this.linegraphics.moveTo(this.pigusprite.x,this.pigusprite.y);
        // this.linegraphics.lineTo(this.headsprite.x,this.headsprite.y);
        if((judgePosition[this.position][0]>startPosition[this.position][0]&&this.pigusprite.x<this.headsprite.x)||(judgePosition[this.position][0]<startPosition[this.position][0]&&this.pigusprite.x>this.headsprite.x))
            if(this.hoding)
            {
                app.stage.removeChild(this.linegraphics);
                this.linegraphics = new PIXI.Sprite(noteResList[3].texture);
                // this.linegraphics.anchor.set(0.5);
                // var linetempx=10;
                // var linetempy=-10;
                // if(8>this.position>3)
                //     linetempx*=-1;
                // if(6>this.position>1)
                //     linetempy*=-1;
                // this.linegraphics.x = (this.headsprite.x+this.pigusprite.x)/2+linetempx;
                // this.linegraphics.y = (this.headsprite.y+this.pigusprite.y)/2+linetempy;
                // this.linegraphics.scale.x *= this.rsize;
                // this.linegraphics.scale.y *=2+ Math.sqrt(Math.pow(this.headsprite.y - this.pigusprite.y,2)+ Math.pow(this.headsprite.x - this.pigusprite.x,2));
                this.linegraphics.anchor.x = 0.5;
                this.linegraphics.x = this.pigusprite.x;
                this.linegraphics.y = this.pigusprite.y;
                this.linegraphics.scale.x = this.headsprite.scale.x;
                this.linegraphics.scale.y = 15 + Math.sqrt(Math.pow(this.headsprite.y - this.pigusprite.y,2)+ Math.pow(this.headsprite.x - this.pigusprite.x,2));

                this.linegraphics.rotation += 3.14159265358979323846/8 * (this.position*2+1+8);
                app.stage.addChild(this.linegraphics);
            }
            else {
                app.stage.removeChild(this.linegraphics);
                this.linegraphics = new PIXI.Sprite(noteResList[3].texture);
                // this.linegraphics.anchor.set(0.5);
                this.linegraphics.anchor.x = 0.5;

                // var linetempx=10;
                // var linetempy=-10;
                // if(8>this.position>3)
                //     linetempx*=-1;
                // if(6>this.position>1)
                //     linetempy*=-1;
                // this.linegraphics.x = (this.headsprite.x*1.1+this.pigusprite.x)/2.1;
                // this.linegraphics.y = (this.headsprite.y*1.1+this.pigusprite.y)/2.1;
                this.linegraphics.x = this.pigusprite.x;
                this.linegraphics.y = this.pigusprite.y;
                // this.linegraphics.scale.x *= this.rsize;
                this.linegraphics.scale.x = this.headsprite.scale.x;
                this.linegraphics.scale.y = 15 + Math.sqrt(Math.pow(this.headsprite.y - this.pigusprite.y,2)+ Math.pow(this.headsprite.x - this.pigusprite.x,2));
                this.linegraphics.rotation += 3.14159265358979323846/8 * (this.position*2+1+8);
                app.stage.addChild(this.linegraphics);
            }

    }
};


var WaitDisplay = function(){
    this.text = new PIXI.Text("welcome", {
        fontFamily: 'Arial',
        fontSize: 35,
        fontWeight:'bold',
        fill: 'white',
        align:'center'
    });
    this.text.setText(WELCOME);
    this.text.position.set(0,100);
}
WaitDisplay.prototype = {
    isShow:false,
    show:function(){
        this.isShow = true;
        app.stage.addChild(this.text);
    },
    destroy:function(){
        this.isShow = false;
        app.stage.removeChild(this.text);
    }
}

var Display = function() {
    this.comboCount = [0,0,0,0];

    this.baseCircle = new PIXI.Graphics();
    this.baseCircle.lineStyle(2, 0xFF00FF, 1);
    this.baseCircle.drawCircle((judgePosition[0][0] + judgePosition[4][0])/2, (judgePosition[0][1] + judgePosition[4][1])/2,240);
    for(var i=0;i<8;i++)
    {
        this.baseCircle.beginFill(0xFFFF0B, 0.5);
        this.baseCircle.lineStyle(0, 0xFF00FF, 1);
        this.baseCircle.drawCircle(judgePosition[i][0],judgePosition[i][1],5);
    }
    app.stage.addChild(this.baseCircle);

    this.judgeCircle = [[],[],[],[],[],[],[],[]];
    this.judgeCircleGraphics = new PIXI.Graphics();
    this.combo = new PIXI.Text("0", {
        fontFamily: 'Arial',
        fontSize: 35,
        fill: 'green',
        fontWeight:'bold'
    });
    this.combo.position.set(540/2,540/2);
    this.combo.anchor.set(0.5,0.5)
    this.combonum = 0;
    // this.combo.setText(this.combonum);
    this.combotext = new PIXI.Text("combo", {
        fontFamily: 'Arial',
        fontSize: 35,
        fill: 'green',
        fontWeight:'bold'
    });
    this.combotext.position.set(540/2,540/2-80);
    this.combotext.anchor.set(0.5,0.5)
}
Display.prototype = {
    addCombo:function(){
        app.stage.addChild(this.combo);
        app.stage.addChild(this.combotext);
        app.stage.addChild(this.judgeCircleGraphics);
    },
    add:function (position, type)
    {//perfect:0 great:1 good:2
        if (type == 0)
        {
            this.combonum += 1;
            this.comboCount[0] += 1;
            this.judgeCircle[position][0] = music.getTime();
            this.judgeCircle[position][1] = 0;
        }
        if (type == 1)
        {
            this.combonum += 1;
            this.comboCount[1] += 1;
            this.judgeCircle[position][0] = music.getTime();
            this.judgeCircle[position][1] = 1;
        }
        if (type == 2)
        {
            this.combonum += 1;
            this.comboCount[2] += 1;
            this.judgeCircle[position][0] = music.getTime();
            this.judgeCircle[position][1] = 2;
        }
        else if(type == 3)
        {
            this.combonum = 0;
            this.comboCount[3] += 1;
            this.judgeCircle[position][0] = (music.getTime());
            this.judgeCircle[position][1] = 3;
        }
        this.combo.setText(this.combonum);
    },
    update:function ()
    {
        this.judgeCircleGraphics.clear();
        for (var i=0;i<8;i++)
        {
           if (music.getTime() - this.judgeCircle[i][0]< 250)//r = 0~50  t = 0~250ms
           {
               if(this.judgeCircle[i][1] == 0)
                   this.judgeCircleGraphics.lineStyle(2, 0xDBDB00, 1);
               else if(this.judgeCircle[i][1] == 1)
                   this.judgeCircleGraphics.lineStyle(2, 0xFF00FF, 1);
               else if(this.judgeCircle[i][1] == 2)
                   this.judgeCircleGraphics.lineStyle(2, 0x6EDD61, 1);
               else if(this.judgeCircle[i][1] == 3)
                   this.judgeCircleGraphics.lineStyle(2, 0xCACACA, 1);
               this.judgeCircleGraphics.drawCircle(judgePosition[i][0],judgePosition[i][1],(music.getTime() - this.judgeCircle[i][0])/5);
           }
       }
    },
    showResult:function ()
    {
        this.combotext.setText("perfect:"+this.comboCount[0]+" great:"+this.comboCount[1]);
        this.combo.setText("good:"+this.comboCount[2]+" miss:"+this.comboCount[3]);
    }
}