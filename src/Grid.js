/*
 * Grid used to house the gems
 * Tracks what gem is in the selected grid spot and the adjacent grids
 */

// Imports
import device;
import ui.View;

// Game closure class
exports = Class(ui.View, function(supr) {
    var grid = [], shiftedGems = [], matched = [], reservoir = [],
        CellInteraction, FindSequence;
    
    // Constructor for the grid. Expects number of columns, rows, and gemsize
    this.init = function(opts) {
        opts = merge(opts, {
			x: ((opts.parentWidth - (opts.columns * opts.gemSize) - (opts.gemMargin * (opts.columns - 1)))/2),
			y: opts.y_offset,
			width: (opts.columns * opts.gemSize) + ((opts.columns - 1) * opts.gemMargin),
			height: (opts.rows * opts.gemSize) + ((opts.rows - 1) * opts.gemMargin),
		});
        
        supr(this, 'init', [opts]);

        this.build();
    };
    
    // Called at the end of checking to remove all matched cells
    function ClearMatched() {
        var score = 0, fallQueue = [];

        for(var i = 0, len = matched.length; i < len; i++) {
            score += 10;
            matched[i].matched = false;
            
            reservoir.push(matched[i].item);
            matched[i].item.style.y -= device.height;
            
            matched[i].item = void 0;
        }
        // TODO - Send new score console.error(score);
        
         
        for (var i = matched.length - 1; i >= 0; i--) {
            // If there is a cell that's empty below this remove itself
            if (matched[i].neighbors[2] !== void 0 && matched[i].neighbors[2].item === void 0) matched.splice(i, 1);
        }

        for (var i = 0, len = matched.length; i < len; i++) {
            fallQueue.push(matched[i]);
            while(fallQueue[fallQueue.length - 1].neighbors[0] !== void 0) {
                fallQueue.push(fallQueue[fallQueue.length - 1].neighbors[0]);
                if (fallQueue[fallQueue.length - 1].item !== void 0) {
                    fallQueue[0].item = fallQueue[fallQueue.length - 1].item;
                    // TODO - Add method in gem for falling animation
                    fallQueue[0].item.style.x = fallQueue[0].style.x;
                    fallQueue[0].item.style.y = fallQueue[0].style.y;
                    shiftedGems.push(fallQueue[0]);
                    fallQueue[fallQueue.length - 1].item = void 0;
                    fallQueue.shift();
                }
            }
            // TODO - Randomize from pool and drop down
            fallQueue.length = 0;
        }
        
        // TODO - Either new function or in here, do a check on shiftedGems
        
        matched.length = 0;
    }
    
    // Given a cell
    //     1) Search neightbors for matches
    //     2) If 3+ are match in a line
    //     3) "remove" them
    //     4) Make it rain
    FindSequence = (function() {
        // Recursive search - if matched and set for removal, set cell matched so it will be ignored
        function SearchNeighbor(matcher, cell, dir, cage) {
            if (cell !== void 0 && cell.item.color === matcher) {
                cage.push(cell);
                SearchNeighbor(matcher, cell.neighbors[dir], dir, cage);
            }
        }
        
        return function(cell) {
            // A cell that's been matched means it will be set to be removed, in which case, no need to check
            // With that said, we will have to consider when new gems are created, but if we make it so they're never the same color then we can ignore it
            // if (cell.matched) return;
            var horiMatch = [], vertMatch = [];
            
            horiMatch.push(cell);
            vertMatch.push(cell);
            
            SearchNeighbor(cell.item.color, cell.neighbors[0], 0, vertMatch);
            SearchNeighbor(cell.item.color, cell.neighbors[1], 1, horiMatch);
            SearchNeighbor(cell.item.color, cell.neighbors[2], 2, vertMatch);
            SearchNeighbor(cell.item.color, cell.neighbors[3], 3, horiMatch);
            
            if (horiMatch.length > 2) {
                for(var i = 0, len = horiMatch.length; i < len; i++) {
                    if (!horiMatch[i].matched) {
                        horiMatch[i].matched = true;
                        matched.push(horiMatch[i]);
                    } 
                }
            }
            
            if (vertMatch.length > 2) {
                for (var i = 0, len = vertMatch.length; i < len; i++) {
                    if (!vertMatch[i].matched) {
                        vertMatch[i].matched = true;
                        matched.push(vertMatch[i]);
                    }
                }
            }
        };
    })();
    
    CellInteraction = (function() {
        var curItem = void 0;
        
        function Swap(swapItem) {
            var temp = curItem.item;
            curItem.item = swapItem.item;
            curItem.item.SetPosition(curItem.style.x, curItem.style.y);
            swapItem.item = temp;
            swapItem.item.SetPosition(swapItem.style.x, swapItem.style.y);
            
            FindSequence(curItem);
            FindSequence(swapItem);
            ClearMatched();
        }
        
        return function() {
            if (this.item === void 0) return;
            if (curItem === void 0) {
                curItem = this;
            } else {
                if (curItem.neighbors.includes(this)) {
                    Swap(this);
                }
                curItem = void 0;
            }
        };
    })();
    
    this.build = function () {
        var opts = this._opts,
            newRow = [];
        
        for (var row = 0; row < opts.rows; row++) {
            for (var col = 0; col < opts.columns; col++) {
                var newCell = new ui.View({
                    superview: this,
                    clip: true,
                    x: col * (opts.gemSize + opts.gemMargin),
                    y: row * (opts.gemSize + opts.gemMargin),
                    width: opts.gemSize,
                    height: opts.gemSize,
                });
                newCell.neighbors = [];
                newCell.item = void 0;
                newCell.matched = false;
                
                newCell.on('InputSelect', CellInteraction);

                newRow.push(newCell);
            }
            grid.push(newRow);
            newRow = [];
        }
        
        newRow = void 0;
        
        // Go through the newly created array of the board and set a reference for each grid's neighbors
        // neighbors = [top, right, bottom, left]
        for (var row = 0, maxRows = opts.rows; row < maxRows; row++) {
            for (var col = 0, maxCols = opts.columns; col < maxCols; col++) {
                // Set top
                if (row - 1 >= 0) grid[row][col].neighbors.push(grid[row - 1][col]);
                else grid[row][col].neighbors.push(void 0);
                
                // Set right
                if (col + 1 < maxCols) grid[row][col].neighbors.push(grid[row][col + 1]);
                else grid[row][col].neighbors.push(void 0);
                
                // Set bottom
                if (row + 1 < maxRows) grid[row][col].neighbors.push(grid[row + 1][col]);
                else grid[row][col].neighbors.push(void 0);
                
                // Set left
                if (col - 1 >= 0) grid[row][col].neighbors.push(grid[row][col - 1]);
                else grid[row][col].neighbors.push(void 0);
            }
        }
        
        this.fillBoard();
    }
    
    this.fillBoard = function () {
        var opts = this._opts;
        
        for (var row = 0, maxRows = opts.rows; row < maxRows; row++) {
            for (var col = 0, maxCols = opts.columns; col < maxCols; col++) {
                var newItem = new opts.item.itemClass({
                    x: grid[row][col].style.x,
                    y: grid[row][col].style.y,
                    width: opts.gemSize,
                    height: opts.gemSize,
                    margin: opts.gemMargin
                });
                // I have the grid itself handle events 
                newItem.setHandleEvents(false);
                grid[row][col].item = newItem;
                this.addSubview(newItem);
            }
        }
    }
});
