/**
 * This is my own version of pjax, written as a short version of the pjax libraries
 * in order to understand how it works
 */
window.pjax = {};

pjax.find = function(selector, context) {
    return (context || document).querySelector(selector);
};

pjax.container = '.body';

pjax.setup = function(){
    var self = this;

    if (history && history.pushState) {
        var pjaxLinks = document.querySelectorAll('.pjax-link');
        pjaxLinks.forEach(function(pjaxLink){
            pjaxLink.addEventListener('click', function(e){
                if(e.target.tagName.toLowerCase() === 'a'){
                    e.preventDefault();
                    self.request(e.target.href);
                    history.pushState(null, null, e.target.href);
                }
            });
        });

        window.onpopstate = function() {
            self.request(window.location.href);
        };
    }

    return this;
};

pjax.request = function(url) {
    var self = this;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.responseType = 'document';

    xhr.onload = function() {
        self.find('title').textContent = self.find('title', this.response).textContent;

        var newPage = self.find(self.container, this.response);
        var currentPage = self.find(self.container);
        currentPage.parentNode.replaceChild(newPage, currentPage);

        if(typeof self.afterLoad === 'function'){
            self.afterLoad();
        }
    };

    xhr.send();

    return this;
};

pjax.onload = function(callback){
    var self = this;

    if(typeof callback === 'function'){
        window.onload = (function(old){
            function extendFunction(){
                if(typeof old === 'function'){
                    old();
                }
                callback();
            }
            
            return extendFunction;
        })(window.onload);

        self.afterLoad = (function(old){
            function extendFunction(){
                if(typeof old === 'function'){
                    old();
                }
                callback();
            }
            
            return extendFunction;
        })(self.afterLoad);
    }
};
