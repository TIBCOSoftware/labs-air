/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
var ColorFormats = {
    HEX: 0,
    RGBA: 1,
    HSLA: 2,
    CMYK: 3,
};
export { ColorFormats };
ColorFormats[ColorFormats.HEX] = 'HEX';
ColorFormats[ColorFormats.RGBA] = 'RGBA';
ColorFormats[ColorFormats.HSLA] = 'HSLA';
ColorFormats[ColorFormats.CMYK] = 'CMYK';
var Rgba = /** @class */ (function () {
    function Rgba(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    return Rgba;
}());
export { Rgba };
if (false) {
    /** @type {?} */
    Rgba.prototype.r;
    /** @type {?} */
    Rgba.prototype.g;
    /** @type {?} */
    Rgba.prototype.b;
    /** @type {?} */
    Rgba.prototype.a;
}
var Hsva = /** @class */ (function () {
    function Hsva(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
    return Hsva;
}());
export { Hsva };
if (false) {
    /** @type {?} */
    Hsva.prototype.h;
    /** @type {?} */
    Hsva.prototype.s;
    /** @type {?} */
    Hsva.prototype.v;
    /** @type {?} */
    Hsva.prototype.a;
}
var Hsla = /** @class */ (function () {
    function Hsla(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    return Hsla;
}());
export { Hsla };
if (false) {
    /** @type {?} */
    Hsla.prototype.h;
    /** @type {?} */
    Hsla.prototype.s;
    /** @type {?} */
    Hsla.prototype.l;
    /** @type {?} */
    Hsla.prototype.a;
}
var Cmyk = /** @class */ (function () {
    function Cmyk(c, m, y, k, a) {
        if (a === void 0) { a = 1; }
        this.c = c;
        this.m = m;
        this.y = y;
        this.k = k;
        this.a = a;
    }
    return Cmyk;
}());
export { Cmyk };
if (false) {
    /** @type {?} */
    Cmyk.prototype.c;
    /** @type {?} */
    Cmyk.prototype.m;
    /** @type {?} */
    Cmyk.prototype.y;
    /** @type {?} */
    Cmyk.prototype.k;
    /** @type {?} */
    Cmyk.prototype.a;
}
//# sourceMappingURL=formats.js.map