// import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
// import src.soundcontroller as soundcontroller;


exports = Class(ui.ImageView, function(supr) {
    // All the possible gem colors
    // (*Orginally this was for setting the background color since images were not working, at this point this is for more for reference)
    var gemColors = ["purple", "orange", "blue", "red", "green"];
    
    this.init = function(opts) {
        // If color is passed, use it, otherwise randomize
        if (opts.color === void 0 || opts.color < 0 || opts.color >= gemColors.length) {
            this.color = Math.floor(Math.random() * gemColors.length);
        } else {
            this.color = opts.color;  
        }
        
        opts = merge(opts, {
            image: "resources/images/gems/gem_0" + (this.color + 1) + ".png"
        })
        
        supr(this, 'init', [opts]);
        
        // this.x = opts.x;
        // this.y = opts.y;
        
        this.build();
    }
    
    this.build = function () {
        
        /*
		this.on('InputSelect', bind(this, function () {
            this.emit('gem:touched');
		}));
        */
        
    }
    
    this.SetPosition = function (newX, newY) {
        this.style.x = newX;
        this.style.y = newY;
    }
});