console.log('loadScript start');

window.loadScript = function(url, callback){
    var head = document.querySelector('head');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
};

console.log('loadScript end');
