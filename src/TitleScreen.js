// Imports
import ui.View;
import ui.ImageView;
import ui.TextView;

exports = Class(ui.ImageView, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function() {
		var startbutton = new ui.TextView({
			superview: this,
			x: 50,
			y: 200,
			width: 220,
			height: 100,
            color: '#FFF',
            text: 'Click to Start',
		});
        
        // this.addSubview(startbutton);

		/* Listening for a touch or click event, and will dispatch a
		 * custom event to the title screen, which is listened for in
		 * the top-level application file.
		 */
		this.on('InputSelect', function () {
			this.emit('titlescreen:start');
		});
	};
});