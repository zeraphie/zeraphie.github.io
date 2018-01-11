/*==============================================================================
 Transpiled version of the SitemapParser class from
 https://gist.github.com/zeraphie/2fda8a0cb1736df33602d7ddef0ae297
==============================================================================*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SitemapParser = function () {
    function SitemapParser(sitemap) {
        _classCallCheck(this, SitemapParser);

        this.sitemap = sitemap;
        this.links = [];
    }

    /**
     * Fetch the xml data from the sitemap page
     * 
     * @return {Promise}
     */


    _createClass(SitemapParser, [{
        key: 'fetchSitemap',
        value: function fetchSitemap() {
            return fetch(this.sitemap).then(function (data) {
                return data.text();
            });
        }

        /**
         * Get the JSON version of the sitemap
         * 
         * @return {Promise}
         */

    }, {
        key: 'jsonSitemap',
        value: function jsonSitemap() {
            var _this = this;

            return this.fetchSitemap().then(function (sitemap) {
                var parsed = new DOMParser().parseFromString(sitemap, 'text/xml');

                return _this.constructor.xmlToJson(parsed);
            });
        }

        /**
         * Parse all the urls in a json urlset
         * 
         * @param  {object} jsonData
         * @return {array}
         */

    }, {
        key: 'parseURLSet',
        value: function parseURLSet(jsonData) {
            var _this2 = this;

            if (!(jsonData.urlset.url instanceof Array) && !jsonData.urlset.url.length) {
                return this.links;
            }

            jsonData.urlset.url.forEach(function (url) {
                _this2.links.push(url.loc['#text']);
            });

            return this.links;
        }

        /**
         * Parse all the urls for sitemaps in a json sitemap index
         * 
         * @param  {object} jsonData
         * @return {array}
         */

    }, {
        key: 'parseSitemapIndex',
        value: function parseSitemapIndex(jsonData) {
            if (!(jsonData.sitemapindex.sitemap instanceof Array) && !jsonData.sitemapindex.sitemap.length) {
                return [];
            }

            var links = [];

            jsonData.sitemapindex.sitemap.forEach(function (url) {
                links.push(url.loc['#text']);
            });

            return links;
        }

        /**
         * Get all the links in all the sitemaps
         * 
         * @return {Promise}
         */

    }, {
        key: 'getLinks',
        value: function getLinks() {
            var _this3 = this;

            return this.jsonSitemap().then(function (xmlData) {
                // There can be a sitemap of sitemaps, wordpress's yoast seo does
                // this to cope with custom post types, so recursively get links
                if (typeof xmlData.sitemapindex !== 'undefined' && typeof xmlData.sitemapindex.sitemap !== 'undefined') {
                    var sitemaps = _this3.parseSitemapIndex(xmlData);

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = sitemaps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var sitemap = _step.value;

                            var parser = new SitemapParser(sitemap);

                            parser.getLinks.then(function (links) {
                                var _links;

                                (_links = _this3.links).push.apply(_links, _toConsumableArray(links));
                            });
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }

                // The urlset is what is wanted to get the links from, so if it
                // exists get them!
                if (typeof xmlData.urlset !== 'undefined' && typeof xmlData.urlset.url !== 'undefined') {
                    _this3.parseURLSet(xmlData);
                }

                return _this3.links;
            });
        }

        /**
         * Convert an xml string to a json object
         * 
         * @param  {string}  xml
         * @return {object}
         */

    }], [{
        key: 'xmlToJson',
        value: function xmlToJson(xml) {
            var jsonData = {};

            if (xml.nodeType === 1) {
                if (xml.attributes.length > 0) {
                    jsonData["@attributes"] = {};

                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        jsonData["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType === 3) {
                jsonData = xml.nodeValue;
            }

            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;

                    if (typeof jsonData[nodeName] === "undefined") {
                        jsonData[nodeName] = this.xmlToJson(item);
                    } else {
                        if (typeof jsonData[nodeName].push === "undefined") {
                            var old = jsonData[nodeName];
                            jsonData[nodeName] = [];
                            jsonData[nodeName].push(old);
                        }

                        jsonData[nodeName].push(this.xmlToJson(item));
                    }
                }
            }

            return jsonData;
        }
    }]);

    return SitemapParser;
}();

/*==============================================================================
 Config variables
==============================================================================*/
const cacheName = 'zeraphie-github-io-cache';
const dataCacheName = `data-${cacheName}`;

/*==============================================================================
 Files to cache
==============================================================================*/
let prefix = '';

let filesToCache = [
    `${prefix}/css/app.css`,
    `${prefix}/css/ui-experiment.css`,
];

/*==============================================================================
 On installing the service worker, open the cache and add all the files to the
 cache
==============================================================================*/
self.addEventListener('install', e => {
    console.log('[ServiceWorker] Install');

    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[ServiceWorker] Caching app shell');
         
            let sitemap = new SitemapParser('/sitemap.xml');
            
            return sitemap.getLinks().then(links => {
                console.log(links);
                
                return cache.addAll([...filesToCache, ...links]);
            });
        })
    );
});

/*==============================================================================
 On activating the service worker, remove old caches
==============================================================================*/
self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activate');

    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if(key !== cacheName && key !== dataCacheName){
                    console.log('[ServiceWorker] Removing old cache', key);

                    return caches.delete(key);
                }
            }));
        })
    );

    return self.clients.claim();
});

/*==============================================================================
 Use the cache then network strategy to load the resource
==============================================================================*/
self.addEventListener('fetch', e => {
    /*--------------------------------------
     Guard against extensions
    --------------------------------------*/
    if(e.request.url.indexOf(self.location.origin) === -1){
        return;
    }

    console.log('[ServiceWorker] Fetch', e.request.url);

    e.respondWith(
        caches.open(dataCacheName).then(cache => {
            return fetch(e.request).then(response => {
                cache.put(e.request.url, response.clone());

                return response;
            });
        })
    );
});
