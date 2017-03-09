var fullyLoaded = function(callback){
    window.onload = callback;
    setupPjax(callback);
};

var pjax = function(url, callback, selector) {
    var find = function(selector, context) {
        return (context || document).querySelector(selector);
    };
    
    var container = selector || '.body';
    
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.responseType = 'document';

    xhr.onload = function() {
        find('title').textContent = find('title', this.response).textContent;

        var newPage = find(container, this.response);
        var currentPage = find(container);
        currentPage.parentNode.replaceChild(newPage, currentPage);
    };

    xhr.send();

    if(typeof callback === 'function'){
        callback();
    }
};

var setupPjax = function(callback){
    if (history && history.pushState) {
        var pjaxLinks = document.querySelectorAll('.pjax-link');
        pjaxLinks.forEach(function(pjaxLink){
            pjaxLink.addEventListener('click', function(e){
                if(e.target.tagName.toLowerCase() === 'a'){
                    e.preventDefault();
                    pjax(e.target.href, callback);
                    history.pushState(null, null, e.target.href);
                }
            });
        });

        setTimeout(function() {
            window.onpopstate = function() {
                pjax(window.location.href, callback);
            };
        }, 1000);
    }
};
