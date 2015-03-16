function Spawner(options)
{
    if (!options || !options.object || !$(options.object).length) {
        throw new Error('required an object.');
    }
    this.opts = $.extend(this.defaultOptions, options);
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
            this.spawner(),
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

Spawner.prototype.spawner = function()
{
    var element = this.opts.object && $(this.opts.object.length)
        ? $(this.opts.object).first().clone()
        : null;
    var callback = this.opts.callback && typeof this.opts.callback === 'function'
        ? this.opts.callback
        : null;
    return (function() {
        callback.call(element);
        this.timeout = window.setTimeout(
            this.spawner().bind(this),
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
