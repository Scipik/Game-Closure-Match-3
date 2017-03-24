// Import stuff as needed
// import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.Grid as Grid;
import src.Gem as Gem;

import ui.resource.Image as Image;

var game_length = 40000, // 40 secs
    lang = 'en';

exports = Class(ui.ImageView, function (supr) {
    
    var scoreBoard, score = 0, gameBoard,
        TimerStart;
    
	this.init = function (opts) {
        opts = merge(opts, {
			x: 0,
			y: 0,
			width: 320,
			height: 570,
            image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

        bind(this, SetUpTimer)();
		this.build();
	};

    function AddScore(val) {
        score += val;
        scoreBoard.setText("Score: " + score);
    }
    
    function SetUpTimer () {
        var timer, timerText, timeLeft;
        
        timerText = new ui.TextView({
            superview: this,
            x: 0,
            y: 500,
            width: 320,
            height: 30,
            text: "Time Left: ",
            size: 30,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            wrap: false,
            color: '#FFF'
        });
            
        function UpdateTimer() {
            if (timeLeft === 0) {
                clearInterval(timer);
                timerText.setText("Game Over");
                gameBoard.emit("StopGame");
            } else {
                timeLeft -= 1000;
                timerText.setText("Time Left: " + timeLeft/1000);
            }
        }
        
        TimerStart = function() {
            timeLeft = game_length;

            timerText.setText("Time Left: " + timeLeft/1000);
            timer = setInterval(UpdateTimer, 1000);
        };
    };
    
    /*
	 * Layout the scoreboard and gems
	 */
	this.build = function () {
        // TODO - Start button pressed
		// this.on('app:start', start_game_flow.bind(this));
        
        var layout = [],
            columns = 7,
            rows = 7,
            gemSize = 38,
            gemMargin = 5,
            bgHeader, headerImg = new Image({url: "resources/images/ui/header.png"});
        
		// this._scoreboard = new ui.TextView({
        bgHeader = new ui.ImageView({
            superview: this,
            x: 35,
            y: 0,
            image: "resources/images/ui/header.png",
            width: 250,
            height: 150
        });
        
        scoreBoard = new ui.TextView({
			superview: bgHeader,
			x: 15,
			y: 72,
			width: 220,
			height: 50,
            text: 'Score: 0',
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: '#FFFFFF'
		});

		this.style.width = 320;
		this.style.height = 480;

        // Instantiate the gameboard and send the object to fill the slots
        gameBoard = new Grid({
            columns: columns,
            rows: rows,
            gemSize: gemSize,
            gemMargin: gemMargin,
            y_offset: 175,
            parentWidth: this.style.width,
            item: {
                itemClass: Gem,
                itemOpts: {
                    range: 5
                }
            }
        });
        
        gameBoard.on("UpdateScore", AddScore);
        gameBoard.on("GameStart", TimerStart);
        
        // Add the board to our tree
        this.addSubview(gameBoard);
        
        this.on("app:start", function() {
            gameBoard.fillBoard();
        });
	};
    

});