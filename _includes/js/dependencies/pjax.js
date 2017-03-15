/**
 * This is my own version of pjax, written as a short version of the pjax libraries
 * in order to understand how it works
 */
window.pjax = {};

pjax.find = function(selector, context) {
    return (context || document).querySelector(selector);
};

pjax.container = '.body';
pjax.funQueue = {};

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
    
    xhr.addEventListener('load', function(e){
        var response = this.response;
        console.log(response);
        
        self.find('title').textContent = self.find('title', response).textContent;
        self.find('meta[name="description"]').setAttribute('content', self.find('meta[name="description"]', response).getAttribute('content'));

        var newPage = self.find(self.container, response);
        var currentPage = self.find(self.container);
        currentPage.parentNode.replaceChild(newPage, currentPage);

        var scripts = response.querySelectorAll(self.container + ' script');
        scripts.forEach(function(code){
            var script = document.createElement('script');
            script.text = code.textContent;
            document.head.appendChild(script).parentNode.removeChild(script);
        });
        
        if(typeof self.afterLoad === 'function'){
            self.afterLoad();
        }
    });

    xhr.send();

    return this;
};

pjax.execQueue = function(){
    var queue = pjax.funQueue;
    
    for(var funcName in queue){
        if(queue.hasOwnProperty(funcName)){
            if(typeof queue[funcName] === 'function'){
                try {
                    queue[funcName]();
                } catch(e) {
                    console.log(e);
                }
            }
        }
    }
    
    return this;
}

pjax.onload = function(callback, func){
    if(typeof callback === 'function'){
        pjax.funQueue[Object.keys(pjax.funQueue).length.toString()] = callback;
    }

    if((typeof callback === 'number' || typeof callback === 'string') && typeof func === 'function'){
        pjax.funQueue[callback] = func;
    }
    
    window.onload = this.execQueue;
    this.afterLoad = this.execQueue;
    
    return this;
};
