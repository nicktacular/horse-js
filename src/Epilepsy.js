function Epilepsy(options) {

    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.Epilepsies = [];
    this.options = $.extend(this.defaultOptions, options);

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
    if (this.Epilepsies.length || this.options.spawners < 0) {
        return this;
    }
    for (var i = 0; i < this.options.spawners; i++) {
        this.Epilepsies.push(this.generateSpawner());
    }
    return this;
};

Epilepsy.prototype.generateSpawner = function(i) {

    if (typeof i === 'undefined') {
        i = this.Epilepsies.length;
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
    return Math.floor(Math.random() * (max - min)) + min;
};
