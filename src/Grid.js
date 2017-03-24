/*
 * Grid used to house the gems
 * Tracks what gem is in the selected grid spot and the adjacent grids
 */

// Imports
import device;
import ui.View;

// Game closure class
exports = Class(ui.View, function(supr) {
    var gemFallTime = 500, grid = [], shiftedGems = [], matched = [], reservoir = [],
        CellInteraction, FindSequence, gameOn = false;
    
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
    
    // Outputs current grid state in log for debugging purposes
    function PrintGrid() {
        var gridPrint = "\n";
        for(var i = 0; i < grid.length; i++) {
            for(var j = 0; j < grid[i].length; j++) {
                gridPrint += (grid[i][j].item === void 0 ? "O " : "x ");
            }
            gridPrint += "\n";
        }
        console.error(gridPrint);
    }
    
    function CheckNewGems() {
        while (shiftedGems.length > 0) {
            FindSequence(shiftedGems.shift());
        }
        if (matched.length > 0) {
            ClearMatched();
        } else {
            grid[0][0].__parent.setHandleEvents(true, !gameOn);
        }
    }
    
    // Called at the end of checking to remove all matched cells
    function ClearMatched() {
        var score = 0, fallQueue = [], tempItem, tempCell, heightCounter, spliced = false;;

        // Loop through matched cells and remove their item, tallies up a score to send to scoreboard
        //     All "removed" items are moved offscreen and placed in another array to be reused
        for(var i = 0, len = matched.length; i < len; i++) {
            score += 10;
            matched[i].matched = false;
            
            reservoir.push(matched[i].item);
            matched[i].item.style.y -= device.height;
            
            matched[i].item = void 0;
        }
        grid[0][0].__parent.emit("UpdateScore", score);
        
        
        // Go through matched array again and if there is a cell that's empty below this remove itself
        for (var i = matched.length - 1; i >= 0; i--) {
            tempCell = matched[i];
            while (tempCell.neighbors[2] !== void 0) {
                if (tempCell.neighbors[2].item === void 0) {
                    matched.splice(i, 1);
                    break;
                } else {
                    tempCell = tempCell.neighbors[2];
                }
            } 
        }
        
        // Of the remaining cells
        //     1) Create a queue
        //     2) for each column with an empty cell, go up the grid
        //     3) moving any item to the bottomost empty cell and any empty cells get added to the queue
        for (var i = 0, len = matched.length; i < len; i++) {
            
            // Bottomost empty cell is pushed onto queue
            fallQueue.push(matched[i]);
            while(fallQueue[fallQueue.length - 1].neighbors[0] !== void 0) {
                // Push top neighbor onto queue
                fallQueue.push(fallQueue[fallQueue.length - 1].neighbors[0]);
                
                // If neightbor is not empty, move to cell on bottom of queue and remove it from the queue
                // Add moved item onto shifted array
                if (fallQueue[fallQueue.length - 1].item !== void 0) {
                    fallQueue[0].item = fallQueue[fallQueue.length - 1].item;
                    fallQueue[0].item.AnimateToPosition(fallQueue[0].style.x, fallQueue[0].style.y, 500);
                    shiftedGems.push(fallQueue[0]);
                    fallQueue[fallQueue.length - 1].item = void 0;
                    fallQueue.shift();
                }
            }
            
            // What's left in the fallqueue are empty empty cells on the top, loop through our reservoir for items to fill them
            heightCounter = 0;
            while (fallQueue.length > 0) {
                heightCounter++;
                tempItem = reservoir.shift();
                tempCell = fallQueue.shift();
                tempItem.RandomizeType();
                tempItem.SetPosition(tempCell.style.x, -heightCounter * tempItem.style.height - tempItem.__parent.style.y);
                tempItem.AnimateToPosition(tempCell.style.x, tempCell.style.y, gemFallTime);
                tempCell.item = tempItem;
                shiftedGems.push(tempCell);
            }
            // TODO - check colors before drop animation to make sure there's at least one match, change as neccessary
            
            fallQueue.length = 0;
        }
        
        matched.length = 0;
        
        // After animation, check new position of shifted gems for matches
        //     If there are, go through this process again
        //     Otherwise, start input events again for player
        setTimeout(CheckNewGems, gemFallTime);
    }
    
    // Searches the passed cell, finding if their is a match in the items
    FindSequence = (function() {
        // Recursive search - if matched and set for removal, set cell matched so it will be ignored
        function SearchNeighbor(matcher, cell, dir, cage) {
//            if (cell !== void 0) {
//                console.error(cell.item.color === matcher)
//                console.error(cell);
//            }
                
            if (cell !== void 0 && cell.item.color === matcher) {
                cage.push(cell);
                SearchNeighbor(matcher, cell.neighbors[dir], dir, cage);
            }
        }
        
        return function(cell) {
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
    
    // Functions pertaining to the user click on the "gems"
    CellInteraction = (function() {
        var curItem = void 0, swapItem = void 0;
        
        // Called after item swap to first see if there are matches, if none animate the items back to original position
        //     otherwise, go into matched methods
        function Check() {
            FindSequence(curItem);
            FindSequence(swapItem);
            if (matched.length === 0) {
                var temp = curItem.item;
                curItem.item = swapItem.item;
                curItem.item.AnimateToPosition(curItem.style.x, curItem.style.y, 500);
                swapItem.item = temp;
                swapItem.item.AnimateToPosition(swapItem.style.x, swapItem.style.y, 500, function() {
                    this.__parent.setHandleEvents(true, !gameOn);
                });
            } else {
                ClearMatched();
            }
            swapItem = void 0;
            curItem = void 0;
        }
        
        // Swaps 2 selected items and calls their animation with last one doing a callback to check
        function Swap() {
            var temp = curItem.item;
            curItem.item = swapItem.item;
            curItem.item.AnimateToPosition(curItem.style.x, curItem.style.y, 500);
            swapItem.item = temp;
            swapItem.item.AnimateToPosition(swapItem.style.x, swapItem.style.y, 500, Check);
            curItem.__parent.setHandleEvents(true, true);
        }
        
        return function() {
            if (this.item === void 0) return;
            if (curItem === void 0) {
                curItem = this;
            } else {
                if (curItem.neighbors.includes(this)) {
                    swapItem = this;
                    Swap();
                } else {
                    curItem = void 0;
                }
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
        
        // this.fillBoard();
        this.on("StopGame", function() {
            gameOn = false;
            this.setHandleEvents(true, true);
        });
    }
    
    // Used during board fill initialization for shuffling items that are matched
    function RotateOut(cell) {
        var problemCells = matched, tempItem, tempType;
        
        // Reset flag on original items
        matched.forEach(function(element) {
            element.matched = false;
        });
        matched = [];
        
        for (var i = 0, len = problemCells.length; i < len; i++) {
            tempItem = problemCells[i].item;
            
            // First, swap gem with neighbors to see if there if new location creates match
            //     If not, it's good and we break out
            //     Otherwise, we rotate item type and check with that
            for (var j = 0; j < 4; j++) {
                if (problemCells[i].neighbors[j] !== void 0) {
                    problemCells[i].item = problemCells[i].neighbors[j].item;
                    problemCells[i].neighbors[j].item = tempItem;
                    FindSequence(problemCells[i].neighbors[j]);
                    FindSequence(problemCells[i]);
                    if (matched > 0) {
                        problemCells[i].neighbors[j].item = problemCells[i].item;
                        problemCells[i].item = tempItem;
                        matched.forEach(function(element) {
                            element.matched = false;
                        });
                        matched.length = 0;
                    } else {
                        problemCells[i].item.SetPosition(problemCells[i].style.x, problemCells[i].style.y);
                        problemCells[i].neighbors[j].item.SetPosition(problemCells[i].neighbors[j].style.x, problemCells[i].neighbors[j].style.y);
                        
                        problemCells.length = 0;
                        break;
                    }
                }
            }
            
            if (problemCells.length === 0) break;
            
            tempType = problemCells[i].item.color;
            do {
                problemCells[i].RotateType();
                FindSequence(problemCells[i]);
                if (matched === 0) {
                    console.error("Swapped color");
                    console.error(problemCells[i].item);
                    problemCells.length = 0;
                    break;
                } else {
                    matched.forEach(function(element) {
                        element.matched = false;
                    });
                    matched.length = 0;
                }
            } while (problemCells[i].item.color !== tempType);
        }
    }
    
    // Fills the board with the items passed in the options
    //     Future implementation should make this more accessible to multiple item types
    this.fillBoard = function () {
        var opts = this._opts;
        
        // TODO - Change fill to
        //    A) Not have gems already be in matched places
        //    B) Make sure there is atleast solvable
        for (var row = 0, maxRows = opts.rows; row < maxRows; row++) {
            for (var col = 0, maxCols = opts.columns; col < maxCols; col++) {
                var newItem = new opts.item.itemClass({
                    x: grid[row][col].style.x,
                    y: grid[row][col].style.y,
                    width: opts.gemSize,
                    height: opts.gemSize,
                    margin: opts.gemMargin
                });
                // I have the grid be the one to instead of the item handle events 
                newItem.setHandleEvents(false);
                grid[row][col].item = newItem;
                this.addSubview(newItem);
            }
        }
        
        for (var row = 0, rowLen = grid.length; row < rowLen; row++) {
            for (var col = 0, colLen = grid[row].length; col < colLen; col++) {
                FindSequence(grid[row][col]);
                if (matched.length > 0) RotateOut();
            }
        }
        
        gameOn = true;
        this.emit("GameStart");
        this.setHandleEvents(true, false);
    }
});
