import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
// import src.soundcontroller as soundcontroller;

exports = Class(ui.ImageView, function(supr) {
    // All the possible gem colors
    // (*Orginally this was for setting the background color since images were not working, at this point this is for more for reference)
    var gemColors = ["purple", "orange", "blue", "red", "green"],
        gemImages = [
            new Image({url: 'resources/images/gems/gem_01.png'}),
            new Image({url: 'resources/images/gems/gem_02.png'}),
            new Image({url: 'resources/images/gems/gem_03.png'}),
            new Image({url: 'resources/images/gems/gem_04.png'}),
            new Image({url: 'resources/images/gems/gem_05.png'})
        ];
    
    this.init = function(opts) {
        // If color is passed, use it, otherwise randomize
        if (opts.color === void 0 || opts.color < 0 || opts.color >= gemColors.length) {
            this.color = Math.floor(Math.random() * gemColors.length);
        } else {
            this.color = opts.color;  
        }
        
        opts = merge(opts, {
            image: gemImages[this.color]
        })
        
        supr(this, 'init', [opts]);
        
        this.build();
    }
    
    this.build = function () {
        this._animator = animate(this);
    }
    
    this.SetPosition = function (newX, newY) {
        this.style.x = (newX === void 0 ? this.style.x : newX);
        this.style.y = (newY === void 0 ? this.style.y : newY);
    }
    
    // Called by grid to animate movement, accepts callback and time
    this.AnimateToPosition = function(newX, newY, time, after) {
        time = (time === void 0 ? 500 : time);
        if (after === void 0) {
            this._animator.now({x: newX, y: newY}, time);
        } else {
            this._animator.now({x: newX, y: newY}, time).then(after);
        }
        
        // this._animator.now({x: this.style.x - newX, y: this.style.y - newY}, 1000);
    }
    
    this.RandomizeType = function() {
        this.color = Math.floor(Math.random() * gemColors.length);
        this.setImage(gemImages[this.color]);
    }
    
    this.RotateType = function() {
        this.color = (this.color + 1)%5;
        this.setImage(gemImages[this.color]);
    }
});