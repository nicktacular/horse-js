function Epilepsy(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.Epilepsies = [];
    this.opts = $.extend(this.defaultOptions, options);

}

Epilepsy.prototype.defaultOptions = {
    spawners: 8,
    minDelay: 1000,
    maxDelay: 2000,
    animation: null, // runs in context of options.object
    minDuration: 50,
    maxDuration: 50
};

Epilepsy.prototype.options = function(options, option) {
    if (typeof options === 'undefined') {
        return this.opts;
    }
    var newOptions = this.opts;
    if (typeof option === 'undefined' && typeof options === 'object') {
        $.extend(newOptions, options);
    } else if (typeof option !== 'undefined') {
        var v = {};
        v[options] = option;
        $.extend(newOptions, v);
    } else {
        throw TypeError('unexpected configuration');
    }
    if (this.validateOptions(newOptions)) {
        this.opts = newOptions;
    } else {
        throw Error('invalid parameter');
    }
    return this;
};

Epilepsy.prototype.validateOptions = function(options) {
    return (
        options &&
            (options.spawners === 'number' && options.spawners > 0 ) &&
            (options.minDelay === 'number' && options.minDelay >= 0 ) &&
            (options.maxDelay === 'number' && options.maxDelay >= 0 ) &&
            (options.minDelay <= options.maxDelay) &&
            (options.minDuration === 'number' && options.minDuration >= 0 ) &&
            (options.maxDuration === 'number' && options.maxDuration >= 0 ) &&
            (options.minDuration <= options.maxDuration) &&
            (options.object instanceof jQuery && options.object.length === 1) &&
            (typeof options.animation  === 'function' || options.animation === null)
        );
};

Epilepsy.prototype.start = function() {
    if (this.Epilepsies.length || this.opts.spawners < 0) {
        return this;
    }
    for (var i = 0; i < this.opts.spawners; i++) {
        this.Epilepsies.push(this.generateSpawner());
    }
    return this;
};

Epilepsy.prototype.generateSpawner = function(i) {

    if (typeof i === 'undefined') {
        i = this.Epilepsies.length;
    }

    var o = this.opts;
    var element = $(o.object).first().clone().appendTo($('body'))
        .css({
            position: 'fixed',
            top: this.rand(0, window.innerHeight),
            left: this.rand(0, window.innerWidth)
        });
    var animate = o.animation ? $.proxy(o.animation, element) : null;
    if (animate) {
        var delay = this.rand(o.minDuration, o.maxDuration);
        var interval = window.setInterval(animate, delay);
    }
    var self = this;
    return window.setTimeout(function() {
        window.clearInterval(interval);
        element.remove();
        self.Epilepsies[i] = self.generateSpawner(i);
    }, this.rand(o.minDelay, o.maxDelay));

};

Epilepsy.prototype.stop = function() {
    var Epilepsies = this.Epilepsies;
    this.Epilepsies = [];
    for (var i = 0; i < Epilepsies.length; i++) {
        window.clearTimeout(Epilepsies[i]);
    }
    return this;
};

