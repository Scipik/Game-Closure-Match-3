// Import stuff as needed
// import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.Grid as Grid;
import src.Gem as Gem;

var score = 0,
    high_score = 19,
    // hit_value = 1,
    // mole_interval = 600,
    // game_on = false,
    // game_length = 20000, //20 secs
    // countdown_secs = game_length / 1000,
    lang = 'en';

exports = Class(ui.ImageView, function (supr) {
    
	this.init = function (opts) {
        opts = merge(opts, {
			x: 0,
			y: 0,
			width: 320,
			height: 570,
            image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

		this.build();
	};

    /*
	 * Layout the scoreboard and gems
	 */
	this.build = function () {
        // TODO - Start button pressed
		// this.on('app:start', start_game_flow.bind(this));
        
		this._scoreboard = new ui.TextView({
			superview: this,
			x: 0,
			y: 15,
			width: 320,
			height: 50,
            text: 'test',
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: '#FFFFFF'
		});
        
		var layout = [],
            columns = 7,
            rows = 7,
            gemSize = 38,
            gemMargin = 5;

		this.style.width = 320;
		this.style.height = 480;

        // Instantiate the gameboard and send the object to fill the slots
        this.gameBoard = new Grid({
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
        // Add the board to our tree
        this.addSubview(this.gameBoard);
	};
});