

//sdk imports
import device;
import ui.View;
import ui.ImageView;
import ui.StackView as StackView;
import ui.TextView as TextView;

// user imports
// TODO - import title screen and soundcontroller when needed
import src.GameScreen as GameScreen

exports = Class(GC.Application, function () {

    this.initUI = function () {
         var gameScreen = new GameScreen();
        
        /*
        this.tvHelloWorld = new TextView({
            superview: this.view,
            text: 'Test!',
            color: 'white',
            x: 0,
            y: 100,
            width: this.view.style.width,
            height: 100
        });
        */
        
        this.view.style.backgroundColor = '#333';
        
        // Using the whack a mole demo default for now to get started, may change if I see fit
        // Create a stackview of size 320x480, then scale it to fit horizontally
		// Add a new StackView to the root of the scene graph
		var rootView = new StackView({
			superview: this,
			x: 0,
			y: 0,
			width: 320,
			height: 570,
			clip: true,
			scale: device.width / 320
		});
        
        // TODO - Make titlescreen
        // rootView.push(titlescreen);
        rootView.push(gameScreen);

        // TODO - Add sounds 
        // var sound = soundcontroller.getSound();
        
        /* Listen for an event dispatched by the title screen when
		 * the start button has been pressed. Hide the title screen,
		 * show the game screen, then dispatch a custom event to the
		 * game screen to start the game.
		 */
        // TODO - once title screen is in, enable a start button and optionalyl a new mode with special mechanics
		/* titlescreen.on('titlescreen:start', function () {
		 *     sound.play('levelmusic');
         *     rootView.push(gamescreen);
         *     gamescreen.emit('app:start');
		 * });
         */
        
        /* When the game screen has signalled that the game is over,
		 * show the title screen so that the user may play the game again.
		 */
        // TODO - Again, need title screen
        /*
		 * gamescreen.on('gamescreen:end', function () {
         *     sound.stop('levelmusic');
         *     rootView.pop();
		 * });
         */
        


    };

    this.launchUI = function () {

    };

});
