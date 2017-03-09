'use strict';

pjax.setup();

if (typeof NodeList.prototype.forEach === 'undefined') {
    /* Polyfill for nodelist foreach for ie11 */
    NodeList.prototype.forEach = function (callback, scope) {
        for (var i = 0; i < this.length; i++) {
            callback.call(scope, this[i], i); /* passes back stuff we need */
        }
    };
}

/* Cross browser friendly matches */
var matches = function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};

/* Get the dom element's children */
var getChildren = function getChildren(el, selector) {
    return [].some.call(el.children, function (e) {
        return matches(e, selector);
    });
};

/* Open and close the sidebar */
document.querySelector('.sidebar-toggle').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('.sidebar').classList.toggle('side-bar-closed');
    return false;
});

/* Open and close the navlinks */
var navlinks = document.querySelectorAll('.sidebar ul a');
navlinks.forEach(function (link) {
    /* Remove links that have children and add the class to the li wrapper */
    if (getChildren(link.parentNode, 'ul')) {
        link.parentNode.classList.add('has-children');
        link.setAttribute('tabindex', '-1');
    }
    
    link.addEventListener('click', function (e) {
        if (getChildren(link.parentNode, 'ul')) {
            e.preventDefault();
            link.parentNode.classList.toggle('active');
            link.parentNode.querySelectorAll('.active').forEach(function (active) {
                active.classList.toggle('active');
            });
            return false;
        }
    });
});

pjax.onload(function(){
    navlinks.forEach(function(link){
        link.addEventListener('click', function(e){
            if (!getChildren(link.parentNode, 'ul')) {
                navlinks.forEach(function(link){
                    link.parentNode.classList.remove('active');
                });
                navlinks.parentNode.classList.add('active');
            }
        });
    });
    
    /* Add data-title attribute for relevant items in table after parsing */
    var tables = document.querySelectorAll('.markdown table');
    tables.forEach(function (table) {
        var headers = table.querySelectorAll('thead th');
        var rows = table.querySelectorAll('tbody tr');
        rows.forEach(function (row) {
            var cells = row.querySelectorAll('td, th');
            cells.forEach(function (cell, index) {
                var header = headers[index];
                cell.setAttribute('data-title', header.innerText);
            });
        });
    });
});
