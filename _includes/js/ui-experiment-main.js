(function(){
    var wrapper = document.querySelector('.ui-experiment');

    var Class = function(methods) {
        var c = function() {
            this.initialize.apply(this, arguments);
        };

        for (var property in methods) {
            c.prototype[property] = methods[property];
        }

        if (!c.prototype.initialize) c.prototype.initialize = function() {};

        return c;
    };

    // JS Class for transforming an entire section relative to mouse
    var OppositeTrack = Class({
        initialize: function(el, opt) {
            "use strict";

            if (typeof opt.BOUNDS == 'number' && opt.BOUNDS > 0) {
                this.BOUNDS = opt.BOUNDS;
            } else {
                this.BOUNDS = 10;
            }

            if (typeof opt.CENTERED != 'undefined' && opt.CENTERED != false) {
                this.CENTERED = true;
            } else {
                this.CENTERED = false;
            }

            // Elements
            this.el = el;
            this.rect = this.el.getBoundingClientRect();

            // Half width and height of window
            this.halfw = wrapper.innerWidth / 2;
            this.halfh = wrapper.innerHeight / 2;

            window.onresize = function() {
                this.halfw = wrapper.innerWidth / 2;
                this.halfh = wrapper.innerHeight / 2;
            }
        },
        handleEvent: function(e) {
            return this[e.type] && this[e.type](e);
        },
        mousemove: function(e) {
            // Get mouse position relative to center of screen
            var mx = e.x - this.halfw;
            var my = e.y - this.halfh;

            // Calculate ratio of how far away the mouse is from the center of
            // the window in accordance with the constant BOUNDS
            var percx = -(mx / this.halfw * this.BOUNDS);
            var percy = -(my / this.halfh * this.BOUNDS);

            if (this.CENTERED) {
                percx = percx - this.rect.width / 2;
                percy = percy - this.rect.height / 2;
            }

            // Move the tiles with the calculated values, also trick rendering
            // to be done from gpu instead of cpu thanks to translate3d
            this.el.style.mozTransform = 'translate3d(' + percx + 'px, ' + percy + 'px, 0px)';
            this.el.style.transform = 'translate3d(' + percx + 'px, ' + percy + 'px, 0px)';
        },
        attach: function() {
            wrapper.addEventListener('mousemove', this);
        },
        detach: function() {
            this.el.style.transform = '';
            wrapper.removeEventListener('mousemove', this);
        }
    });

    // Locks css cursor to cursor and gives two states to it
    var CustomCursor = Class({
        initialize: function(cursor, opt) {
            "use strict";

            this.defaults = {
                cssID: 'custom-cursor-css',
                transformStyle: 'transform',
                transformStyles: ['transform', 'transform3d', 'position']
            };

            this.cursor = cursor;
            this.rect = cursor.getBoundingClientRect();

            this.cssID = (typeof opt.cssID == 'string' && opt.cssID != '') ? opt.cssID : this.defaults.cssID;
            this.transformStyle = (typeof opt.transformStyle == 'string' && this.matchTransforms(opt.transformStyle) > -1) ? opt.transformStyle : this.defaults.transformStyle;
        },
        handleEvent: function(e) {
            return this[e.type] && this[e.type](e);
        },
        mousemove: function(e) {
            // Add hovering style to cursor when hovering a link
            if (e.target.tagName == 'A' || (' ' + e.target.className + ' ').replace(/[\n\t]/g, ' ').indexOf(' hoverable ') > -1) {
                this.addClass('hovering');
            } else {
                this.removeClass('hovering');
            }

            var x = e.x - (this.rect.width / 2);
            var y = e.y - (this.rect.height / 2);

            if (this.transformStyle == 'transform') {
                this.cursor.style.mozTransform = 'translate(' + x.toString() + 'px' + ',' + y.toString() + 'px' + ')';
                this.cursor.style.transform = 'translate(' + x.toString() + 'px' + ',' + y.toString() + 'px' + ')';
            } else if (this.transformStyle == 'transform3d') {
                this.cursor.style.mozTransform = 'translate3d(' + x.toString() + 'px' + ',' + y.toString() + 'px' + ',0)';
                this.cursor.style.transform = 'translate3d(' + x.toString() + 'px' + ',' + y.toString() + 'px' + ',0)';
            } else if (this.transformStyle == 'position') {
                this.cursor.style.left = x.toString() + 'px';
                this.cursor.style.top = y.toString() + 'px';
            }
        },
        mousedown: function(e) {
            this.addClass('active');
        },
        mouseup: function(e) {
            this.removeClass('active');
        },
        matchTransforms: function(str) {
            var i = this.defaults.transformStyles.length;
            while (i--) {
                if (this.defaults.transformStyles[i].match(str)) return i;
            }
            return -1;
        },
        addClass: function(className) {
            if (this.cursor.classList) {
                this.cursor.classList.add(className);
            } else {
                this.cursor.className += ' ' + className;
            }
        },
        removeClass: function(className) {
            if (this.cursor.classList) {
                this.cursor.classList.remove(className);
            } else {
                this.cursor.className = cursor.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },
        addCss: function() {
            var css = '\r*,*:before,*:after {\r\n\tcursor: none !important;\r\n}\r\n#' + this.cursor.id + ' {\r\n\tposition: fixed;\r\n\ttop: 0;\r\n\tleft: 0;\r\n\t-webkit-transition: none;\r\n\t-ms-transition: none;\r\n\ttransition: none;\r\n\tpointer-events: none;\r\n}\r\n',
                style = document.createElement('style');

            style.id = this.cssID;
            style.type = 'text/css';

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            wrapper.appendChild(style);
        },
        removeCss: function() {
            var el = wrapper.getElementById(this.cssID);
            wrapper.removeChild(el);
        },
        attach: function() {
            if (!wrapper.getElementById(this.cssID)) {
                this.addCss();
            }
            this.cursor.style.pointerEvents = 'none';
            wrapper.addEventListener('mousedown', this);
            wrapper.addEventListener('mousemove', this);
            wrapper.addEventListener('mouseup', this);
        },
        detach: function() {
            if (wrapper.getElementById(this.cssID)) {
                this.removeCss();
            }
            this.cursor.style.pointerEvents = '';
            if (this.transformStyle == 'transform' || this.transformStyle == 'transform3d') {
                this.cursor.style.mozTransform = '';
                this.cursor.style.transform = '';
            } else {
                this.cursor.style.left = '';
                this.cursor.style.top = '';
            }
            wrapper.removeEventListener('mousedown', this);
            wrapper.removeEventListener('mousemove', this);
            wrapper.removeEventListener('mouseup', this);
        }
    });

    // Simple onload function
    var onload = function(callback) {
        document.readyState === 'interactive' || document.readyState === 'complete' ? callback : document.addEventListener('DOMContentLoaded', callback);
    };

    // Fire javascript when the page is loaded
    onload(function() {
        // Constants
        var CLICK = (navigator.userAgent.match(/iPad/i)) ? 'touchstart' : 'click';

        // Flickity instructions
        var tiles = wrapper.querySelector('.tiles');
        var flkty = new Flickity(tiles, {
            // autoPlay: 10000, // Is buggy
            cellAlign: 'left',
            wrapAround: true,
            prevNextButtons: false,
            pageDots: false
        });

        // Flickity data
        var fdata = Flickity.data('.tiles');

        // Get the current page
        var current = wrapper.querySelector('.page-number');
        current.innerHTML = fdata.selectedIndex + 1;

        // Change page number on flick
        flkty.on('dragEnd', function() {
            current.innerHTML = fdata.selectedIndex + 1;
        });

        // Move through flickity gallery on arrows
        var left = wrapper.querySelector('.left');
        var right = wrapper.querySelector('.right');
        wrapper.addEventListener(CLICK, function(e) {
            if (e.target == left) {
                flkty.previous(true);
                current.innerHTML = fdata.selectedIndex + 1;
            }
            if (e.target == right) {
                flkty.next(true);
                current.innerHTML = fdata.selectedIndex + 1;
            }
        });

        // Get the total number of pages
        var total = wrapper.querySelector('.total-pages');
        total.innerHTML = fdata.cells.length;

        // Init custom cursor
        var cursor = new CustomCursor(wrapper.getElementById('cursor'), {
            transformStyle: 'transform3d' // Options are: transform, transform3d, position
        });

        // Init translation
        var trans = new OppositeTrack(wrapper.querySelector('.fullWidth'), {
            BOUNDS: 50,
            // CENTERED: true
        });

        // Seems to fix cursor issue on dragging a link but not really?
        var links = wrapper.getElementsByTagName('A');
        links.ondragstart = function() {
            return false;
        };

        // Lock 
        if (window.innerWidth > 768) {
            cursor.attach();
            trans.attach();
        } else {
            cursor.detach();
            trans.detach();
        }

        var t;
        window.onresize = function() {
            clearTimeout(t);
            t = setTimeout(function() {
                if (window.innerWidth > 768) {
                    cursor.attach();
                    trans.attach();
                } else {
                    cursor.detach();
                    trans.detach();
                }
            }, 400);
        }
    });
})();
