var MOVE_COOLDOWN_PERIOD_MS = 400;
var X_KEYCODE = 88;
// Global variables.
var initialized = false;
var queryEl = document.getElementById('query');
var resultsEl = document.getElementById('results');
var selectEl = document.getElementById('select');
var buttonEL = document.getElementById('submit');
// Used by handleMouseMove() to enforce a cooldown period on move.
var lastMoveTimeInMs = 0;
var evaluateQuery = function() {
    console.log("evaluateQuery");
    chrome.runtime.sendMessage({
        type: 'evaluate',
        query: queryEl.value
    });
};
var handleRequest = function(request, sender, cb) {
    // Note: Setting textarea's value and text node's nodeValue is XSS-safe.
    if (request.type === 'update') {
        if (request.query !== null) {
            queryEl.value = request.query;
        }
        if (request.results !== undefined) {
            resultsEl.value = request.results;
            // console.log(resultsEl.value);
        }
    }
};
var clk = function(request, sender, cb) {
    if (!initialized) {
        initialized = true;
        $(buttonEL).click(function() {
            $.ajax({
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                url: 'http://127.0.0.1:8000',
                method: 'POST',
                data: JSON.stringify({path : selectEl.value}),
                processData: false,
                success: function(response) {
                    console.log(response);
                    console.log("DATA SENT");
                },
                error: function(response) {
                    console.log(response);
                    console.log("Error");
                }
            });
            // ajaxSend(selectEl.value);
            // console.log(selectEl.value);
            return false;
        });
    }
};
var handleRequest_Select = function(request, sender, cb) {
    // Note: Setting textarea's value and text node's nodeValue is XSS-safe.
    // console.log("selectedQuery");
    if (request.type === 'update') {
        if (request.result !== undefined) {
            selectEl.value = request.result;
            // console.log(selectEl.value);
        }
    }
};
var handleMouseMove = function(e) {
    if (e.shiftKey) {
        // Only move bar if we aren't in the cooldown period. Note, the cooldown
        // duration should take CSS transition time into consideration.
        var timeInMs = new Date().getTime();
        if (timeInMs - lastMoveTimeInMs < MOVE_COOLDOWN_PERIOD_MS) {
            return;
        }
        lastMoveTimeInMs = timeInMs;
        // Tell content script to move iframe to a different part of the screen.
        chrome.runtime.sendMessage({
            type: 'moveBar'
        });
    }
};
var handleKeyDown = function(e) {
    var ctrlKey = e.ctrlKey || e.metaKey;
    var shiftKey = e.shiftKey;
    if (e.keyCode === X_KEYCODE && ctrlKey && shiftKey) {
        chrome.runtime.sendMessage({
            type: 'hideBar'
        });
    }
};
queryEl.addEventListener('keyup', evaluateQuery);
queryEl.addEventListener('mouseup', evaluateQuery);
// Add mousemove listener so we can detect Shift + mousemove inside iframe.
document.addEventListener('mousemove', handleMouseMove);
// Add keydown listener so we can detect Ctrl-Shift-X and tell the content
// script to hide iframe and steal focus.
document.addEventListener('keydown', handleKeyDown);
chrome.runtime.onMessage.addListener(handleRequest);
chrome.runtime.onMessage.addListener(handleRequest_Select);
chrome.runtime.onMessage.addListener(clk);