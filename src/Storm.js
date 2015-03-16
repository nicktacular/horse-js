/**
 * Spawn an object and fly it across the screen.
 * @param {Object} options - Some options. Sane defaults provided.
 * @param {$} options.object - what gets displayed?
 * @param {int} [options.minDelay=600] - how quickly should spawners run?
 * @param {int} [options.maxDelay=800] - how quickly should spawners run?
 * @param {int} [options.minDuration=200] - how long should it take to move across the screen?
 * @param {int} [options.maxDuration=600] - how long should it take to move across the screen?
 */
function Storm(options) {
    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.spawner = null;
    this.opts = $.extend({}, this.defaultOptions, options);
    if (!this.validateOptions(this.opts)) {
        throw Error('invalid options for storm');
    }
}

Storm.prototype.defaultOptions = {
    minDelay: 100,
    maxDelay: 200,
    minDuration: 200,
    maxDuration: 600
};

Storm.prototype.validateOptions = function(options) {
    return (
        options &&
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
    if (this.spawner) {
        this.spawner.stop();
    }
    this.spawner = new Spawner({
        object: $(this.opts.object),
        callback: this.storm.bind(this),
        minDelay: this.opts.minDelay,
        maxDelay: this.opts.maxDelay
    }).start();
    return this;
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
    if (this.spawner) {
        this.spawner.stop();
    }
    this.spawner = null;
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
