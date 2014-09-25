function MichaelBay(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.MichaelBays = [];
    this.options = $.extend(this.defaultOptions, options);

}

MichaelBay.prototype.defaultOptions = {
    spawners: 8,
    minDelay: 1000,
    maxDelay: 2000,
    animation: null, // runs in context of options.object
    minDuration: 50,
    maxDuration: 50
};

MichaelBay.prototype.options = function(options, option) {
    if (typeof options === 'undefined') {
        return this.options;
    }
    var newOptions = this.options;
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
        this.options = newOptions;
    } else {
        throw Error('invalid parameter');
    }
    return this;
};

MichaelBay.prototype.validateOptions = function(options) {
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

MichaelBay.prototype.start = function() {
    if (this.MichaelBays.length || this.options.spawners < 0) {
        return this;
    }
    for (var i = 0; i < this.options.spawners; i++) {
        this.MichaelBays.push(this.generateSpawner());
    }
    return this;
};

MichaelBay.prototype.generateSpawner = function(i) {

    if (typeof i === 'undefined') {
        i = this.MichaelBays.length;
    }

    var o = this.options;
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
        self.MichaelBays[i] = self.generateSpawner(i);
    }, this.rand(o.minDelay, o.maxDelay));

};

MichaelBay.prototype.stop = function() {
    var MichaelBays = this.MichaelBays;
    this.MichaelBays = [];
    for (var i = 0; i < MichaelBays.length; i++) {
        window.clearTimeout(MichaelBays[i]);
    }
    return this;
};

MichaelBay.prototype.rand = function(min, max) {
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (min > max) {
        throw new RangeError('requested invalid range');
    }
    return Math.floor(Math.random() * (max - min)) + min;
};