var xh = xh || {};
///////////////////////////////////////////
// Generic helper functions and constants//
///////////////////////////////////////////
jQuery.fn.extend({
    getPath: function() {
        var pathes = [];
        this.each(function(index, element) {
            var path, $node = jQuery(element);
            while ($node.length) {
                var realNode = $node.get(0),
                    name = realNode.localName;
                if (!name) {
                    break;
                }
                name = name.toLowerCase();
                var parent = $node.parent();
                var sameTagSiblings = parent.children(name);
                if (sameTagSiblings.length > 1) {
                    allSiblings = parent.children();
                    var index = allSiblings.index(realNode) + 1;
                    if (index > 0) {
                        name += ':nth-child(' + index + ')';
                    }
                }
                path = name + (path ? ' > ' + path : '');
                $node = parent;
            }
            pathes.push(path);
        });
        return pathes.join(',');
    }
});
xh.SHIFT_KEYCODE = 16;
xh.X_KEYCODE = 88;
xh.elementsShareFamily = function(primaryEl, siblingEl) {
    var p = primaryEl,
        s = siblingEl;
    return (p.tagName === s.tagName && (!p.className || p.className === s.className) && (!p.id || p.id === s.id));
};
xh.makeQueryForElement = function(el) {
    var query = '';
    query = $(el).getPath();
    var doc = document.querySelector(query);
    $('.xh-highlight').removeClass('xh-highlight');
    $(doc).addClass('xh-highlight');
    return query;
};

xh.clearHighlights = function() {
    var els = document.querySelectorAll('.xh-highlight');
    for (var i = 0, l = els.length; i < l; i++) {
        els[i].classList.remove('xh-highlight');
    }
};

// no nodes are currently highlighted.
xh.evaluateQuery = function(query) {
    var cssPathResult = null;
    cssPathResult = document.querySelector(query);
    // console.log(cssPathResult.textContent);
    return cssPathResult.textContent.trim();
};
var r = [];
xh.showSelectedQuery = function(query) {
    var doc = document.querySelector(query);
    $(doc).ready(function() {
        $(doc).click(function() {
            if (!r.includes(query)) {
                // console.log(query);
                r.push(query);
            }
            return false;
        });
    });
    return r;
};
////////////////////////////
// xh.Bar class definition//
////////////////////////////
xh.Bar = function() {
    this.boundHandleRequest_ = this.handleRequest_.bind(this);
    this.boundMouseMove_ = this.mouseMove_.bind(this);
    this.boundKeyDown_ = this.keyDown_.bind(this);
    this.inDOM_ = false;
    this.currEl_ = null;
    this.barFrame_ = document.createElement('iframe');
    this.barFrame_.src = chrome.runtime.getURL('bar.html');
    this.barFrame_.id = 'xh-bar';
    // Init to hidden so first showBar_() triggers fade-in.
    this.barFrame_.classList.add('hidden');
    document.addEventListener('keydown', this.boundKeyDown_);
    chrome.runtime.onMessage.addListener(this.boundHandleRequest_);
};
xh.Bar.prototype.hidden_ = function() {
    return this.barFrame_.classList.contains('hidden');
};
xh.Bar.prototype.updateQueryAndBar_ = function(el) {
    xh.clearHighlights();
    this.query_ = el ? xh.makeQueryForElement(el) : '';
    this.updateBar_(true);
    this.updateBarSelected_(true);
};
xh.Bar.prototype.updateBar_ = function(updateQuery) {
    var results = this.query_ ? xh.evaluateQuery(this.query_) : ['', 0];
    chrome.runtime.sendMessage({
        type: 'update',
        query: updateQuery ? this.query_ : null,
        results: results
    });
};
xh.Bar.prototype.updateBarSelected_ = function(updateQuery) {
    var result = this.query_ ? xh.showSelectedQuery(this.query_) : ['', 0];
    chrome.runtime.sendMessage({
        type: 'update',
        query: updateQuery ? this.query_ : null,
        result: result
    });
};
xh.Bar.prototype.showBar_ = function() {
    var that = this;

    function impl() {
        that.barFrame_.classList.remove('hidden');
        document.addEventListener('mousemove', that.boundMouseMove_);
        that.updateBar_(true);
    }
    if (!this.inDOM_) {
        this.inDOM_ = true;
        document.body.appendChild(this.barFrame_);
    }
    window.setTimeout(impl, 0);
};
xh.Bar.prototype.hideBar_ = function() {
    var that = this;

    function impl() {
        that.barFrame_.classList.add('hidden');
        document.removeEventListener('mousemove', that.boundMouseMove_);
        xh.clearHighlights();
    }
    window.setTimeout(impl, 0);
};
xh.Bar.prototype.toggleBar_ = function() {
    if (this.hidden_()) {
        this.showBar_();
    } else {
        this.hideBar_();
    }
};
xh.Bar.prototype.handleRequest_ = function(request, sender, cb) {
    if (request.type === 'evaluate') {
        xh.clearHighlights();
        this.query_ = request.query;
        this.updateBar_(false);
    } else if (request.type === 'moveBar') {
        // Move iframe to a different part of the screen.
        this.barFrame_.classList.toggle('bottom');
    } else if (request.type === 'hideBar') {
        this.hideBar_();
        window.focus();
    } else if (request.type === 'toggleBar') {
        this.toggleBar_();
    }
};
xh.Bar.prototype.mouseMove_ = function(e) {
    if (this.currEl_ === e.toElement) {
        return;
    }
    this.currEl_ = e.toElement;
    if (e.shiftKey) {
        this.updateQueryAndBar_(this.currEl_);
    }
};
xh.Bar.prototype.keyDown_ = function(e) {
    var ctrlKey = e.ctrlKey || e.metaKey;
    var shiftKey = e.shiftKey;
    if (e.keyCode === xh.X_KEYCODE && ctrlKey && shiftKey) {
        this.toggleBar_();
    }
    // If the user just pressed Shift and they're not holding Ctrl, update query.
    // Note that we rely on the mousemove handler to have updated this.currEl_.
    // Also, note that checking e.shiftKey wouldn't work here, since Shift is the
    // key that triggered this event.
    if (!this.hidden_() && !ctrlKey && e.keyCode === xh.SHIFT_KEYCODE) {
        this.updateQueryAndBar_(this.currEl_);
    }
};
////////////////////////
// Initialization code//
////////////////////////
if (location.href.indexOf('acid3.acidtests.org') === -1) {
    window.xhBarInstance = new xh.Bar();
}