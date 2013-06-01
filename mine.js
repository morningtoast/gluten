(function() {
    var root = this;

    // initialize Gluten
    var Gluten;

    // Export gluten if exports are available
    if(typeof exports !== 'undefined') {
        Gluten = exports;
    } else {
        Gluten = root.Gluten = {};
    }

    Gluten.VERSION = '0.0.1';

    // Allow Gluten to access jQuery
    Gluten.$ = window.jquery || window.$;

    // Initialize the settings object
    var settings = Gluten.settings = {
        debug: true,
        breaks: {
            small  : 560,
            medium : 760,
            large  : 1200
        },
        rules: [],
        detach: [],
        global: [],
        resizeTimer: 100,
        classPrefix: "screen-",
        currentSize: 0,
        currentId: "small"
    };

    var debug = function(s) {
        if (settings.debug) { console.log(s); }
    };

    var config = Gluten.config = function(breaks, cb) {

        /* Config Method 
         * @param object breaks
         * @param cb function (callback)
         * @return this
         * 
         * Method will take provided breakpoints and add it to the settings object
         * Method will also initialize the resize listener
         * */
        
        var settings = this.settings;

        // extend the current breaks with @param breaks
        if(breaks) { $.extend(settings.breaks, breaks); }

        settings.breaks = helpers.sort(settings.breaks);
        settings.currentSize = window.innerWidth;
        settings.currentId = helpers.getSizeId(settings.currentSize);

        $("html").addClass(settings.classPrefix+settings.currentId);

        debug("> Init");
        debug(". Landing size is "+settings.currentId+" ("+settings.currentSize+")");

        // initialize the resize listener
        windowResize.init(function(width) {
            var lastId = settings.currentId;
            settings.currentSize = width;

            helpers.getSizeId(width);

            if (settings.currentId !== lastId) {
                debug("\n! Window resized to "+settings.currentId+ " ("+width+")");

                if (settings.classPrefix) {
                    $("html").removeClass(settings.classPrefix+lastId).addClass(settings.classPrefix+settings.currentId);
                }

                binds.refresh();
            } else {
                debug(". Window size didn't change ("+width+")");
            }
        });

        // Fire callback if provided
        if(cb && typeof(cb) !== 'undefined') {
            cb.call(this);
        }

        return this;
    };


    // Binding methods
    var binds = Gluten.binds = {
        
        extend: function (rules) {
            var settings = this.settings;
            this.settings.rules = $.extend(settings.rules, rules);

            return this;
        },

        refresh: function (cb) {
            binds.detach();
            binds.attach();

            if(cb && typeof(cb) !== 'undefined') {
                cb.call(this);
            }

            return this;
        },

        attach: function () {
            var settings = Gluten.settings;

            $.each(settings.rules, function(k, ruleObj) {
                var allSizes = false;

                if (typeof ruleObj.sizes == "undefined") {
                    allSizes = true;
                }

                if (allSizes || (ruleObj.sizes.indexOf(settings.currentId) >= 0)) {
                    if (typeof ruleObj.selector !== "undefined") {

                        // A bind
                        
                        if (settings.global.indexOf(ruleObj.event) < 0) {
                            debug("+ attaching "+ruleObj.event+" ("+allSizes+")");
                            $(ruleObj.selector).on(ruleObj.event, ruleObj.live, ruleObj.callback);
                        }

                        if (!allSizes) { 
                            settings.detach.push({
                                    "selector":ruleObj.selector,
                                    "event":ruleObj.event
                            });

                        } else {
                            settings.global.push(ruleObj.event);
                        }
                    } else {
                        // Just a function
                        ruleObj.event();
                    }
                }		        		
            });

            return this;
        },
        
        detach: function () {
            $.each(settings.detach, function(k, data) {
                debug("- detaching "+data.event);
                $(data.selector).off(data.action);
            });

            settings.detach = [];
            
            return this;
        }
    };

    var windowResize = {
        init: function (cb) {
            windowResize.vars.complete = cb;
            windowResize.event(window, "resize", windowResize.listener);

            return this;
        },

        vars: {
            check: new Date(1, 1, 2000, 12, 0, 0),
            timeout: false,
            timer: settings.resizeTimer,
            complete: false
        },

        event: function (el, type, eventHandle) {
            if(el === null || el === undefined) {
                return;
            }

            if(el.addEventListener) {
                el.addEventListener(type, eventHandle, false);
            } else if (el.attachEvent) {
                el.attachEvent("on"+type, eventHandle);
            } else {
                el["on"+type]=eventHandle;
            }
        },

        listener: function () {
            windowResize.vars.check = new Date();

            if(windowResize.vars.timeout === false) {
                windowResize.vars.timeout = true;

                setTimeout(windowResize.complete, windowResize.vars.timer);
            }

            return this;
        },

        complete: function () {
            if(new Date() - windowResize.vars.check < windowResize.vars.timer) {
                setTimeout(windowResize.complete, windowResize.vars.timer);
            } else {
                windowResize.vars.timeout = false;

                if(typeof windowResize.vars.complete === "function") {
                    windowResize.vars.complete(window.innerWidth);
                }
            }

            return this;
        }
    };

    var helpers = {
        sort: function (obj) {
            var cache = [];
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    cache.push({
                        "id": prop,
                        "max": obj[prop]
                    });
                }
            }

            cache.sort(function(a,b) { return a.max - b.max; });

            return cache;
        },

        getSizeId: function(pixels) {
            var settings = Gluten.settings;

            for(a=0; a < settings.breaks.length; a+=1) {
                var thisSize = settings.breaks[a],
                    nextSize = settings.breaks[a+1];

                settings.currentId = thisSize.id;

                if(pixels < thisSize.max) {
                    break;
                }
            }

            return(thisSize.id);
        },

        hashHandler: function(el, event) {
            var ev = $._data(el, 'events');
            return (ev && ev[event]) ? true : false;
        }
    };

    Gluten.rules = binds.extend;
    Gluten.refresh = binds.refresh;


}).call(this);
