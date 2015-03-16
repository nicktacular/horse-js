/**
 * Uselessly rotates your cursor.
 * ... with mad respect to CraigIsCool.com for the first version
 * @param {Object} [options] - Some options. Sane defaults provided.
 * @param {int} [options.speed=40] - ms, how often do we rotate the cursor?
 * @param {$} [options.target=*] - cursor change affects what on the page?
 * @param {bool} [options.anti=false] - if true, spins anticlockwise
 */
function Cursor(options)
{
    this.opts = $.extend({}, this.defaultOptions, options);
    this.cursors = [
        'n-resize',
        'ne-resize',
        'e-resize',
        'se-resize',
        's-resize',
        'sw-resize',
        'w-resize',
        'nw-resize'
    ];
    this.pos = 0;
    this.interval = null;
}

Cursor.prototype.defaultOptions = {
    speed: 40,
    target: '*',
    anti: false
};

Cursor.prototype.blip = function()
{
    $(this.opts.target).css('cursor', this.cursors[this.pos]);
    if (this.opts.anti && this.pos === 0) {
        this.pos = this.cursors.length - 1;
    } else if (!this.opts.anti && this.pos === this.cursors.length - 1) {
        this.pos = 0;
    } else if (this.opts.anti) {
        this.pos--;
    } else {
        this.pos++;
    }
};

Cursor.prototype.start = function()
{
    if (this.timeout) {
        this.stop();
    }
    this.interval = window.setInterval(
        this.blip.bind(this),
        this.opts.speed
    );
    return this;
};

Cursor.prototype.stop = function()
{
    if (this.interval) {
        window.clearInterval(this.interval);
    }
    return this;
};