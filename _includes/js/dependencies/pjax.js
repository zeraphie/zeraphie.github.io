class PJAX {
    constructor(
        container = this.constructor.DEFAULT_CONTAINER,
        links = this.constructor.DEFAULT_LINKS,
        replace = this.constructor.DEFAULT_REPLACE
    ){
        this.container = container;
        this.links = links;
        this.replace = replace;
        this.queue = [];
        
        this.linkEvent = this.linkEvent.bind(this);
    }

    static get DEFAULT_CONTAINER(){
        return '.body';
    }

    static get DEFAULT_LINKS(){
        return '.pjax-link';
    }

    static get DEFAULT_REPLACE(){
        return {
            textContent: [
                'title'
            ],
            attribute: [
                {
                    selector: 'meta[name$="title"]',
                    attribute: 'content'
                },
                {
                    selector: 'meta[name$="description"]',
                    attribute: 'content'
                },
                {
                    selector: 'meta[property^="og:"]',
                    attribute: 'content'
                },
                {
                    selector: 'meta[property^="article:"]',
                    attribute: 'content'
                },
                {
                    selector: 'link[rel="canonical"]',
                    attribute: 'href'
                }
            ]
        }
    }

    setup(){
        if(history && history.pushState){
            this.addLinkEvent(document.querySelectorAll(this.links));

            window.onpopstate = () => {
                this.request(window.location.href);
            };

            this.execQueue();
        }

        return this;
    }

    addLinkEvent(pjaxLinks){
        pjaxLinks.forEach(pjaxLink => {
            pjaxLink.addEventListener('click', this.linkEvent, true);
        });

        return this;
    }

    linkEvent(e){
        let url = e.currentTarget.href;

        if(this.constructor.validPjaxLink(url)){
            e.stopPropagation();
            e.preventDefault();

            this.request(url);
            history.pushState(null, null, url);

            return false;
        }
    }

    static validPjaxLink(url){
        if(url.indexOf(window.location.origin) === -1){
            return false;
        }

        let fileRegex = new RegExp(/^.*\.([a-z0-9]+)$/i);

        if(fileRegex.test(url)){
            return false;
        }

        return true;
    }

    request(url){
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'document';

        xhr.addEventListener('load', e => {
            let response = e.currentTarget.response;

            for(let i = 0, len = this.replace.textContent.length; i < len; i++){
                let elements = document.querySelectorAll(
                    this.replace.textContent[i]
                );

                elements.forEach((element, key) => {
                    let found = response.querySelectorAll(
                        this.replace.textContent[i]
                    );

                    if(found.length && found[key]){
                        element.textContent = found[key].textContent;
                    }
                });
            }

            for(let i = 0, len = this.replace.attribute.length; i < len; i++){
                let elements = document.querySelectorAll(
                    this.replace.attribute[i].selector
                );

                elements.forEach((element, key) => {
                    let found = response.querySelectorAll(
                        this.replace.attribute[i].selector
                    );

                    if(found.length && found[key]){
                        element.setAttribute(
                            this.replace.attribute[i].attribute,
                            found[key].getAttribute(
                                this.replace.attribute[i].attribute
                            )
                        );
                    }
                });
            }

            let newPage = response.querySelector(this.container);

            let currentPage = document.querySelector(this.container);
            currentPage.parentNode.replaceChild(newPage, currentPage);

            this.addLinkEvent(document.querySelectorAll(
                `${this.container} ${this.links}`
            ));

            let scripts = document.querySelectorAll(
                `${this.container} script`
            );

            scripts.forEach(code => {
                let script = document.createElement('script');
                script.text = code.textContent;
                document.head.appendChild(script).parentNode.removeChild(script);
            });

            if(typeof this.afterLoad === 'function'){
                this.afterLoad();
            }
        });

        xhr.send();

        return this;
    }

    execQueue(){
        if(!(this.queue instanceof Array) || !this.queue.length){
            return this;
        }

        this.queue.forEach(func => {
            if(typeof func === 'function'){
                try {
                    func();
                } catch(e) {
                    console.log('Failed to execute: ', e, func);
                }
            }
        });

        return this;
    }

    onload(callback){
        if(typeof callback === 'function'){
            this.queue.push(callback);
        }

        window.onload = this.execQueue;
        this.afterLoad = this.execQueue;

        return this;
    }
}

window.pjax = new PJAX();
pjax.replace.textContent.push('h1');
