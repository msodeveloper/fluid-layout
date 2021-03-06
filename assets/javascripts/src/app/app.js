(function(root) {
  var App = function(container) {
    // common variables used though the application
    var $body = $('body');
    this.$container = $(container);
    this.id = 0;
    this.boxes = [];

    // constructors used
    this.storage = new root.App.LocalStorage();
    this.notifications = new root.App.Notifications($body);
    this.statistics = new root.App.Statistics($body, this.boxes.length);

    // Checks if the application was already in some state
    this.storagedBoxes = this.storage.get('boxes');

    if(this.storagedBoxes && this.storagedBoxes.length) {
      this.returnPreviousState();

      // this is a trick to Chrome, which as bugging
      // when everything as rendered from Localstorage
      if(root.chrome) App.helpers.chromeRenderFix();
    } else {
      this.add();
    }
  };

  // when the application starts, gets the data from localStorage
  // and renders it
  App.prototype.returnPreviousState = function() {
    var boxesArray = JSON.parse(this.storagedBoxes);

    boxesArray.forEach(function(boxId, index) {
      var lastItem = (boxesArray.length == index + 1);

      this.id = boxId - 1;

      // this flag prevents the neighbor checking
      // in all elements, only in the last
      this.addEvent(false, !lastItem);
    }.bind(this));

    this.id = Math.max.apply(Math, boxesArray);
  };

  // add a new box, and then run some tasks to update everything
  App.prototype.add = function(position) {
    var newBox = new root.App.Box(this.id += 1);

    if(position) {
      this.$container.find(position.$box).after(newBox.$box);
    } else {
      this.$container.append(newBox.$box);
    }

    this.boxes.push(newBox);

    this.addBoxEvents(newBox);

    this.statistics.update(this.boxes.length);
    this.updateStorage();

    return newBox.$box;
  };

  // used to update localStorage with new boxes
  App.prototype.updateStorage = function() {
    var boxes = Array.prototype.slice.call(this.$container.find('.box'));

    this.storage.set('boxes', JSON.stringify(boxes.map(function(box) { return box.id; })));
  };

  // remove a clicked box, and runs some tasks
  App.prototype.remove = function(el) {
    $(el).remove();

    this.removed = el;

    // removes from the boxes index
    this.boxes.forEach(this.teardownBox.bind(this));

    this.statistics.update(this.boxes.length, 1);
    this.updateStorage();
  };

  // whenvever a box is deleted, it's removed from
  // the boxes array
  App.prototype.teardownBox = function(box, i) {
    if(box.$box[0] === this.removed) {
      this.boxes.splice(i, 1);
    }
  };

  // when a box is created, some events are setted for that box
  App.prototype.addBoxEvents = function(box) {
    // when the addEvent is triggered, adds a new box
    box.on('addEvent', this.addEvent.bind(this, box, false));

    box.on('removeEvent', function(event, el) {
      this.notifications.new(el.id);
      this.remove(el);
      this.renderNeighbors();
      this.lightenBackground();
    }.bind(this));
  };

  // events to run when a box is clicked
  App.prototype.addEvent = function(box, lastItem) {
    this.add(box || false);
    this.darkenBackground();

    if(!lastItem) {
      if(App.helpers.isIE()) this.polyFill();
      this.renderNeighbors();
    }
  };

  // polyfill for last-child to IE9
  App.prototype.polyFill = function() {
    this.$container.find('.box')
      .removeClass('last-child')
      .last()
      .addClass('last-child');
  };

  App.prototype.darkenBackground = function() {
    var bg = this.$container.data('bg'),
      rgb = App.helpers.darkenGray(bg);

    this.$container.data('bg', rgb);

    this.applyBackground(rgb);
  };

  App.prototype.lightenBackground = function() {
    var bg = this.$container.data('bg'),
      rgb = App.helpers.lightenGray(bg);

    this.$container.data('bg', rgb);

    this.applyBackground(rgb);
  };

  App.prototype.applyBackground = function(rgb) {
    this.$container.css('background', 'rgb(' + rgb + ', ' + rgb + ', ' + rgb + ')');
  };

  // when a box is created/deleted, it updates all neighbors
  // values for all boxes
  App.prototype.renderNeighbors = function() {
    this.boxes.forEach(this.checkNeighbors.bind(this));
  };

  App.prototype.checkNeighbors = function(e) {
    var width = e.$box.width(),
      // get the id of the next and previous
      // if there is not it adds false
      left = App.helpers.compareWidth(e.$box, 'prev') ? e.$box.prev()[0].id : false,
      right = App.helpers.compareWidth(e.$box, 'next') ? e.$box.next()[0].id : false;

    e.addNeighbors(left, right);
  };

  this.App = App;
} (this));
