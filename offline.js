/*==============================================================================
 Transpiled version of the SitemapParser class from
 https://gist.github.com/zeraphie/2fda8a0cb1736df33602d7ddef0ae297
==============================================================================*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', fetch(this.sitemap).then(function (data) {
                                    return data.text();
                                }));

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function fetchSitemap() {
                return _ref.apply(this, arguments);
            }

            return fetchSitemap;
        }()

        /**
         * Get the JSON version of the sitemap
         *
         * @return {Promise}
         */

    }, {
        key: 'jsonSitemap',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var sitemap, parsed;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.fetchSitemap();

                            case 2:
                                sitemap = _context2.sent;
                                _context2.next = 5;
                                return new window.DOMParser().parseFromString(sitemap, 'text/xml');

                            case 5:
                                parsed = _context2.sent;
                                return _context2.abrupt('return', this.constructor.xmlToJson(parsed));

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function jsonSitemap() {
                return _ref2.apply(this, arguments);
            }

            return jsonSitemap;
        }()

        /**
         * Parse all the urls in a json urlset
         *
         * @param  {object} jsonData
         * @return {array}
         */

    }, {
        key: 'parseURLSet',
        value: function parseURLSet(jsonData) {
            var _this = this;

            if (!(jsonData.urlset.url instanceof Array) && !jsonData.urlset.url.length) {
                return this.links;
            }

            jsonData.urlset.url.forEach(function (url) {
                _this.links.push(url.loc['#text']);
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
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var xmlData, sitemaps, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _links, sitemap, parser, links;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.jsonSitemap();

                            case 2:
                                xmlData = _context3.sent;

                                if (!(typeof xmlData.sitemapindex !== 'undefined' && typeof xmlData.sitemapindex.sitemap !== 'undefined')) {
                                    _context3.next = 34;
                                    break;
                                }

                                sitemaps = this.parseSitemapIndex(xmlData);
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context3.prev = 8;
                                _iterator = sitemaps[Symbol.iterator]();

                            case 10:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context3.next = 20;
                                    break;
                                }

                                sitemap = _step.value;
                                parser = new SitemapParser(sitemap);
                                _context3.next = 15;
                                return parser.getLinks();

                            case 15:
                                links = _context3.sent;


                                (_links = this.links).push.apply(_links, _toConsumableArray(links));

                            case 17:
                                _iteratorNormalCompletion = true;
                                _context3.next = 10;
                                break;

                            case 20:
                                _context3.next = 26;
                                break;

                            case 22:
                                _context3.prev = 22;
                                _context3.t0 = _context3['catch'](8);
                                _didIteratorError = true;
                                _iteratorError = _context3.t0;

                            case 26:
                                _context3.prev = 26;
                                _context3.prev = 27;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 29:
                                _context3.prev = 29;

                                if (!_didIteratorError) {
                                    _context3.next = 32;
                                    break;
                                }

                                throw _iteratorError;

                            case 32:
                                return _context3.finish(29);

                            case 33:
                                return _context3.finish(26);

                            case 34:

                                // The urlset is what is wanted to get the links from, so if it exists
                                // get them!
                                if (typeof xmlData.urlset !== 'undefined' && typeof xmlData.urlset.url !== 'undefined') {
                                    this.parseURLSet(xmlData);
                                }

                                return _context3.abrupt('return', this.links);

                            case 36:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[8, 22, 26, 34], [27,, 29, 33]]);
            }));

            function getLinks() {
                return _ref3.apply(this, arguments);
            }

            return getLinks;
        }()

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

            if (xml.nodeType == 1) {
                if (xml.attributes.length > 0) {
                    jsonData["@attributes"] = {};

                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        jsonData["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType == 3) {
                jsonData = xml.nodeValue;
            }

            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;

                    if (typeof jsonData[nodeName] == "undefined") {
                        jsonData[nodeName] = this.xmlToJson(item);
                    } else {
                        if (typeof jsonData[nodeName].push == "undefined") {
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
//     `${prefix}/`,
    `${prefix}/css/app.css`,
    `${prefix}/css/ui-experiment.css`,
 
    // Cache all the pages on the site
//     `${prefix}/about`,
//     `${prefix}/style-guide/text`,
//     `${prefix}/style-guide/tables`,
//     `${prefix}/style-guide/lists`,
//     `${prefix}/style-guide/code`,
//     `${prefix}/personal-projects/pjax`,
//     `${prefix}/personal-projects/password-gen`,
//     `${prefix}/personal-projects/ui-experiment`,
//     `${prefix}/parody-lyrics/gloriole`,
//     `${prefix}/parody-lyrics/death-to-all-but-miqos`,
//     `${prefix}/parody-lyrics/17-explosions-in-a-row`,
//     `${prefix}/ffxiv-guides/ff14-overview`,
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
                
                return cache.addAll([filesToCache, ...links]);
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
