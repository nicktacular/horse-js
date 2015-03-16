function Epilepsy(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.epilepsies = [];
    this.opts = $.extend({}, this.defaultOptions, options);
    this.intervalProperty = '__epilepsy';
    if (!this.validateOptions(this.opts)) {
        throw Error('invalid options for epilepsy');
    }
}

Epilepsy.prototype.defaultOptions = {
    spawners: 8,
    minDelay: 1000,
    maxDelay: 2000,
    animation: null, // runs in context of options.object
    minDuration: 50,
    maxDuration: 50
};

Epilepsy.prototype.validateOptions = function(options) {
    return (
        options &&
            (typeof options.spawners === 'number' && options.spawners > 0 ) &&
            (typeof options.minDelay === 'number' && options.minDelay >= 0 ) &&
            (typeof options.maxDelay === 'number' && options.maxDelay >= 0 ) &&
            (options.minDelay <= options.maxDelay) &&
            (typeof options.minDuration === 'number' && options.minDuration >= 0 ) &&
            (typeof options.maxDuration === 'number' && options.maxDuration >= 0 ) &&
            (options.minDuration <= options.maxDuration) &&
            (options.object instanceof jQuery && options.object.length === 1) &&
            (typeof options.animation  === 'function' || options.animation === null)
        );
};

Epilepsy.prototype.start = function() {
    if (this.epilepsies.length || this.opts.spawners < 0) {
        return this;
    }
    for (var i = 0; i < this.opts.spawners; i++) {
        this.epilepsies.push(this.generateSpawner());
    }
    return this;
};

Epilepsy.prototype.generateSpawner = function() {

    return new Spawner({
        object: $(this.opts.object),
        callback: this.seize.bind(this),
        minDelay: this.opts.minDelay,
        maxDelay: this.opts.maxDelay
    }).start();

};

Epilepsy.prototype.seize = function(element, lastElement) {

    if (!element || !$(element).length) {
       return;
    }
    element = $(element);
    // remove the last one
    if (lastElement instanceof jQuery) {
        if (lastElement.data(this.intervalProperty)) {
            window.clearInterval(lastElement.data(this.intervalProperty));
        }
        lastElement.remove();
    }
    // create the new one
    element.css({
        position: 'fixed',
        top: this.rand(0, window.innerHeight),
        left: this.rand(0, window.innerWidth)
    }).appendTo($('body'));
    var animate = this.opts.animation ? this.opts.animation.bind(element) : null;
    if (animate) {
        var delay = this.rand(this.opts.minDuration, this.opts.maxDuration);
        element.data(this.intervalProperty, window.setInterval(animate, delay));
    }

};

Epilepsy.prototype.stop = function() {
    for (var i = 0; i < this.epilepsies.length; i++) {
        this.epilepsies[i].stop();
    }
    this.epilepsies = [];
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
    proximity: 50,
    velocity: 50
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

    var position = this.thing.offset();
    this.thing.css({
        "left": position.left,
        "top": position.top,
        "position": "absolute",
        "z-index": 2147483647
    });   // lol
    this.uniqueId = Math.random().toString(36).substr(2);
    this.window.on('mousemove.runaway' + this.uniqueId, $.proxy(this.run, this));

};

/**
 * if mouse is within proximity, travel velocity pixels relative to mouse position vs center of element
 * @param e
 */
Runaway.prototype.run = function(e) {
    var position = this.thing.offset();


    var halfWidth = this.thing.outerWidth()/2;
    var halfHeight = this.thing.outerHeight()/2;

    // first grab object position CENTER relative to object size
    var adjustedPos = [
        position.left + halfWidth,
        position.top + halfHeight
    ];

    var mouseOffset = [
        e.pageX - adjustedPos[0],
        e.pageY - adjustedPos[1]
    ];

    // in most cases, the mouse isn't even close to the object
    // so this saves us a lot of calculations
    if (
        Math.abs(mouseOffset[0]) > this.proximity + halfWidth ||
        Math.abs(mouseOffset[1]) > this.proximity + halfHeight
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
function Spawner(options)
{
    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.opts = $.extend({}, this.defaultOptions, options);
    this.timeout = null;
}

Spawner.prototype.defaultOptions = {
    minDelay: 200,
    maxDelay: 500,
    callback: null,
    object: null
};

Spawner.prototype.start = function()
{
    if (!this.timeout) {
        this.timeout = window.setTimeout(
            this.spawner().bind(this),
            this.rand(this.opts.minDelay, this.opts.maxDelay)
        );
    }
    return this;
};

Spawner.prototype.stop = function()
{
    if (this.timeout) {
        window.clearTimeout(this.timeout)
        this.timeout = null;
    }
    return this;
};

Spawner.prototype.spawner = function(lastElement)
{
    if (typeof lastElement === undefined) {
        lastElement = null;
    }
    var element = this.opts.object && $(this.opts.object.length)
        ? $(this.opts.object).first().clone()
        : null;
    var callback = this.opts.callback && typeof this.opts.callback === 'function'
        ? this.opts.callback
        : null;
    return (function() {
        callback(element, lastElement);
        this.timeout = window.setTimeout(
            this.spawner(element).bind(this),
            this.rand(this.opts.minDelay, this.opts.maxDelay)
        );
    }).bind(this);
}

Spawner.prototype.rand = function(min, max) {
    min = parseInt(min, 10);
    max = parseInt(max, 10);
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (min > max) {
        throw new RangeError('requested invalid range');
    } else if (min === max) {
        return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
;
function Storm(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.storms = [];
    this.opts = $.extend({}, this.defaultOptions, options);
    if (!this.validateOptions(this.opts)) {
        throw Error('invalid options for storm');
    }
}

Storm.prototype.defaultOptions = {
    spawners: 20,
    minDelay: 600,
    maxDelay: 800,
    minDuration: 200,
    maxDuration: 600
};

Storm.prototype.validateOptions = function(options) {
    return (
        options &&
        (typeof options.spawners === 'number' && options.spawners > 0 ) &&
        (typeof options.minDelay === 'number' && options.minDelay >= 0 ) &&
        (typeof options.maxDelay === 'number' && options.maxDelay >= 0 ) &&
        (options.minDelay <= options.maxDelay) &&
        (typeof options.minDuration === 'number' && options.minDuration >= 0 ) &&
        (typeof options.maxDuration === 'number' && options.maxDuration >= 0 ) &&
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

Storm.prototype.generateSpawner = function() {

    return new Spawner({
        object: $(this.opts.object),
        callback: this.storm.bind(this),
        minDelay: this.opts.minDelay,
        maxDelay: this.opts.maxDelay
    }).start();

};

Storm.prototype.storm = function(element) {
    if (!element || !$(element).length) {
        return;
    }
    element
        .css({
            position: 'fixed',
            left: -1 * element.width(),
            top: this.rand(0, window.innerHeight)
        })
        .animate(
            { left: window.innerWidth },
            this.rand(this.opts.minDuration, this.opts.maxDuration),
            'linear',
            function() { element.remove(); }
        )
        .appendTo($('body'));
};

Storm.prototype.stop = function() {
    for (var i = 0; i < this.storms.length; i++) {
        this.storms[i].stop();
    }
    this.storms = [];
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
