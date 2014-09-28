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
