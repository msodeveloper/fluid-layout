(function(root) {
  var App = function(container) {
    this.$container = $(container);
    this.id = 0;

    // start app adding the firts box
    this.add();
  };

  App.prototype.add = function(position) {
    var newBox = new Box(this.id += 1);

    if(!position) {
      this.$container.append(newBox);
    } else {
      this.$container.find(position).next(newBox);
    }

    // this.addListeners(newBox);
  };

  this.App = App;
} (this));
$(function() {
  // by default, it adds 1 box in the document
  new App('.container2');
});
(function(root) {
  var Box = function(text) {
    this.$box = $('<div class="box">').text(text);

    this.addListeners();

    return this.$box;
  };

  Box.prototype.addListeners = function() {
    this.$box.on('click', function() {
      console.log('hue');
    });
  };

  this.Box = Box;
} (this));