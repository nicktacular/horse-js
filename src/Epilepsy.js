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