Epilepsy.prototype.rand = function(min, max) {
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (min > max) {
        throw new RangeError('requested invalid range');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
;
/**
 * starts running
 * @param options
 */
$.fn.runaway = function(options) {
    $.each(this, function() {
        if (typeof this.runaway === 'undefined') {
            this.runaway = new Runaway(options);
        }

        this.runaway.start(this);
    });
};

/**
 * stops running
 */
$.fn.staystill = function() {
    $.each(this, function() {
        if (typeof this.runaway !== 'undefined') {
            this.runaway.stop();
        }
    });
};

/**
 * falls back to defaults
 * @param options (optional)
 * @constructor
 */
function Runaway(options) {
    for (var i in this.options) {
        if (typeof options !== 'undefined' && options.hasOwnProperty(i)) {
            this[i] = options[i];
        } else {
            this[i] = this.options[i];
        }
    }
}

Runaway.prototype.options = {
    proximity: 30,
    velocity: 20
};

Runaway.prototype.velocity = 0;
Runaway.prototype.thing = null;
Runaway.prototype.window = null;
Runaway.prototype.uniqueId = '';

/**
 * keep track of relevant elements, bind run on mousemove
 * @param thing
 */
Runaway.prototype.start = function(thing) {
    this.thing = $(thing);
    this.window = $(window);

    this.thing.css({"position": "fixed", "z-index": 2147483647});   // lol
    this.uniqueId = Math.random().toString(36).substr(2);
    this.window.on('mousemove.runaway' + this.uniqueId, $.proxy(this.run, this));
};

/**
 * if mouse is within proximity, travel velocity pixels relative to mouse position vs center of element
 * @param e
 */
Runaway.prototype.run = function(e) {
    var position = this.thing.offset();

    var halfWidth = this.thing.width()/2;
    var halfHeight = this.thing.height()/2;

    // first grab object position CENTER relative to window scroll and object size
    var adjustedPos = [
        position.left + halfWidth - this.window.scrollLeft(),
        position.top + halfHeight - this.window.scrollTop()
    ];

    var mouseOffset = [
        e.pageX - adjustedPos[0],
        e.pageY - adjustedPos[1]
    ];

    // in most cases, the mouse isn't even close to the object
    // so this saves us a lot of calculations
    if (
        Math.abs(mouseOffset[0] - adjustedPos[0]) > this.proximity + halfWidth ||
        Math.abs(mouseOffset[1] - adjustedPos[1]) > this.proximity + halfHeight
        ) {
        return;
    }

    var mouseVector = [
        Math.cos(mouseOffset[0]),
        Math.sin(mouseOffset[1])
    ];

    // these are the relative coordinates of the edge of the object in the direction of the mouse
    // for instance, the corners are the farthest away the mouse can be from the center and still be touching the object
    var objectOffset = [
        halfWidth * mouseVector[0],
        halfHeight * mouseVector[1]
    ];

    var dist = this.distance(mouseOffset, objectOffset);

    if (dist > this.proximity) {
        return;
    }

    var vector = [
        this.velocity * mouseVector[0],
        this.velocity * mouseVector[1]
    ];

    var newPosition = [
        position.left - vector[0],
        position.top - vector[1]
    ];

    if (
        newPosition[0] < 0 ||
            newPosition[0] > this.window.width() ||
            newPosition[1] < 0 ||
            newPosition[1] > this.window.height()
        ) {    // out of bounds, lets get random
        newPosition[0] = Math.floor(Math.random() * this.window.width());
        newPosition[1] = Math.floor(Math.random() * this.window.height());
    }

    // RUN AWAY
    this.thing.offset({
        left: newPosition[0],
        top: newPosition[1]
    });
};

/**
 * helper distance function
 * @param a - [x1, y1]
 * @param b - [x2, y2]
 * @returns {number}
 */
Runaway.prototype.distance = function(a, b) {
    return Math.floor(Math.sqrt(Math.pow(b[1] - a[1], 2) + Math.pow(b[0] - a[0], 2)));
};

/**
 * unbind
 */
Runaway.prototype.stop = function() {
    this.thing.unbind('mouseover.runaway' + this.uniqueId);
};
;
function Storm(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.storms = [];
    this.opts = $.extend(this.defaultOptions, options);

}

Storm.prototype.defaultOptions = {
    spawners: 20,
    minDelay: 600,
    maxDelay: 800,
    minDuration: 200,
    maxDuration: 600
};

Storm.prototype.options = function(options, option) {
    if (typeof options === 'undefined') {
        return this.opts;
    }
    var newOptions = this.opts;
    if (typeof option === 'undefined' && typeof options === 'object') {
        $.extend(newOptions, options);
    } else if (typeof option !== 'undefined') {
        var v = {};
        v[options] = option;
        $.extend(newOptions, v);
    } else {
        throw TypeError('unexpected configuration');
    }
    if (this.validateOptions(newOptions)) {
        this.opts = newOptions;
    } else {
        throw Error('invalid parameter');
    }
    return this;
};

Storm.prototype.validateOptions = function(options) {
    return (
        options &&
        (options.spawners === 'number' && options.spawners > 0 ) &&
        (options.minDelay === 'number' && options.minDelay >= 0 ) &&
        (options.maxDelay === 'number' && options.maxDelay >= 0 ) &&
        (options.minDelay <= options.maxDelay) &&
        (options.minDuration === 'number' && options.minDuration >= 0 ) &&
        (options.maxDuration === 'number' && options.maxDuration >= 0 ) &&
        (options.minDuration <= options.maxDuration) &&
        (options.object instanceof jQuery && options.object.length === 1)
    );
};

Storm.prototype.start = function() {
    if (this.storms.length || this.opts.spawners < 0) {
        return this;
    }
    for (var i = 0; i < this.opts.spawners; i++) {
        this.storms.push(this.generateSpawner());
    }
    return this;
};

Storm.prototype.generateSpawner = function(i) {

    if (typeof i === 'undefined') {
        i = this.storms.length;
    }

    var o = this.opts;
    var element = $(o.object).first().clone()
        .appendTo($('body'));
    element
        .css({
            position: 'fixed',
            left: -1 * element.width(),
            top: this.rand(0, window.innerHeight)
        })
        .animate(
            { left: window.innerWidth },
            this.rand(o.minDuration, o.maxDuration),
            'linear',
            function() { element.remove(); }
        );
    var self = this;
    return window.setTimeout(function() {
        self.storms[i] = self.generateSpawner(i);
    }, this.rand(o.minDelay, o.maxDelay));

};

Storm.prototype.stop = function() {
    var storms = this.storms;
    this.storms = [];
    for (var i = 0; i < storms.length; i++) {
        window.clearTimeout(storms[i]);
    }
    return this;
};

Storm.prototype.rand = function(min, max) {
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (min > max) {
        throw new RangeError('requested invalid range');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
