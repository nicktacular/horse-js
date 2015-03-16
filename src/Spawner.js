function Spawner(options)
{
    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.opts = $.extend(this.defaultOptions, options);
    this.timeout = null;
    this.running = false;
}

Spawner.prototype.defaultOptions = {
    minDelay: 200,
    maxDelay: 500,
    callback: function(){},
    object: null
};

Spawner.prototype.start = function()
{
    this.timeout = window.setTimeout(
        this.spawn().bind(this),
        this.rand(this.opts.minDelay, this.opts.maxDelay)
    );
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

Spawner.prototype.spawn = function()
{
    var element = this.opts.object && $(this.opts.object.length)
        ? $(this.opts.object).clone()
        : null;
    var callback = this.opts.callback && typeof this.opts.callback === 'function'
        ? this.opts.callback
        : null;
    return function() {
        this.timeout = window.setTimeout(
            this.spawn().bind(this),
            this.rand(this.opts.minDelay, this.opts.maxDelay)
        );
    }
}

Spawner.prototype.rand = function(min, max) {
    if (typeof min === 'undefined') min = 0;
    if (typeof max === 'undefined') max = 1;
    if (min > max) {
        throw new RangeError('requested invalid range');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
