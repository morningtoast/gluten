		var Gluten = (function() {
			var settings = {
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
				if (settings.debug) { console.log("[Gluten] "+s); }
			}


			// #INIT
			var init = function(customBreaks) {
				if (customBreaks) { $.extend(settings.breaks, customBreaks); }

				settings.breaks      = helpers.sort(settings.breaks);
				settings.currentSize = window.innerWidth;
				settings.currentId   = helpers.getSizeId(settings.currentSize);

				$("html").addClass(settings.classPrefix+settings.currentId);

				debug("> Init");
				debug(". Landing size is "+settings.currentId+" ("+settings.currentSize+")");


				// Initialize window resize listener, passing oncomplete function
				windowResize.init(function(width) {
					var lastId           = settings.currentId;
					settings.currentSize = width;

					helpers.getSizeId(width);


					if (settings.currentId != lastId) {
						debug("! Window resized to "+settings.currentId+ " ("+width+")");

						if (settings.classPrefix) {
							$("html").removeClass(settings.classPrefix+lastId).addClass(settings.classPrefix+settings.currentId);
						}
						
						bind.refresh();
					} else {
						debug(". Window size didn't change ("+width+")");
					}
				});

			};


			var bind = {

				extend: function(rulesArray) {
					settings.rules = $.extend(settings.rules, rulesArray);
				},

		        refresh: function() {
		        	debug(". Refreshing bindings");
		            
		            bind.detach();
		            bind.attach(); // Passes existing rules for reattaching (size-specific only)
		        },

		        attach: function () {
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
	        						settings.detach.push({"selector":ruleObj.selector,"event":ruleObj.event}); 
	        					} else {
	        						settings.global.push(ruleObj.event);
	        					}
	        				} else {
	        					// Just a function
	        					ruleObj.event();
	        				}
	        			}		        		
		        	});
		        },

		        detach: function () {
		            $.each(settings.detach, function(k,data) {
		            	debug("- detaching "+data.event);
		                $(data.selector).off(data.action);
		            });

		            settings.detach = [];
		        }
			}


	        var windowResize = {
	            init: function (callback) {
	                windowResize.vars.complete = callback;
	                windowResize.event(window, "resize", windowResize.listener);
	            },

	            vars: {
			        check: new Date(1, 1, 2000, 12,0,0),
			        timeout: false,
			        timer: settings.resizeTimer,
			        complete: false
	            },

	            event: function (elem, type, eventHandle) {
	                if (elem === null || elem === undefined) {
	                    return;
	                }
	                if (elem.addEventListener) {
	                    elem.addEventListener(type, eventHandle, false);
	                } else if (elem.attachEvent) {
	                    elem.attachEvent("on"+type, eventHandle);
	                } else {
	                    elem["on"+type]=eventHandle;
	                }
	            },

	            listener: function () {
	                windowResize.vars.check = new Date();

	                if (windowResize.vars.timeout === false) {
	                    windowResize.vars.timeout = true;

	                    setTimeout(windowResize.complete, windowResize.vars.timer);
	                }
	            },

	            complete: function () {
	                if (new Date() - windowResize.vars.check < windowResize.vars.timer) {
	                    setTimeout(windowResize.complete, windowResize.vars.timer);
	                } else {
	                    windowResize.vars.timeout = false;

	                    if (typeof windowResize.vars.complete === "function") {
	                        windowResize.vars.complete(window.innerWidth);
	                    }
	                }
	            }
	        }			



			// #HELPERS
			var helpers = {
				sort: function(obj) {
				    var arr = [];
				    for (var prop in obj) {
				        if (obj.hasOwnProperty(prop)) {
				            arr.push({
				                "id": prop,
				                "max": obj[prop]
				            });
				        }
				    }
				    arr.sort(function(a, b) { return a.max - b.max; });
				    return(arr); // returns array
				    // http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
				},

				getSizeId: function(pixels) {
					for (a=0; a < settings.breaks.length; a+=1) {
						var thisSize = settings.breaks[a];
						var nextSize = settings.breaks[a+1];

						settings.currentId = thisSize.id;

						if (pixels < thisSize.max) {
							break;
						}
					}

					return(thisSize.id);
				},

				hasHandler: function (element, event) {
				    var ev = $._data(element, 'events');
				    return (ev && ev[event]) ? true : false;
				    // http://jsfiddle.net/44gxE/2/
				}


			}


			//  Public methods
		    return {
		        init: init,
		        rules: bind.extend,
		        refresh: bind.refresh,
		        size: settings.currentId
		    };
		}());
