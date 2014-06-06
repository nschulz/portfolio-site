/**
 * 	Bind JavaScript
 *	www.BindJS.com
 * 	@author Nate Schulz
 * 	@version 
 * 	(140120.2357)
 *	(c) Copyright 2014 Nate Schulz, NSHoldings
 *  	All Rights Reserved.
**/

var BDBuildNumber = 140120.2357;
__BDStartTime = new Date().getTime();


/** BindJS **/


if (!window['console']) {
	window.console = { log: function() {} };
}

// output init info to console
if (BDBuildNumber != undefined) {
	console.log( "initalizing $B 5.0 (" + BDBuildNumber + ")" );
}

// Bind Compatibility Implimentation
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

var DEBUG_MODE			= false;

(function( window ) {

	'use strict';

	var iOS_DEVICE 			= false,
		iPAD_DEVICE			= false,
		ANDROID_DEVICE 		= false,
		SAFARI				= false,
		FIREFOX				= false,
		BLACKBERRY			= false,
		BLACKBERRY_WEBKIT	= false,
		MOUSE_INPUT	 		= true,
		TOUCHSCREEN			= false,
		BB_TOUCH			= false,

		CURRENT_SHEET		= null;
	
	/** Primary namespace for VeloJS framework */

	/** Setup Observer Events Namespace */
	window.kBEvents = {};

	/** Setup BDConstants Namespace */
	window.kB = {
		/** The desired framerate for animations */
		AnimationDesiredFPS: 60,
		/** The amount of time in milliseconds to spend on each frame of an animation */
		AnimationDesiredFrameDuration: (1000/60),
		/** Friction multiplier for animation deceleration */
		AnimationFrictionFactor: 0.95,

		/** Device appropriate event name for interaction began */
		InteractionBegan:     ((TOUCHSCREEN) ? "touchstart"  : "mousedown"),
		/** Device appropriate event name for interaction moved */
		InteractionMoved:     ((TOUCHSCREEN) ? "touchmove"   : "mousemove"),
		/** Device appropriate event name for interaction ended */
		InteractionEnded:     ((TOUCHSCREEN) ? "touchend"    : "mouseup"),
		/** Device appropriate event name for interaction cancelled */
		InteractionCancelled: ((TOUCHSCREEN) ? "touchcancel" : "mouseout"),
		
		InteractionOver:	"mouseover",
		
		InteractionOut:		"mouseout",

		/** 
			View Transition - New view slides in from right
			Default for BDNavigationController
		*/
		ViewTransitionPushLeft: 0,
		/** View Transition - New view slides in from bottom */
		ViewTransitionPushTop: 1,
		/** View Transition - New view slides in from right and previous views push into Z distance */
		ViewTransitionPushStack: 2,
		/** View Transition - New view slides in from Top */
		ViewTransitionPushBottom: 3,
		/** View Transition - New view slides in from Left */
		ViewTransitionPushRight: 4,
		/** View Transition - Page Turn */
		viewTransitionPageTurn: 5,
		/** View Transition - Tear off Up - Not Yet Implemented */
		ViewTransitionTearOff: 10,

		/** No image scaling */
		ViewScalingTypeNone: 0,
		/** Scale image to fit */
		ViewScalingTypeFit: 1,
		/** Scale image to fill view, maintaining aspect ratio */
		ViewScalingTypeFull: 2,
		/** Stretch image to fill view */
		ViewScalingTypeStretch: 3,

		/** View Autoresizing */
		ViewAutoresizeNone: 0,
		ViewAutoresizeLeftMargin: 0,
		ViewAutoresizeWidth: 1,
		ViewAutoresizeRightMargin: 2,
		ViewAutoresizeTopMargin: 3,
		ViewAutoresizeHeight: 4,
		ViewAutoresizeBottomMargin: 5,
		
		/** View vectors */
		ViewVectorCenter: 0,
		ViewVectorTop: 1,
		ViewVectorTopRight: 2,
		ViewVectorRight: 3,
		ViewVectorBottomRight: 4,
		ViewVectorBottom: 5,
		ViewVectorBottomLeft: 6,
		ViewVectorLeft: 7,
		ViewVectorTopLeft: 8,

		/** View Rect types */
		ViewLayoutTypeStandard: 0,
		ViewLayoutTypeMargins: 1,
			
		/** Transform Degrees to Radians */
		DegToRad: Math.PI / 180,
		/** Transform Radians to Degrees */
		RadToDeg: 180 / Math.PI,

		/** Widget Constants */
		DialogCloseButton: "BDDialogCloseButton",
		DialogCancelButton: "BDDialogCancelButton",
		DialogDoneButton:   2,
		
		/** Formatter Type - Default  */
		StringFormatDefault: 0,
		StringFormatText: 0,
		/** Formatter Type - Number   */
		StringFormatNumber: 1,
		/** Formatter Type - Currency */
		StringFormatCurrency: 2,
		/** Formatter Type - Date	  */
		StringFormatDate: 3,
		/** Formatter Type - Currency In Cents */
		StringFormatCurrencyInCents: 4,
		
		DateFormatShort: 0,
		DateFormatLong: 1,
		DateFormatMedium: 2,
		
		/** ObjectGroup notifications */
		ObjectGroupItemReceivedClick: 1,
		
		/** TabView TabSize */
		TabViewSizeRegular: 0,
		TabViewSizeNormal:  0,
		TabViewSizeSmall:   1,
		
		CSSTransitionEnd: 'webkitTransitionEnd'
	};

	
	/**
	 * $B Root Object
	 * @constructor
	 */
var Bind = function(attr) {
	return this.init(attr);
};
Bind.prototype = {
	displayName: "Bind",
	init: function( attr ) {
		this.browser = this.browserCheck();
		
		this.viewControllers = {};
		this.modules = {};
		this.classes = {};
		this.__DOMReady = false;
		this.__requestedIncludes = 0;
		this.__loadedIncludes = 0;
		this.__requestedIncludeURLs = [];
		this.__loadedIncludeURLs = [];
		this._preventTouchScrolling = false;
		this._EVENTS = {};
		this._EVENTCENTERS = {};
		this.format = 	{
							currency: 	{ symbol: "$", prefix: true, decimals: 2 },
							numbers: 	{ thousands: ",", decimal: "." },
							time: 		{ use24hr: false, pm: "pm", am: "am", leadingZero: false },
							date:		{ 'short': "YYYY-mm-dd" }
						};
		
		this._currentLanguage = (this.device.language() || 'en'); 
		this._defaultLanguage = 'en';
		this._currentFocus   = null;
		this._lastFocus		 = null;
		this._viewsByID = [];
		this._viewControllersByID = [];
		this._controlsByID = [];
		this._objectGroups = {};
		this.BDWindows = [];
		this.BDPanels  = [];
		this.BDHUDViews = [];
		this._eventHistory = [];
		this._pulldownMenus = [];
		this._currentNamespace = [];
		this._namespaces = {};
		this._currentBDViewTargetForNewViews = [];
		this._suspendAutoSubviews = false;
	//	this.eventCore = new BDEventCore(1000);
	//	this.eventCore.putOnDuty();
		this.clicksEnabled = true;
		this.initTime = new Date().getTime();
		this.currentAlert = "";
		this.currentDialog = "";
		this.currentCursorLocation = {x:0, y:0};
		this._currentPulldownMenu = null;
		this._currentWindowLevel = 0;
		this._panelWindowLevel = 500;
		this._baseWindowLevel = 10;
		this._dialogWindowLevel  = 800;
		this._controlPopupWindowLevel = 1000;
		this._debugMode = DEBUG_MODE;
		this.plugins = {};
		this._includedObjects = {};
		this._activePlugins = [];
		this._isListeningToKeyboard = false;
		this.__commandKeyDownTime = 0;
		this._propertiesDirectory = "properties/";
		this._properties = {};
		this.KEYSTATES = [];
		this.KEYSTATES[91] = 0; // Command Key
		this.KEYSTATES[77] = 0; // m key
		this.KEYSTATES[16] = 0; // shift key
		this.KEYSTATES[17] = 0; // ctrl key		
		this.KEYSTATES[27] = 0; // esc key
		this.KEYSTATES[13] = 0; // enter key
		
		
		for (var i in attr) this[i] = attr[i];
		
		var self = this;
		window.onresize = function() { self.resize(); };
		window.onorientationchange = function() {self.orientationChange();};
		
		return this;
	},
	vObjectDefDidLoad: function() {
		console.log("VobjectDefDidLoad");
		this._properties = BDObject.create();
	},
	initWithModules: function() {
		var self = this;
		setTimeout(function() {
			self.switchLanguage( $B.preferredLanguage() );	
		}, 150);
		
	},
	browserCheck: function() {
		var browser = { version: 0, chrome: false, tablet: false, explorer: false };
		// Version Extractor
		var re = new RegExp(/Version\/([0-9.]+)/i);
		var ua = navigator.userAgent;
		var r  = re.exec(ua);
		if (r == null) {
			re = new RegExp(/Chrome\/([0-9.]+)/i);
			r  = re.exec(ua);
			if (r != null) {
				browser.chrome = true;
			}
		}
		if (r != null && r[1] != undefined) {
			browser.version = r[1];
		}
		
		re = new RegExp(/WebKit/i);
		browser.webkit = re.test(ua);
		
		re = new RegExp(/Windows/i);
		browser.windows = re.test(ua);
		
		// iOS_DEVICE
		if((ua.match(/iPhone/i)) || (ua.match(/iPod/i)) || (ua.match(/iPad/i))) {
			iOS_DEVICE = true;
		}
		// iPAD_DEVICE
		if((ua.match(/iPad/i))) {
			iPAD_DEVICE = true;
			browser.tablet = true;

		}
		// ANDROID_DEVICE
		if((ua.match(/android/i))) {
			ANDROID_DEVICE = true;
		}
		// SAFARI
		if(!browser.chrome && (ua.match(/safari/i))) {
			SAFARI = true;
		}
		// FIREFOX
		if ((ua.match(/firefox/i))) {
			FIREFOX = true;
		}
		// BLACKBERRY
		if ((ua.match(/blackberry/i))) {
			BLACKBERRY = true;
			if (new RegExp(/blackberry95/i).test(ua) || // Storm 1 and 2
				new RegExp(/blackberry 98/i).test(ua) ) { // Torch
				BB_TOUCH = true;
				TOUCHSCREEN = true;
			}
			if (new RegExp(/playbook/i).test(ua)) { //PlayBook tablet
				BB_TOUCH = true;
				TOUCHSCREEN = true;
				browser.tablet = true;
			}

		}
		
		if (!BLACKBERRY) {
			TOUCHSCREEN = (('ontouchstart' in document.documentElement) || iOS_DEVICE);
			MOUSE_INPUT = !TOUCHSCREEN;
		}
		
		if ((ua.match(/msie/i))) {
			browser.explorer = true;
			var rv = -1; // Return value assumes failure.
			re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
			if (rv != 0) browser.version = rv;
		}
		
		browser.versionAsNumber = parseFloat(browser.version);
		browser.iOS = iOS_DEVICE;
		browser.iPad = iPAD_DEVICE;
		browser.android = ANDROID_DEVICE;
		browser.safari = ((iOS_DEVICE || SAFARI) && !ANDROID_DEVICE);
		browser.blackberry = BLACKBERRY;
		browser.touchscreen = TOUCHSCREEN;
		browser.mousedriven = MOUSE_INPUT;
		browser.firefox = FIREFOX;
		return browser;
	},
	device: {
		isWebKit: function() {
			return $B.browser.webkit;
		},
		isiOS: function() {
			return $B.browser.iOS;
		},
		isAndroid: function() {
			return (navigator.userAgent.match(/android/i));
		},
		isAndroid4: function() {
			return ($B.device.isAndroid() && (navigator.userAgent.match(/4\.0/)));	
		},
		isTouchEnabled: function() {
			return $B.browser.touchscreen;
		},
		isPointerDriven: function() {
			return $B.browser.mousedriven;
		},
		isFirefox: function() {
			return $B.browser.firefox;
		},
		isChrome: function() {
			return $B.browser.chrome;
		},
		isBlackberry: function() {
			return $B.browser.blackberry;
		},
		isTablet: function() {
			return $B.browser.tablet;
		},
		isSafari: function() {
			return $B.browser.safari;
		},
		isWindows: function() {
			return $B.browser.windows;
		},
		isiPad: function() {
			return $B.browser.iPad;
		},
		isiPhone: function() {
			return ($B.browser.iOS && !$B.browser.iPad);
		},
		isIE: function() {
			return $B.browser.explorer;
		},
		isIE9: function() {
			return ($B.browser.explorer && $B.browser.versionAsNumber >= 9);
		},
		supportsHardwareAcceleration: function() {
			return ($B.browser.iOS || ($B.browser.safari && !$B.browser.windows) || $B.device.isAndroid4());
		},
		supportsNativeScrolling: function() {
			return ($B.browser.iOS && (navigator.userAgent.match("OS 5")));
		},
		screenWidth: function() {
			return window.innerWidth;
		},
		screenHeight: function() {
			return window.innerHeight;
		},
		orientation: function() {
			return window.orientation;
		},
		orientationIsLandscape: function() {
			return (window.orientation == 90 || window.orientation == -90);
		},
		isHighRes: function() {
			if( window.devicePixelRatio >= 2 ) return true;
			return false;
		},
		language: function() {
			if (navigator['userLanguage']) {
				return (navigator.userLanguage.split('-')[0]).toLowerCase();
			}
			return (navigator.language.split('-')[0]).toLowerCase();
		},
		country: function() {
			if (navigator['userLanguage']) {
				return (navigator.userLanguage.split('-')[1]).toUpperCase();
			}
			return (navigator.language.split('-')[1]).toUpperCase();
		},
		locale: function() {
			return $B.device.language() + "_" + $B.device.country();
		}
	},
	setPropertiesDirectory: function(p) {
		this._propertiesDirectory = p;
	},
	propertiesDirectory: function() {
		return this._propertiesDirectory;
	},
	kitResource: function( resource ) {
		return "BDStyles/resources/"+resource;
	},
	beginKeyboardListening: function() {
		if (!this._isListeningToKeyboard) {
			var self = this;
			window.addEventListener("keydown", function( e ) {
				var evt = (e) ? e: (window.event) ? window.event: null;
				if (evt) {
					var key = (evt.charCode) ? evt.charCode:
					((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
					self.KEYSTATES[evt.keyCode] = true;
				}
				self.checkKeyStatesForAction(evt.keyCode, evt);

			}, false);
			window.addEventListener("keyup", function( e ) {
				var evt = (e) ? e: (window.event) ? window.event: null;
				if (evt) {
					var key = (evt.charCode) ? evt.charCode:
					((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
					self.KEYSTATES[evt.keyCode] = false;
				}				
			}, false);
			this._isListeningToKeyboard = true;
		}
		return this._isListeningToKeyboard;
	},
	checkKeyStatesForAction: function( lastKeyCode, evt ) {
		var ks = this.KEYSTATES;
		if (lastKeyCode == 91 || lastKeyCode == 17) this.__commandKeyDownTime = NOW();

		if ((NOW() - this.__commandKeyDownTime ) > 1000) return;

		if ((ks[91] || ks[17]) && ks[82]) {
			$B.dispatchEvent("willReloadPage", { type: "reload", message: "User Requested Reload" });
			if (this._beforeUnload()) {
				window.location.reload();
			};
			ks[82] = 0;
		} else if ((ks[91] || ks[17]) && ks[83]) {
			$B.dispatchEvent("BDKeystroke:save", evt);
			ks[91] = 0;
			ks[17] = 0;
			ks[83] = 0;
		}
	},
	preventNativeMouseWheel: function() {
		document.addEventListener('mousewheel', function( evt ) {
			if (evt.__enableScroll == undefined || evt.__enableScroll == false) {
				evt.preventDefault();
			}
		}, false);
	},
	hideMobileAddressBar: function() {
		setTimeout(function() {window.scrollTo(0,1);},100);
	},
	_beforeUnload: function() {
		return true;
	},
	/** 
	  * Looks up and returns a view from array by ID
	  *	@returns BDView
	  * @param {String} id
	  */
	getView: function( id )
	{
		return this.viewFromID( id );
	},
	setPropertyValueWithNameAndLocale: function( v, n, l ) {
		return this._properties.setValueWithPropertyPath( v, l, n );
	},
	propertyValueWithNameAndLocale: function( n, l ) {
		return this._properties.valueWithPropertyPath( l, n );
	},
	localizedValueForProperty: function( _p ) {
		var l = $B.currentLanguage();
		var _v = this._properties.valueWithPropertyPath( l, _p );
		if (_v) return _v;
		_v = this._properties.valueWithPropertyPath( -1, _p );
		return _v;
	},
	localize: function( s ) {
		if (typeof s == "string" && s.substr(0,9) == "string://") {
			return $B.localizedValueForProperty(s.substr(9));
		}
	
		var c = null;
		if (typeof s != "object") {
			c = {};
			c[$B.currentLanguage()] = s;
			s = c;
		}
		c = s[$B.currentLanguage()];
		if (!c) {
			for (var i in s) {
				c = s[i];
				break;
			}
		}
		return c;

	},
	/**
	  * Used for localization. Switching the active language of the entire interface
	  * @param {String} language id
	  */
	switchLanguage: function(language) 
	{
		language = language.toLowerCase();
		$B.dispatchEvent("$B:willSwitchLanguage", language);
		$B.ajax( {url: $B.propertiesDirectory()+"Properties_"+language+".json", 
					onComplete: function(data) {
						try {
							var propData = $B.JSON.decode(data);
							for (var i in propData) {
								var _o = BDObject.objectWithObject(propData[i]);
								$B._properties.setValueOfProperty( _o, i );
							}
						} catch (E) {
							console.log("$B:switchLanguage: no localized properties file found for language: "+language);
						}				
						$B.lastLanguage    = $B._currentLanguage;
						$B._currentLanguage = language;
// 						var BDViews = self.allBDObjects();
// 						for (var i = 0, len = BDViews.length; i<len; i++) {
// 							if (DEBUG_MODE) console.log("$B:switchLanguage:"+BDViews[i].identify());
// 							try {
// 								BDViews[i].switchLanguage($B._currentLanguage);
// 							} catch (E) {
// 								console.log("error while switching BDView language on view: "+BDViews[i].identify());
// 								console.log(BDViews[i]);
// 								console.log(E);
// 							}
// 						}
						if ($B.Hibernate) {
							$B.Hibernate.setValueForKey($B._currentLanguage, "BDKBDP:preferredLanguage");
						}
// 						delete BDViews;
						$B.dispatchEvent("$B:didSwitchLanguage", language);
					}
				}
			);
	},
	preferredLanguage: function() {
		if (this.Hibernate) { 
			var cd = this.Hibernate.valueForKey("BDKVP:preferredLanguage");
			if (cd != null && cd != undefined) return cd;
		}
		
		return this.device.language();
	},
	/**
	  * Accessor for the default language variable
	  */
	defaultLanguage: function()
	{
		return this._defaultLanguage;
	},
	/**
	  * Accessor for the current language variable
	  */
	currentLanguage: function()
	{
		return this._currentLanguage;
	},
	/**
	  * Dismisses the current sheet if there is a sheet showing
	  */
	dismissCurrentSheet: function()
	{
		if (CURRENT_SHEET != null) CURRENT_SHEET.dismiss();
	},
	/**
	  * @return {int} time in ms since $B initialization
	  */
	getSessionTime: function() 
	{
		return new Date().getTime() - this.initTime;
	},
	/**
	  * enables real-time tracking of cursor location and stores it
	  * to {BDPoint} currentCursorLocation
	  */
	enableCursorTracking: function() {
		var self = this;
		window.addEventListener("mousemove", function( evt ) {
			self.currentCursorLocation.x = evt.pageX;
			self.currentCursorLocation.y = evt.pageY;
		}, false );
	},
	registerViewController: function( vc ) {
		if (vc.id == undefined) return;
		
		if (this.currentNamespace() != null) {
			this.namespace( this.currentNamespace() )._viewControllersByID[vc.id] = vc;
		} else {
			this._viewControllersByID[ vc.id ] = vc;	
		}
		if ( DEBUG_MODE ) console.log(" $B: Registered new "+vc.BDType+" as "+vc.id );
		if (this._preventTouchScrolling) {
			vc.view().getElem().addEventListener( kB.InteractionMoved, function( evt ) {
				evt.preventDefault();
			}, false );
		}
		return vc;
	},
	/**
	  * registers a view with the $B to enable lookup at a later time
	  * all views register by default
	  * @param {BDView} View
	  */
	registerView: function( view ) 
	{
		if (view.id == undefined) return;
		var exists = false;
		for (var i in this._viewsByID) {
			if (i == view.id && this._viewsByID[i] != null) {
				exists = true;
				this._viewsByID[i] = null;
				if (DEBUG_MODE) console.log("$B: DUPLICATE BDIEW ID: "+view.id);
				break;
			}
		}
		if (this.currentNamespace() != null) {
			this.namespace( this.currentNamespace() )._viewsByID[view.id] = view;
		} else {
			this._viewsByID[ view.id ] = view;	
		}
		
		if (view.identifyType != undefined && view.identifyType() == "BDHUDView") this.BDHUDViews.push(view);
		if (view.identifyType != undefined && (view.identifyType() == "BDWindow" || view.identifyType() == "BDHUDView" || view.identifyType() == "BDSheet")) {
			if (view.isPanel == true ) {
				this.BDPanels.push(view);
			} else {
				this.BDWindows.push(view);
			}
		}
		if ( DEBUG_MODE ) console.log(" $B: Registered new "+view.BDType+" as "+view.id );
		if (this._preventTouchScrolling) {
			view.getElem().addEventListener( kB.InteractionMoved, function( evt ) {
				evt.preventDefault();
			}, false );
		}
	},
	/**
	 * adds eventListener to window
	 * that prevents default on touchmove
	 */
	preventTouchScrolling: function() {
		//this._preventTouchScrolling = true;
		// switched from window 6.19
		document.body.addEventListener('touchmove', function(evt) {
			evt.preventDefault();
		}, false);
	},
	preventDefaultScrolling: function() {
		document.body.addEventListener('mousewheel', function(evt) {
			evt.preventDefault();
		}, false);	
	},
	/**
	 * Part of BDWindow management - brings a window to
	 * front and gives it focus
	 * @param  {BDWindow} theWindow window to be made key
	 */
	makeKeyWindow: function( theWindow )
	{
		if (theWindow.isPanel == true || 
			theWindow.windowLevel == kB.WindowLevelDialog ||
			theWindow.windowLevel == kB.WindowLevelPanel) {
				return;
		}

		var windowIndex = this.getLevelOfWindow( theWindow );

		// Check that the window is NOT currently the key window
		if ( this.BDWindows[windowIndex] != undefined && windowIndex < (this.BDWindows.length-1)) {
			var tempWindow = this.BDWindows[windowIndex];
			this.BDWindows.splice(windowIndex, 1);
			this.BDWindows.push( tempWindow );
// 			console.log("Making " + tempWindow.id + " key window at level "+this._currentWindowLevel);
			this.updateWindowLevels( windowIndex );
		} else {
			this.updateWindowLevels( windowIndex );
		}
		//tempWindow.setWindowLevel(this.currentWindowLevel);
	},
	/**
	 * close a window
	 * @param  {BDWindow} theWindow BDWindow to be closed
	 */
	orderWindowOut: function( theWindow )
	{
		if (theWindow.isPanel == true) return;
		var windowIndex = this.getLevelOfWindow( theWindow );
		if (windowIndex >= 0) {
			this.BDWindows.splice(windowIndex, 1);
			this.updateWindowLevels( windowIndex );		
		}
	},
	/**
	 * returns level of window in window stack
	 * @param  {BDWindow} theWindow BDWindow object in question
	 * @return {int} zIndex
	 */
	getLevelOfWindow: function( theWindow )
	{
		var windowIndex = -1;
		for (var i = this.BDWindows.length-1; i >= 0; i--) {
			if ( this.BDWindows[i].id == theWindow.id ) {
				windowIndex = i;
				break;
			}
		}
		return windowIndex;
	},
	updateWindowLevels: function(startIndex)
	{
		if (startIndex == undefined) startIndex = 0;
		//console.log("WindowLevels Update:");
		for (var i = 0; i < this.BDWindows.length; i++) {
			this.BDWindows[i].releaseKeyState();
			if (this.BDWindows[i].windowLevel == kB.WindowLevelCustom
				|| this.BDWindows[i].windowLevel == kB.WindowLevelBackground) continue;
			this.BDWindows[i].setWindowLevel(i+this._baseWindowLevel);
			//console.log(i+": "+this.BDWindows[i].id);
		}
		if (this.BDWindows[this.BDWindows.length-1]) this.BDWindows[this.BDWindows.length-1].takeKeyState();
		this._currentWindowLevel = (this.BDWindows.length-1);
		if ( this._currentWindowLevel > this._panelWindowLevel ) {
			this._panelWindowLevel = this._currentWindowLevel + 5;
			for ( i = 0; i < this.BDPanels.length; i++ ) {
				this.BDPanels[i].setWindowLevel( this._panelWindowLevel+this._baseWindowLevel );
			}				
		}

	},
	/**
	 * item Groups implemented for certain elements like
	 * radio buttons and segmented controls
	 * @param {BDView} view    the view/control to add to the group
	 * @param {String} groupId group id as string
	 */
	addItemToGroupWithId: function( view, groupId ) {
		if (this._objectGroups[groupId] == undefined) this._objectGroups[groupId] = [];
		this._objectGroups[groupId].push( view );
	},
	/**
	 * returns items in groupId as array
	 * @param  {String} id string id of itemgroup
	 * @return {BDViews}
	 */
	itemsInGroupWithId: function( id ) {
		return this._objectGroups[id];
	},
	/**
	  * @return {int} zIndex for panel Windows
	  */
	panelWindowLevel: function()
	{
		return this._panelWindowLevel;	
	},
	/**
	  * @return {int} zIndex of current key window
	  */
	currentWindowLevel: function()
	{
		return this._currentWindowLevel;
	},
	/**
	  * @return {int} zIndex of popup control windows
	  */
	controlPopupWindowLevel: function()
	{
		return this._controlPopupWindowLevel;
	},
	/**
	  * @return {int} zIndex appropriate for a dialog window
	  */
	dialogWindowLevel: function()
	{
		return this._dialogWindowLevel;
	},
	/**
	  * @param {string} id of view to retrieve from memory
	  * @return {BDView} the view
	  */
	viewFromID: function( id ) 
	{
		return this._viewsByID[ id ];
	},
	/**
	  * registers a BDControl with the $B to enable lookup at a later time
	  * all controls register themselves by default
	  * @param {BDControl} aControl
	  */
	registerControl: function( widget ) 
	{
		if (widget.id == undefined) return;

		this._controlsByID[ widget.id ] = widget;
		if ( DEBUG_MODE ) console.log("$B: Registered new "+widget.BDType+" as "+widget.id);
	},
	/**
	  * registers a BDPulldownMenu with the $B to enable lookup at a later time
	  * all BDPulldownMenus register themselves by default
	  * @param {BDPulldownMenu} aPulldownMenu
	  * @return aPulldownMenu
	  */
	registerPulldownMenu: function( select ) 
	{
		select.pulldownMenuIndex = this._pulldownMenus.length;
		this._pulldownMenus.push(select);
		return select.pulldownMenuIndex;
	},
	/**
	  * @param {string} id of control to retrieve from memory
	  * @return {BDControl} theControl
	  */
	controlFromID: function( id ) 
	{
		return this._controlsByID[ id ];
	},
	namespace: function( ns ) {
		return this._namespaces[ns];
	},
	renameNamespace: function( ns, nns ) {
		this._namespaces[nns] = this._namespaces[ns];
		delete this._namespaces[ns];
	},
	currentNamespace: function() {
		if (this._currentNamespace[0] == undefined) return null;
		return this._currentNamespace[0];	
	},
	beginNamespace: function( ns ) {
		this._currentNamespace.unshift(ns);
		if (this._namespaces[ns] == undefined) this._namespaces[ns] = { _viewsByID: {}, _controlsByID: {}, _viewControllersByID: {} };
		if ( DEBUG_MODE ) console.log("$B:beginNamespace "+ns);
	},
	endNamespace: function( ns ) {
		var ns = this._currentNamespace.shift();
		if ( DEBUG_MODE ) console.log("$B:endNamespace "+ns);
	},
	destroyNamespace: function( ns ) {
		if (this.namespace( ns )) {
			var v = this._namespaces[ns]._viewsByID;
			var c = this._namespaces[ns]._controlsByID;
			var vc = this._namespaces[ns]._viewControllersByID;
			for (var i in v) {
				v[i].destroy();
			}
			for (i in c) c[i].destroy();
			for (i in vc) vc[i].destroy();
			delete this._namespaces[ns];
		}
	},
	/**
	  * @param {BOOL} setInteractive
	  * Enables/Disables all controls in the interface
	  * @deprecated
	  */
	setInteractive: function( mode ) 
	{
		if ( mode ) {
			for ( var i in this._controlsByID ) this._controlsByID[ i ].enable();
		} else {
			for ( var i in this._controlsByID ) this._controlsByID[ i ].disable();
		}
	},
	/**
	  * closes any and all open HUD Windows
	  */
	closeAllHUDViews: function() 
	{
		for (var i=0; i < this.BDHUDViews.length; i++) {
			this.BDHUDViews[i].orderOut();
		}
		this.BDHUDViews = [];
	},
	/**
	  * closes any and all open PulldownMenu Windows
	  */
	closeAllPulldownMenus: function() 
	{
		for (var i=0, len=this._pulldownMenus.length; i<len; i++) {
			if (this._pulldownMenus[i] != null && this._pulldownMenus[i] != undefined)
				this._pulldownMenus[i].close();
		}
		this._currentPulldownMenu = null;
	},
	destroyViewController: function( vc ) {
		try {
			if (vc.namespace != null) {
				delete this.namespace(vc.namespace)._viewControllersByID[vc.id];
			} else {
				delete this._viewControllersByID[vc.id];
			}
			if (DEBUG_MODE) console.log( "$B:destroyViewController: "+vc.id );
		} catch (E) {
			if (DEBUG_MODE) console.log( "CATCH: $B:destroyViewController:"+vc.id+" :"+E.message );
		}		
	},
	/**
	  * @param {string} id - id of the view to hide and remove from memory
	  */
	destroyView: function( view ) 
	{
		try {
			if (view.namespace != null) {
				delete this.namespace(view.namespace)._viewsByID[view.id];
			} else {
				delete this._viewsByID[view.id];
			}
			if (DEBUG_MODE) console.log( "$B:destroyView: "+view.id );
		} catch (E) {
			if (DEBUG_MODE) console.log( "CATCH: $B:destroyView:"+view.id+" :"+E.message );
		}		
	},
	/**
	  * @param {string} id - id of the control to hide and remove from memory
	  */
	destroyControl: function( id ) 
	{
		if ( typeof id == "object" ) {
			id = id.id;
		}
		try {
			//wIndex = this._controlsByID[id].controlIndex;
			this._controlsByID[id] = null;
			this._controlsByID.splice(id,1);
			//this._controls.splice( wIndex, 1 );
			//delete wIndex;
			if (DEBUG_MODE) console.log( "$B:destroyControl: "+id );
		} catch (E) {
			if (DEBUG_MODE) console.log( "CATCH: $B:destroyControl:"+id+" :"+E.message );
		}
	},
	/**
	  * @param {string} id - id of the BDPulldownMenu to hide and remove from memory
	  */
	destroyPulldownMenu: function( s ) 
	{
		this._pulldownMenus[s.pulldownMenuIndex] = null;
	},
	/**
	  * Outputs the last 5 controls in $B to console
	  * and returns string with count of controls
	  * @param {int} number of controls to list
	  */
	tailControls: function(n) 
	{
		if (n == undefined) n=5;
		for (var i=0; i<n; i++ ) console.log(this._controls[this._controls.length-1-i].id);
		return n + " of "+this._controls.length+" widgets";
	},
	/**
	  * Outputs the last 5 views in $B to console
	  * and returns string with count of views
	  * @param {int} number of controls to list
	  */
	tailViews: function(n) 
	{
		if (n == undefined) n=5;
		for (var i=0; i<n; i++ ) console.log(this._views[this._views.length-1-i].id);
		return n + " of "+this._views.length+" views";
	},
	/**
	 * scans all loaded views and returns a list of their types
	 * @return {[type]}
	 */
	loadedViewTypes: function()
	{
		var av = this.allBDObjects();
		var types = [];
		types.contains = function( str ) {
			for (var j in this) {
				if (this[j] == str) return true;
			}
			return false;
		}
		for (var i = 0, len=av.length; i<len; i++) {
			if (av[i] == null || av[i].identifyType == undefined) continue;
			if (!types.contains(av[i].identifyType())) {
				types.push( av[i].identifyType() );
			}
		}
		return types;
	},
	/**
	  * @return {array} array of all views registered with $B
	  */
	allViews: function() {
		var views = [];
		for (var i in this._viewsByID) {
			views.push( this._viewsByID[i] );
		}
		for (i in this._namespaces) {
			for (var j in this._namespaces[i]._viewsByID) {
				views.push(this._namespaces[i]._viewsByID[j]);
			}
		}
		return views;
	},
	/**
	  * @return {array} array of all BDViews and BDControls registered with $B
	  */
	allBDObjects: function() {
		var objs = this.allViews();
		for ( var i in this._controlsByID) {
			objs.push( this._controlsByID[i] );
		}
		return objs;
	},
	resize: function() 
	{
		this.dispatchEvent("BDDevice:windowDidResize", { height: window.innerHeight, width: window.innerWidth } );
	},
	orientationChange: function(evt) {
		this.dispatchEvent("BDDevice:didRotateToInterfaceOrientation", window.orientation );
	},
	mousemove: function(evt) 
	{
		evt = (evt) ? evt: ( window.event ) ? window.event: null;
		if ( !evt ) return 0;
		var c = { x: 0, y: 0 };
		if ( evt.pageX || evt.pageY ) {
			c.x = evt.pageX;
			c.y = evt.pageY;
		} else {
			var doc = document.documentElement;
			var body = document.body;
			c.x = evt.clientX + ( doc.scrollLeft || body.scrollLeft ) - ( doc.clientLeft || 0 );
			c.y = evt.clientY + ( doc.scrollTop || body.scrollTop ) - ( doc.clientTop || 0 );
		}
		this.currentCursorLocation = c;
	},
	/**
	  * @return {BDPoint} currentCursorLocation if tracking is enabled
	  */
	getCurrentCursorLocation: function() 
	{
		return this.currentCursorLocation;
	},
	currentFocus: function( obj ) 
	{
		if ( obj === undefined ) return this._currentFocus;
		this._lastFocus = this._currentFocus;
		this._currentFocus = obj;
		if (this._lastFocus && typeof this._lastFocus.releaseFocus === "function") {
			this._lastFocus.releaseFocus();
		}
		return this._currentFocus;
	},
	popFocus: function() 
	{
		this.currentFocus( this._lastFocus );
	},
	/**
	 * creates the default BDEventCenter
	 */
	_createDefaultEventCenter: function() {
		this.createEventCenter();
	},
	/**
	 * used by event centers to delegate events to other/new event centers
	 * @param  {string} name [description]
	 * @return {BDEventCenter} anEventCenter
	 */
	createEventCenter: function( name ) {
		if (name == undefined) name = "default";
		if (this._EVENTCENTERS[name] != undefined) return this._EVENTCENTERS[name];
		this._EVENTCENTERS[name] = this.EventCenter.create({ id: name+"EventCenter", scope: name });
		return this._EVENTCENTERS[name];
	},
	/**
	 * creates a placeholder event hook (DEPRECATED)
	 * @see attachEventHook or dispatchEvent
	 * @param  {String} event [description]
	 */
	registerEventHook: function ( event ) {
		var evt = this._parseEventString( event );
		if (this._EVENTCENTERS[evt[0]] == undefined) this.createEventCenter( evt[0] );
		this._EVENTCENTERS[evt[0]].registerEventHook( evt[1] );
		//if (this._EVENTS[ event ] == undefined) this._EVENTS[ event ] = [];
	},
	/**
	 * attaches an action to an BDEvent
	 * @param  {String} event  event identifier to attach to
	 * @param  {Function} action function to execute on event
	 */
	attachEventHook: function( event, action ) {
		var evt = this._parseEventString( event );
		if (this._EVENTCENTERS[evt[0]] == undefined) this.createEventCenter( evt[0] );
		return this._EVENTCENTERS[evt[0]].attachEventHook( evt[1], action, event );
	},
	/**
	 * removes an action associated with an event
	 * @param  {BDEventHook} eh the eventhook object passed to the action
	 */
	removeEventHook: function( eh ) {
		if (eh == undefined || eh.hook == undefined) return false;
		if (eh.hook == null) return false;
		
		var evt = this._parseEventString( eh.hook );
		var eventCenterName = evt.shift();
		eh.hook = evt.join(":");
		
		if (this._EVENTCENTERS[eventCenterName] == undefined) return;
		this._EVENTCENTERS[eventCenterName].removeEventHook( eh );
	},
	/**
	 * triggers an event notification
	 * @param  {String} event  event identifier
	 * @param  {Mixed} params usually an object with parameters
	 */
	dispatchEvent: function ( event, params ) {
		var evt = this._parseEventString( event );
		if (this._EVENTCENTERS[evt[0]] == undefined) return;
		this._EVENTCENTERS[evt[0]].dispatchEvent( evt[1], params );
	},
	/**
	 * synonym for dispatchEvent
	 * @see dispatchEvent
	 */
	dispatchNotification: function ( event, params ) {
		this.dispatchEvent( event, params );
	},
	/**
	 * dispatches an event after a specified delay
	 * @param  {String} event  event identifier
	 * @param  {Mixed} params usually an object
	 * @param  {int} delay  delay time in ms
	 */
	dispatchEventAfterDelay: function( event, params, delay ) {
		this._EVENTCENTERS['default'].dispatchEventAfterDelay( event, params, delay );
	},
	/**
	 * adds an observer to an event, different from standard
	 * attachEventHook because it is a weak connection that
	 * won't fail if an object comes and goes. Similar to
	 * Cocoa's observation pattern
	 * @param {BDObject} observer object to observe event
	 * @param {String} event    event identifier
	 */
	addObserverForEvent: function( observer, event ) {
		return this._EVENTCENTERS['default'].addObserverForEvent( observer, event );
	},
	/**
	 * remove observation association with event
	 * @param  {BDObject} observer BDObject that is to be removed
	 * @param  {String} event    event identifier
	 * @return {Boolean} success
	 */
	removeObserverForEvent: function( observer, event ) {
		return this._EVENTCENTERS['default'].removeObserverForEvent( observer, event );
	},
	/**
	 * inform observers of an event with data
	 * @param  {String} event event identifier
	 * @param  {mixed} data  usually an object - optional
	 * @return {Boolean} success
	 */
	notifyObserversOfEvent: function( event, data ) {
		return this._EVENTCENTERS['default'].notifyObserversOfEvent( event, data );
	},
	/**
	 * used internally to handle event distribution among
	 * multiple BDEventCenters
	 */
	_parseEventString: function( str ) {
		var sep = str.indexOf(":"),
			eventName = str,
			centerName = "default";
		if (sep > -1) {
			centerName = str.substr(0, sep);
			eventName = str.substr(sep+1, str.length);
		}
		return [centerName, eventName];
	},
	/**
	 * fundamental ajax method
	 * @param  {String} url url to request
	 * @param  {String} type GET or POST
	 * @param  {String} parameters form encoded parameters
	 * @param  {function} callback function to callback on complete
	 * @param  {function(progressEvent)} progress function that gets called onprogress
	 */
	ajax: function ( params ) {
		var u = params.url,
			t = params.type,
			d = params.data,
			c = params.onComplete,
			prog = params.onProgress,
			errorF = params.onError;

		if (errorF == undefined) errorF = function() {};
		
		if (t == undefined) {
			t = "GET";
		}

		var _TMXHR_ = __CreateRequest();
		_TMXHR_._cb = c;
		_TMXHR_.open(t, u, true);
		_TMXHR_.onprogress = prog;
		_TMXHR_.onerror = errorF;
		_TMXHR_.onreadystatechange = function () {
			if (_TMXHR_.readyState == 4){
				if (_TMXHR_._cb != undefined){
					try {
						_TMXHR_._cb(_TMXHR_.responseText);
					} catch (E) {
						errorF.call(E);
					}
				}
			}
		};
		_TMXHR_.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		if (d != null)
		_TMXHR_.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		_TMXHR_.send(d);
	},
	crossDomainRequest: function( params ) {
		var cb = function(){},
			e = new Elem({ tag:"script", type:"text/javascript" });
			
		if (params.callback) cb = params.callback;

		e.onload = function( evt ) {
			cb(this.innerText,e);
			e.parentNode.removeChild(e);
		};

		e.src = params.url;

		this.domInject( e );
	},
	/**
	 * uses GET request to load content and provides it to callback function
	 * @param  {String}   url url to request
	 * @param  {Function} callback a function to execute on complete
	 */
	getUrl: function( _url, cb ) {
		return this.ajax({ url: _url, type: "GET", onComplete: cb });
	},
	/**
	 * convenience method used to post JSON data
	 * to server. uses r= and url form encoding
	 * @param  {String}   url string to request
	 * @param  {Object}   obj javascript object to encode to JSON
	 * @param  {Function} callback  callback function
	 */
	postURLWithObject: function( url, obj, cb ) {
		var p = this.JSON.encode( obj );
		return this.ajax( url, "POST", "r="+p, cb );
	},
	/**
	 * automatically executes provided function
	 * if DOM is ready. Otherwise, waits for DOM ready
	 * to execute the function
	 * @param  {Function} f function to call when ready
	 */
	domReady: function( f ) {
		if (f == undefined) return;
		if (this.__DOMReady == true) {
			if ( typeof f == "function" ) f();
		} else {
			this.attachEventHook( 'domready', f );
		}
	},
	/**
	 * convenience method for document.body.appendChild( element )
	 * @param  {HTML Element} e element to inject
	 */
	domInject: function(e) {
		document.body.appendChild(e);
	},
	setIncludeObject: function(o) {
		var n = this.getNameOfFunction(o);
		this._includedObjects[n] = o;
		$B.dispatchEvent("$B:didSetIncludeObject", { name: n, object: o });
	},
	getIncludeObject: function(n) {
		if (!n) return;

		n = n.replace(/\./g, "_");
		var self = this;
		var o = this._includedObjects[n];
		if ( !o ) {
			$B.attachEventHook("$B:didSetIncludeObject", function( _obj, hook ) {
				if (self._includedObjects[n]) {
					$B.removeEventHook(hook);
					 o = self._includedObjects[n];
				}
			});
		}
		return o;
	},
	getNameOfFunction: function( f ) {
		var n = (f.displayName) ? f.displayName : f.name;
		if (n == undefined) {
			var regex = /\bfunction\b|\(|\)|\{|\}|\/\*|\*\/|\/\/|"|'|\n|\s+/mg;
			n = f.toString();
			n = regex.exec(n);
			n = n[0];
		}
		return n;
	},
	/**
	 * injects tags into HEAD element to
	 * include files
	 * @param  {String []} files array of url Strings to include
	 */
	include: function(files, cb) {
		if (files instanceof Array) {
			var numberOfIncludes = files.length,
				numIncluded = 0,
				classNames = [];

			for ( var i = 0; i < numberOfIncludes; i++ ) {
				classNames[i] = this.capitalize(files[i].split('.js')[0].split('/').pop());

				this.headerInject(files[i], function() {
					numIncluded++;
					if (numberOfIncludes == numIncluded) {
						if (cb) {
							setTimeout(function(){
								var context = {};

								context.$B = window.$B;
								context.kB = window.kB;
								context.kBEvents = window.kBEvents;

								for (var j = 0; j < numberOfIncludes; j++) {
									if (!classNames[j]) continue;
									context[classNames[j]] = $B.getIncludeObject(classNames[j]);
								}
								cb.call(context, context);
							},0);
						}
					}
				});
			}
		} else {
			this.headerInject(files, cb);
		}
		return {
			execute: function executeAfterInclude(fn) {
				fn.apply(null, arguments);
			}
		}
	},
	/**
	 * singular version of include with callback
	 * @param  {String}   file fileurl relative to HTML 
	 * @param  {Function} cb   callback function
	 */
	loadFile: function( file, cb ) {
		return this.headerInject( file, cb );
	},
	/**
	 * determines if a url has already been included
	 * to help prevent duplicate includes
	 * @param  {String} src url to check
	 * @return {Boolean} true if exists, false if not
	 */
	includeExists: function( src ) {
		for (var i = 0; i < this.__requestedIncludeURLs.length; i++) {
			if (this.__requestedIncludeURLs[i] == src) return true;
		}
		return false;
	},
	/**
	 * determines if a specific include loaded
	 * @param  {String} src url string to check
	 * @return {Boolean}
	 */
	includeAtUrlIsLoaded: function( src ) {
		for (var i = 0; i < this.__loadedIncludeURLs.length; i++) {
			if (this.__loadedIncludeURLs[i] == src) return true;
		}
		return false;			
	},
	/**
	 * fundamental HEAD inject method
	 * automatically detects scripts vs stylesheets
	 * @param  {String}   file url to include
	 * @param  {Function} cb   callback function to execute once loaded
	 */
	headerInject: function(file, cb) {
		if (cb == undefined) cb = function() {};
		
		if (this.includeExists( file )) {
			// this file has already been requested
			if (this.includeAtUrlIsLoaded( file )) {
				// the file has already loaded, execute cb now
				cb();
			} else {
				// file has been requested but has not yet finished loading
				// attach a hook to call the callback when complete
				$B.attachEventHook("$B:includeDidLoad", function( data ) {
					if (data.src == file) cb();
				});
			}
			return true;
		}
		
		var parts = file.split(".");
		var headTag = document.getElementsByTagName('head')[0];
		if (parts[parts.length-1].toLowerCase() == "js") {
			var script = new Elem({ tag: "script", type: "text/javascript", charset: "utf-8", src: file });
			var self = this;
			script.onload = function(evt) {
				self.__loadedIncludes++;
				self.__loadedIncludeURLs.push( file );
				var parts = this.src.split("/");
				$B.notifyObserversOfEvent( "$B:includeDidLoad", { filename: parts[parts.length-1], src: file });
				$B.dispatchEvent("$B:includeDidLoad", { filename: parts[parts.length-1], src: file } );
				
				if (!$B.waitingForIncludes()) {
					$B.notifyObserversOfEvent( "$B:allIncludesDidFinishLoading", null);
					$B.dispatchEvent("$B:allIncludesDidFinishLoading");
				}
				cb.call(this, script);
			};
			this.__requestedIncludes++;
			this.__requestedIncludeURLs.push( file );
			headTag.appendChild( script );
		} else if (parts[parts.length-1].toLowerCase() == "css") {
			var link = new Elem({ tag: "style", type: "text/css", charset: "utf-8", media: "all" });
			link.innerText = '@import url("'+file+'");';
			headTag.appendChild( link );
			cb(link);
		}
	},
	waitingForIncludes: function() {
		return (this.__loadedIncludes < this.__requestedIncludes);
	},
	pendingIncludes: function() {
		return (this.__requestedIncludes - this.__loadedIncludes);
	},
	itemExistsInObject: function( item, obj ) {
		for (var i in obj) {
			if (obj[i] == item) return true;
		}
		return false;
	},
	copy: function( obj, level ) {
		if (typeof obj != "object") return obj;
		if (level == undefined) level = 0;
		if (level > 3) return "MAX_DEPTH_EXCEEDED";
		var newObj = {};
		for (var i in obj) {
			if (typeof obj[i] == "object") {
				if (obj[i].length != undefined) {
					newObj[i] = [];
					for (var j = 0, len = obj[i].length; j < len; j++) {
						newObj[i][j] = this.copy( obj[i][j], level+1 );
					}
				} else {
					newObj[i] = this.copy( obj[i], level+1 );
				}
			} 
			else {
				newObj[i] = obj[i];
			}
		}
		return newObj;
	},
	appendLeadingZero: function( value ) {
		if (value < 10) {
			value = "0"+ value;
			return value;
		} else {
			return value;
		}
	},
	todaysDate: function() {
		var date = new Date();
		return date.getFullYear()+"-"+this.appendLeadingZero((date.getMonth()+1))+"-"+this.appendLeadingZero(date.getDate());
	},
	containsClass: function( div, className ) {
		var _c = div.className.trim();
		if (_c.indexOf(className) > -1) return true;
		return false;
	},
	addClass: function(div, className) {
		var _c = div.className.trim();
		if (_c.indexOf(className) == -1 && className != "") {
			div.className = _c+" "+className;
			div.setAttribute("class", _c+" "+className);
			div.setAttribute("className", _c+" "+className);
		}
	},
	removeClass: function(div, className) {
		var _c  = div.className;
		var _cn = className;
		var _cs = _c.split(" ");
		var _i  = -1;
		var _nc = "";
		if (_c.indexOf(_cn) >= 0) {
			for (var i = 0; i<_cs.length; i++) {
				if (_cs[i] != _cn) {
					//_cs.splice(i,1);
					_nc += _cs[i];
					if (i < _cs.length-1) _nc += " ";
				}
			}
			div.className = _nc;
			div.setAttribute("class", _nc);
			div.setAttribute("className", _nc);
		}
	},
	toggleClass: function( div, c ) {
		if ( div.className.indexOf( c ) > -1 ) {
			this.removeClass( div, c );
		} else {
			this.addClass( div, c );
		}
	},
	getLeftOffset: function(cE) {
		try {
			cE = cE.getElem();
		} catch (E) {}
		var l  = 0;
		do {
			l += cE.offsetLeft;
			if (cE.offsetParent == null) break;
			cE = cE.offsetParent;
		} while( cE.tagName.toLowerCase() != "body");
		
		return l;
	},
	getTopOffset: function(cE) {
		try {
			cE = cE.getElem();
		} catch (E) {}
		var t  = 0;
		do {
			t += cE.offsetTop;
			if (cE.offsetParent == null) break;
			cE = cE.offsetParent;
		} while( cE.tagName.toLowerCase() != "body");
		return t;
	},
	_DOMReady: function()
	{
		//if (this.$B) this.$B.DOMReady();
		this.initWithModules();
		this.__DOMReady = true;
		this.domReady();
		this.dispatchEvent('domready');
	},
	unload: function()
	{
		//if (this.$B) this.$B.unload();
		this.dispatchEvent('windowunload');
	},
	setCurrency: function( sym, prefix ) {
		if (prefix == undefined) prefix = true;
		if (typeof prefix == "string" && prefix.toLowerCase() == "true") {
			prefix = true;
		} else if (typeof prefix == "string") {
			prefix = false;
		}
		this.format.currency.prefix = prefix;
		this.format.currency.symbol = sym;
		this.dispatchEvent('BDFormatter:StringFormatDidChange');
	},
	setCurrencyDecimalCount: function( ct ) {
		this.format.currency.decimals = ct;
		this.dispatchEvent('BDFormatter:StringFormatDidChange');
	},
	setThousandsSeparator: function( sep ) {
		this.format.numbers.thousands = sep;
		this.dispatchEvent('BDFormatter:StringFormatDidChange');
	},
	setDecimalSeparator: function( sep ) {
		this.format.numbers.decimal = sep;
		this.dispatchEvent('BDFormatter:StringFormatDidChange');
	},
	formatDate: function( dt, format ) {
		if (typeof format != "string") return;
		var dtStr = "", Zero = this.appendLeadingZero;
		if (dt && dt.getTime) {
			var m = dt.getMonth()+1,
				d = dt.getDate(),
				y = dt.getYear(),
				n = dt.getMinutes(),
				h = dt.getHours(),
				s = dt.getSeconds();
				
			if (format.indexOf("/") > 0 || format.indexOf("-") > 0 || format.indexOf(".") > 0) {
				var sep = (format.indexOf("/") ? "/" : (format.indexOf("-") > 0 ? "-" : "."));
				var pts = format.split(sep);
					
				switch(pts[0]) {
					case "D":
						dtStr = d.toString();
					break;
					case "DD":
						dtStr = Zero( d.toString() );
					break;
					case "M":
						dtStr = m.toString();
					break;
					default:
						dtStr = Zero( m.toString() );
				}
				
				switch(pts[1]) {
					case "D":
						dtStr = dtStr + sep + d;					
					break;
					case "MM":
						dtStr = dtStr + sep + Zero( m );
					break;
					case "M":
						dtStr = dtStr + sep + m;
					break;
					default:
						dtStr = dtStr + sep + Zero( d );
				}
				
				if (pts[2]) {
					switch(pts[2]) {
						case "YY":
							dtStr = dtStr + sep + dt.getYear();					
						break;
						default:
							dtStr = dtStr + sep + dt.getFullYear();
					}
				}
				return dtStr;
			}
			switch (format) {
				case kB.DateFormatShort:
					return this.formatDate( dt, "M/D/YY" );
				break;
				case kB.DateFormatMedium:
					return this.formatDate( dt, "MM/DD/YYYY" );				
				break;
				default:
					return dt.toString();
			}
		}
	},
	/**
	 * formats a String with requested format
	 * used for currencies and numbers primarily
	 * and called internally from BDControls
	 * @param  {[type]} str    [description]
	 * @param  {[type]} format [description]
	 * @return {[type]}
	 */
	formatString: function( str, format ) {
		str += '';
		
		str = str.replace(/[a-zA-Z\$,]/g, '');
		
		var ts = this.format.numbers.thousands,
			ds = this.format.numbers.decimal,
			dc = this.format.currency.decimals,
			s  = this.format.currency.symbol;
			
		if ( format == undefined) format = kB.StringFormatDefault;
		if ( format == kB.StringFormatCurrency || format == kB.StringFormatNumber || format == kB.StringFormatCurrencyInCents ) {
			if (format == kB.StringFormatCurrencyInCents) {
				str = (parseFloat(str)/100).toString(2);
			}
			pts = str.split('.');
			pt1 = pts[0];
			pt2 = pts.length > 1 ? ds + pts[1] : '';
			var ex = /(\d+)(\d{3})/;
			while (ex.test( pt1 )) {
				pt1 = pt1.replace( ex, '$1' + ts + '$2' );
			}
			if (pt2.length > dc) {
				pt2 = pt2.substr(0, dc+1);
			} else {
				if (format == kB.StringFormatCurrency)  {
					if (pt2.length == 0) {
						pt2 = ds;
					}
					while (pt2.length < dc+1) {
						pt2 += '0';
					}
				}
			}
			if (pt2.length == 1) {
				pt2 = "";
			}
			if (format == kB.StringFormatCurrency) {
				return this.format.currency.prefix == true ? s + pt1 + pt2 : pt1 + pt2 + ' ' + s;
			}
			return pt1 + pt2;
		}
		return str;
	},
	capitalize: function( s ) {
		return s.substr(0,1).toUpperCase()+s.substr(1);
	},
	/**
	 * generates random string - usually used to generate
	 * temporary unique identifiers
	 * @param  {Int} len length of the string to generate
	 * @return {String}
	 */
	randomStringWithLength: function( len ) {
		var x, i, pass,
			chars = "abcdefghijklmnopqrstuvwxyz1234567890",
			pass = "";

		for(x=0;x<len;x++) {
			i = Math.floor(Math.random() * 36);
			pass += chars.charAt(i);
		}

		return pass;
	},
	/**
	 * generates a random integer between 0 and the number specified
	 * @param  {int} n maxValue
	 * @return {int}
	 */
	randomInt: function( n ) {
		return ( Math.round ( Math.random ( ) * n + 1 ) );
	},
	/**
	 * overrides CSS value
	 * @param {[type]} selectorString [description]
	 * @param {[type]} attribute      [description]
	 * @param {[type]} value          [description]
	 */
	setValueOfCSSSelector: function( selectorString, attribute, value ) {
		var i = null, n = null;
		if (this.__loadedCSSRules == undefined) {
			this.__loadedCSSRules = [];
		
			for ( i in document.styleSheets) {
				if (document.styleSheets[i].cssRules) {
					this.__loadedCSSRules = document.styleSheets[i].cssRules;
				} 
				else if (document.styleSheets[i].rules) {
					this.__loadedCSSRules = document.styleSheets[i].rules;
				}
			}
		} 
		
		for (n in this.__loadedCSSRules) {
			if (this.__loadedCSSRules[n].selectorText == selectorString)	{
				this.__loadedCSSRules[n].style[attribute] = value;
			}
		}

	},
	/**
	 * searches for and returns the root parent frame if $B is
	 * running in an iframe or other frame based environment.
	 * @return {DOMWindow}
	 */
	getRootFrame: function() {
		var frameCount = 0,
			rootFrame = window;
		while (frameCount < 3 && rootFrame.parent != rootFrame && rootFrame.parent != null) {
			frameCount++;
			if (typeof rootFrame.parent == "function") {
				rootFrame = rootFrame.parent();
			} else {
				rootFrame = rootFrame.parent;
			}
		}
		return rootFrame;
	},
	/**
	 * installs BDPlugin into $B architecture
	 * @param plugin BDPlugin
	 */
	installPlugin: function( plugin ) {
		var name = this.getNameOfFunction( plugin );
		if (name.indexOf("V") == 0) {
			name = name.substr(2, name.length);
		}
		if (this.plugins[name] != undefined) {
			
			console.log("$B:installPlugin: plugin "+name+" already installed!");
			return;

		}
		this.plugins[name] = (plugin.prototype == undefined) ? plugin : plugin.prototype;
		this.plugins[name].displayName = name;
		this.plugins[name].name = name;
		
		//console.log("$B:didInstallPlugin:" + name);
		$B.dispatchEvent("$B:didInstallPlugin", name);
	},
	/**
	 * instantiates the plugin with name
	 */
	activatePlugin: function( pluginName, opts ) {
	 	if (this.plugins[pluginName] == undefined) return false;
	 	try {
	 		for (var i = 0, len = this._activePlugins.length; i < len; i++) {
	 			if (this._activePlugins[i].name == pluginName) return this._activePlugins[i];
	 		}
	 		var usescreate = (this.plugins[pluginName].create != undefined);
		 	var instance = (this.plugins[pluginName].create) ? this.plugins[pluginName].create() : this.plugins[pluginName]();
		 	if (instance.init && (instance._didInit == undefined || instance._didInit == false)){
		 		instance.init(opts);
		 		instance._didInit = true;
		 	}
		 	this._activePlugins.push( instance );
		 	return instance;	
	 	} catch (E) {
	 		console.warn('$B:activatePlugin: an error occurred while activating plugin ' + pluginName);
	 		console.log(E);
	 	}
	 	
	},
	unloadPlugin: function( pluginName ) {
	 	if (this.plugins[pluginName] == undefined) return true;
 		for (var i = 0, len = this._activePlugins.length; i < len; i++) {
 			if (this._activePlugins[i].name == pluginName) {
 				if (this._activePlugins[i].unload != undefined) this._activePlugins[i].unload();
 				this._activePlugins.splice(i,1);
	 			return true;
	 		}
 		}

	},
	beginAttachingSubviewsToView: function( view ) {
	 	this._currentBDViewTargetForNewViews.unshift( view );
	},
	endAttachingSubviewsToView: function( view ) {
	 	this._currentBDViewTargetForNewViews.shift();
	},
	endView: function() {
	 	this._currentBDViewTargetForNewViews.shift();
	},
	suspendAutoSubviews: function() {
	 	this._suspendAutoSubviews = true;
	},
	resumeAutoSubviews: function() {
	 	this._suspendAutoSubviews = false;
	},
	currentViewToAttachSubviews: function() {
	 	if (this._suspendAutoSubviews) return null;
	 	if (this._currentBDViewTargetForNewViews[0] == undefined) return null;
	 	return this._currentBDViewTargetForNewViews[0];
	},
	setPageTitle: function( v ) {
	 	document.title = v;
	},
	extend: function( existing, extensions ) {
		var i;
		if (!existing) existing = {};
		if (!extensions) extensions = {};

		for (i in extensions) {
			if (extensions.hasOwnProperty(i)) {
				existing[i] = extensions[i];
			}
		}
		return existing;
	}

};


	// Instantiate The Kit
	Bind.displayName = "Bind";
	var $B = new Bind();
	
	// Expose to main window
	window.$B = window.Bind = $B;
	
		
	/** NotificationTypes */
	kB.NotificationTypeDefault 	= 0;
	kB.NotificationTypeUserEvent 	= 1;
	kB.NotificationTypeNetwork 	= 2;
	
	/**
	 * Event Center
	 * @constructor
	 */
	var BDEventCenter = function BDEventCenter( attr ) {
		this.scope = "default";
		this._numOfDispatchedNotifications = 0;
		
		for (var i in attr) this[i] = attr[i];
		
		this._EVENTS = {};
		this._FORWARDERS = [];
		this._OBSERVATIONS = {};

	};

	BDEventCenter.prototype = {
		BDType: "BDEventCenter",
		create: function(attr) {
			return new BDEventCenter(attr);
		},
		registerEventHook: function ( event ) {
			if (this._EVENTS[ event ] == undefined) this._EVENTS[ event ] = [];
		},
		addObserverForEvent: function( observer, event ) {
			if (this._OBSERVATIONS[event] == undefined) {
				this._OBSERVATIONS[event] = { creator: observer, 'event': event, observers: [] };
			}
			var obs = this._OBSERVATIONS[event].observers;
			for (var i = 0, len=obs.length; i < len; i++) {
				if (obs[i] == observer) return true;
			}
			this._OBSERVATIONS[event].observers.push( observer );
		},
		removeObserverForEvent: function( observer, event ) {
			if (this._OBSERVATIONS[event] == undefined) return;
			var obs = this._OBSERVATIONS[event].observers;
			for (var i = 0, len=obs.length; i<len; i++) {
				if (obs[i] == observer) {
					obs.splice(i,1);
					return true;
				}
			}
			return false;
		},
		removeObserverFromAllEvents: function( observer ) {
			for (var i in this._OBSERVATIONS) {
				var obs = this._OBSERVATIONS[i];
				for (var j=0, len=obs.observers.length; j<len; j++) {
					if (obs.observers[j] == observer) {
						obs.observers[j] = null;
						obs.observers.splice(j, 1);
					}
				}
			}
			return true;
		},
		notifyObserversOfEvent: function( event, data ) {
			if (this._OBSERVATIONS[event] == undefined) return false;
			var obs = this._OBSERVATIONS[event].observers;
			for (var i = 0, len=obs.length; i<len; i++) {
				if (obs[i].observeValueForEvent) {
					try {
						obs[i].observeValueForEvent( data, event );
					} catch (E) {
						console.log("BDEventCenter:notifyObserversOfEvent:"+event+": an error occurred");
						console.log( E );
					}
				}
			}
		},
		attachEventHook: function( event, action, hookString ) {
			if (event=="") {
				this._FORWARDERS.push( action );
				return true;
			}
			if (this._EVENTS[ event ] == undefined) this._EVENTS[ event ] = [];
			var pos = this._EVENTS[ event ].length;
			this._EVENTS[ event ][pos] = { f: action, index: pos, hook: hookString };
			return this._EVENTS[ event ][pos];
		},
		removeEventHook: function( eh ) {
			if (eh == undefined || typeof eh != "object") return;
			if (eh.hook == null || eh.hook == undefined || eh.index == null || eh.index == undefined || this._EVENTS[ eh.hook ] == undefined) return false;
			this._EVENTS[ eh.hook ][eh.index] = null;
			return true;
		},
		dispatchNotification: function ( event, params ) {
			return this.dispatchEvent( event, params );
		},
		dispatchEvent: function ( event, params ) {
			this._numOfDispatchedNotifications++;
			if ( this._EVENTS[event] != undefined ) {
				for (var i = 0, len = this._EVENTS[event].length; i < len; i++) {
					try {
						
						if (this._EVENTS[ event ][i] == null || this._EVENTS[ event ][i] == undefined) continue;
						
						this._EVENTS[ event ][i].f( params, this._EVENTS[ event ][i] );
					} catch (E) {}
				}
			}
			for (i = 0, len = this._FORWARDERS.length; i < len; i++) {
				try {
					this._FORWARDERS[i](event, params);
				} catch (E) {}
			}
			return true;
		},
		dispatchEventAfterDelay: function( event, params, delay ) {
			var self = this;
			setTimeout( function( event, params ) {
				self.dispatchEvent( event, params );
			}, delay);
		}
	};
	
	$B.classes.BDEventCenter = BDEventCenter;
	$B.EventCenter = BDEventCenter.prototype;

	$B._createDefaultEventCenter();
		
	window['V'] = function( id, ns ) {
		var v;
		if (ns != undefined) {
			ns = $B.namespace( ns );
		} else {
			ns = $B.namespace( $B.currentNamespace() );
		}

		if (ns != undefined) {
			v = ns._viewControllersByID[id];
			if ( v != undefined ) return v;

			v = ns._viewsByID[id];			
			if ( v != undefined ) return v;


			return ns._controlsByID[id];
		}

		v = $B._viewControllersByID[id];
		if ( v != undefined ) return v;

		// fallback to global if currentNamespace == null
		v = $B._viewsByID[id];
		if ( v != undefined ) return v;

		return $B._controlsByID[id];
		
	};

	// Helper Methods - Global Scope
	window['__CreateRequest'] = function() {
		var request;

		try {
			request = new XMLHttpRequest();
			} catch (trymicrosoft) {
			try {
				request = new ActiveXObject("Msxm12.XMLHTTP");
				} catch (othermicrosoft) {
				try {
					request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (failed) {
					request = null;
				}
			}
		}
		if (request == null) {
			alert("Error creating request object, please check your browser javascript support.");
		} else {
			return request;
		}
	};
	
	window['Elem'] = function(type, id, styleClass, content) {
		if (typeof type == "object") {
			var elem = document.createElement(type.tag);
			for (var i in type) {
				if (i.toLowerCase() == "tag") continue;
				elem.setAttribute(i, type[i]);
			}
			if ( type.content != undefined) elem.innerHTML = type.content;
			return elem;
		}
		if (type == "clear") return new Elem("div", "", "clear");
	
		var _elem = document.createElement(type);
		if (id != undefined && id != "") _elem.setAttribute("id", id);
		_elem.setClass = function(className) {
			_elem.setAttribute("class", className);
			_elem.setAttribute("className", className);
		};
		if (styleClass != undefined && styleClass != "") _elem.setClass(styleClass);
		if (content != undefined) _elem.innerHTML = content;
		if ( !_elem.addEventListener ) {
			_elem.addEventListener = function(eventName, action) {
				this.attachEvent("on"+eventName, action);
			};
			_elem.removeEventListener = function(eventName, action) {
				this.detachEvent("on"+eventName, action);
			};
		}
	
		return _elem;
	};
	
	window['$Obj'] = function(id) {
		var _obj = id;
		if (typeof id == "string") _obj = document.getElementById(id);
		if (_obj == undefined || _obj == null) return;
		_obj.append = function(child) {
			if (child.identifyType != undefined){
				this.appendChild(child.getElem());
			} else {
				this.appendChild(child);
			}
		};
		_obj.getValue = function() {
			return this.value.trim();
		};
		return _obj;
	};
	
	window['NOW'] = function(){
		return new Date().getTime();
	};
	
	window['BDRectMake'] = function(x, y, w, h) {
		var rect = { origin: {}, size: {} };
		rect.origin.x = x;
		rect.origin.y = y;
		rect.size.width = w;
		rect.size.height = h;
		return rect;
	};
	window['BDPointInRect'] = function( pt, rect ) {
		if ( rect.origin.x <= pt.x && pt.x <= (rect.origin.x + rect.size.width)) {
			if (rect.origin.y <= pt.y && pt.y <= (rect.origin.y + rect.size.height)) {
				return true;
			}
		}
		return false;
	};

	// Begin DOM listener inspired by jQuery
	if ( document.addEventListener ) {
		document.addEventListener( "DOMContentLoaded", function contentLoadedListener() {
			document.removeEventListener( "DOMContentLoaded", contentLoadedListener, false );
			$B._DOMReady();
		}, false );
		
		if (!$B.browser.explorer) {
			window.onunload = $B.unload();
		}
		
	} else if ( document.attachEvent ) {
		document.attachEvent("onreadystatechange", function readyStateListener(){
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", readyStateListener );
				$B._DOMReady();
			}
		});
		//window.onunload = $B.unload();
	} else {
		window.onload = $B._DOMReady();
		window.onunload = $B.unload();
	}
	
	$B.JSON = {
		encode: JSON.stringify,
		decode: JSON.parse
	};

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

(function() {
	var Base64 = {
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
		// public method for encoding
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
 
			input = Base64._utf8_encode(input);
 
			while (i < input.length) {
 
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
 
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
 
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
 
				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
			}
 
			return output;
		},
 
		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
 
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
			while (i < input.length) {
 
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
 
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
 
				output = output + String.fromCharCode(chr1);
 
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
 
			}
 
			output = Base64._utf8_decode(output);
 
			return output;
 
		},
 
		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
 
			for (var n = 0; n < string.length; n++) {
 
				var c = string.charCodeAt(n);
 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
 
			}
 
			return utftext;
		},
 
		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
 
			while ( i < utftext.length ) {
 
				c = utftext.charCodeAt(i);
 
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
 
			}
 
			return string;
		}
 
	}
	
	$B.Base64 = Base64;
})();

})(window);
/** BDObject **/

(function () {


	// BDObject class inheritance
	// inspired by John Resig's Simple
	// Inheritance method
	function BDObject() {
		
	};
	BDObject.prototype = {
		_preInit: function(arg) {
			if (this._didPreInit) return;
			this._private = {};
			this._eventObservers = {};
			this._observationTargets = [];
			this._dispatchBindingNotifications = true;
			this._fn = {};
			this._setters = {};
			this._getters = {};
			
		},
		init: function( prop ) {
			console.log("BDObject init");
		},
		initWithObject: function( obj ) {
	// 		console.log("BDObject will initWithObject:");
	// 		console.log(obj);
			this._private = {};
			for (var i in obj) {
				this.initNewProperty(i, obj[i]);
			}
			return this;
		},
		initNewProperty: function( i, initValue ) {
			i = i.replace(/\./g, "_");
			if (typeof initValue == "function") {
				this._fn[i] = initValue;
				this[i] = initValue;
				return;
			}
			if (i.substr(0,1) == "_") {
				this[i] = initValue;
				return;
			}
			
			var prop = $B.capitalize(i);
			var pS   = "_"+i;

			this._private[pS] = initValue;
			
			(function( self, i, prop, pS ) {
				self['get'+prop] = function(){ return self._private[pS]; };
				self._getters[i] = self['get'+prop];
			})(this, i, prop, pS);	
					
			(function( self, i, prop, pS ) {
				self['set'+prop] = function(v){
					if (v != null && v != undefined && typeof v == "object" && v.addObserverForEvent) {
						v.addObserverForEvent( self, "propertyDidChange", function( b ) {
							self.notifyObserversOfEvent(i+"."+b.property+":didChange", b.value);
							var newB = { property: i+"."+b.property, value: b.value };
							self.notifyObserversOfEvent("propertyDidChange", newB);
						});
					}
					self.notifyObserversOfEvent( 'propertyWillChange', pS.substr(1) );
					self._private[pS] = v;
					self.notifyObserversOfEvent(i+":didChange", v);
					self.notifyObserversOfEvent("propertyDidChange", {property: i, value: v});
				};
				self._setters[i] = self['set'+prop];
			})(this, i, prop, pS);
			if (this.__defineGetter__) {
				this.__defineGetter__(i, this['get'+prop]);
			}
			if (this.__defineSetter__) {
				this.__defineSetter__(i, this['set'+prop]);
			}
		},
		setValueWithPropertyPath: function() {
			var _v = arguments[0],
				_path = [];
			if (arguments[1] && typeof arguments[1] == "string"){
				for (var i = 1, len = arguments.length; i<len; i++) _path.push(arguments[i]);
			} else {
				_path = arguments[1];
			}
			if (!this.hasProperty( _path[0] )){
				if (_path.length == 1) {
					this.initNewProperty( _path[0], _v );
					return _v;
				} else if (_path.length > 1) {
					var _o = BDObject.create();
					_o.setValueWithPropertyPath( _v, _path.slice(1));
					this.initNewProperty( _path[0], _o );
					return _o;
				}
			} else {
				if (_path.length > 1) {
					this.setValueWithPropertyPath( _v, _path );
				} else {
					this.setValueOfProperty(_v, path[0]);
				}
			}
		},
		setValueOfProperty: function( _v, _p ) {
			_p = _p.replace(/\./g, "_");
			if (!this.hasProperty(_p)) {
				return this.initNewProperty( _p, _v );
			}
			return this._setters[_p](_v);
		},
		valueOfProperty: function( _p ) {
			_p = _p.replace(/\./g, "_");
			if (this._getters[_p]) return this._getters[_p]();
	// 		console.log("BDObject:valueOfProperty: property "+_p + " is undefined");
	// 		console.log(this);
			return;
		},
		valueWithPropertyPath: function() {
			var _path = [], _o = null, i = 0, len = 0;
			if (arguments[0] && typeof arguments[0] == "string"){
				for (i = 0, len = arguments.length; i<len; i++) _path.push(arguments[i]);
			} else {
				_path = arguments[0];
			}
			if (_path === -1) {
				for (var _p in this._private) {
					break;
				}
				if (_p == undefined) return;
				_o = this.valueOfProperty(_p.substr(1));
				if (_o != undefined && typeof _o == "object" && _o.valueWithPropertyPath) {
					_path = [];
					for (i = 0, len = arguments.length; i<len; i++) _path.push(arguments[i]);
					_o = _o.valueWithPropertyPath(_path.slice(1));
				}
				return _o;
			} else if (typeof _path == "string") {
				return this.valueOfProperty( _path );
			} else if (_path.length == 1) {
				return this.valueOfProperty( _path[0] );
			} else {
				_o = this.valueOfProperty( _path[0] );
				if (_o == undefined) return;
				return _o.valueWithPropertyPath( _path.splice(1) );
			}
		},
		hasProperty: function(p) {
			return (this[p] != undefined);
		},
		updateWithObject: function( obj ) {
			if (obj._private && typeof obj._private == "object") {
				obj = obj._private;
			}
			for (var i in obj) {
				var pS = "_"+i;
				var prop = $B.capitalize(i);
				
				if (this._private[pS] && this._private[pS] != obj[i]) {
					this._setters[i](obj[i]);
				} else if (this._private[pS] == undefined) {
					this.initNewProperty(i, obj[i]);
				}
			}
			return this;
		},
		toJSObject: function() {
			var o = {};
			for (var i in this._fn) {
				o[i] = this._fn[i];
			}
			for (i in this._private) {
				if (this._private[i].toJSObject) {
					o[i] = this._private[i].toJSObject();
				} else {
					o[i] = this._private[i];
				}
			}
			return o;
		},
		receiveNotification: function( notif ) {
			
		},
		removeAllObservations: function() {
			for (var i in this._observationHandlers) {
				var obs = this._observationHandlers[i];
				for (var j=0, len=obs.length; j<len; j++) {
					delete obs[j];
				}
				delete this._observationHandlers[i];
			}
			return true;

		},
		hasObservationHandlerForEvent: function( e ) {
			return (this._observationHandlers[e] != undefined);
		},
		addObservationHandler: function( event, handler ) {
			if (this._observationHandlers[event] == undefined) this._observationHandlers[event] = [];
			this._observationHandlers[event].push( handler );
			return true;
		},
		observeValueForEvent: function( data, event ) {
			if (this._observationHandlers[event]) {
				var hdrs = this._observationHandlers[event];
				for (var i = 0, len=hdrs.length; i<len; i++) {
					this._observationHandlers[event][i]( data );
				}
			}
			return true;
		},
		addObservationTarget: function( t ) {
			var newTarget = true;
			for (var i = 0, l = this._observationTargets.length; i < l; i++) {
				if (this._observationTargets === t) {
					newTarget = false;
					break;
				}
			}
			if (newTarget) {
				this._observationTargets.push( t );
			}
		},
		addObserverForEvent: function( o, e, f, rl ) {
			if (this._eventObservers[e] == undefined) this._eventObservers[e] = $B.Array.create();
			if (rl == undefined) rl = false;
			var ref = { observer: o, link: ref, target: this, event: e, fn: f };
			ref.link = ref;
			var newb = true;
			this._eventObservers[e].forEach(function(o) {
				if (ref.observer == o.observer &&
					ref.target == o.target &&
					ref.event == o.event &&
					ref.fn == o.fn) {
						newb = false;
						return -1;
					}
			});
			if (newb) this._eventObservers[e].push(ref);
			if (rl) {
				o.addObservationTarget(this);
			}
			return ref;
		},
		refreshBoundObservers: function() {
			var self = this;
			for (var e in this._eventObservers) {
				this._eventObservers[e].forEach(function(obj) {
					try {
						var d = null;
						if (obj.event.indexOf(":") > -1) {
							d = self.valueOfProperty( obj.event.split(":")[0] );
						}
						if (obj.fn != undefined && typeof obj.fn == "function") {
							obj.fn.call( obj.observer, d );
						} else {
							obj.observer.observeValueForEvent( d, e );
						}
					} catch (E) {
						console.log("Bindings Error: Unable to notify "+obj.observer.id+" of event "+e+" probably because observing object has no handler for event");
						console.log(E);
					}
				});
			}
		},
		removeObserver: function( o ) {
			var _targets = o._observationTargets;
			for (var i = 0; i < _targets.length; i++) {
				if (_targets[i] === 0) _targets.splice(i,1);
			}
			for (i in this._eventObservers) {
				this._eventObservers[i].forEach(function( obj, index ) {
					if ( obj.observer === o ) this.removeObjectAtIndex( index );
				});
			}
		},
		notifyObserversOfEvent: function( e, d ) {
			if (!this._dispatchBindingNotifications) return;
			if (this._eventObservers[e]) {
				this._eventObservers[e].forEach(function(obj) {
					try {
						if (obj.fn != undefined && typeof obj.fn == "function") {
							obj.fn.call( obj.observer, d );
						} else {
							obj.observer.observeValueForEvent( d, e );
						}
					} catch (E) {
						console.log("BDBindings Error: Unable to notify "+obj.observer.id+" of event "+e+" probably because observing object has no handler for event");
						console.log(E);
					}
				});
			}
		},
		bind: function( attr, toObject, withKeyPath, options ) {
			if (typeof toObject != "object" || toObject.addObserverForEvent == undefined) {
				console.log("BDBindings:WARNING: "+this.id+" was unable to bind to non BDObject");
				return false;
			}
			var attrSetterFnName = "set"+$B.capitalize(attr);
			var self = this;
			toObject.addObserverForEvent( this, withKeyPath+":didChange", function BDBinding(v) {
				if (options && options.transformer) {
					v = options.transformer.apply(self, arguments);
				}
				self[attrSetterFnName].call(self, v);
			});
			return true;
		},
		typeIsEqualTo: function( t ) {
			return (this.BDType == t);
		},
		performActionOnInterval: function( _action, _interval, _id ) {
			var self = this;
			if (this._intervalActions.length == 0) {
				this._intervalActionsAreRunning = true;
			}
			this._intervalActions.push( { id: _id, 
										  action: _action,
										  running: true, 
										  ownerScope: this, 
										  intervalTime: _interval, 
										  interval: setInterval(function() {
											_action.apply( self, arguments );	
										  }, _interval)
										} );
										
			if (!this._intervalActionsAreRunning) {
				console.log("an intervalAction was pushed while actions are not running");
				clearInterval(this._intervalActions[this._intervalActions.length-2].interval);
			}
		},
		cancelAllIntervalActions: function() {
			//console.log(this.id + " willClearAllIntervalActions");
			for (var i = 0, len=this._intervalActions.length; i<len; i++) {
				clearInterval( this._intervalActions[i].interval );
			}
			this._intervalActions.splice(0, this._intervalActions.length);
		},
		cancelIntervalActionWithId: function( id ) {
			for (var i = 0, len=this._intervalActions.length; i<len; i++) {
				if (this._intervalActions[i].id == id) {
					clearInterval(this._intervalActions[i].interval);
					this._intervalActions.splice(i,1);
					break;
				}
			}
		},
		pauseIntervalActions: function() {
			if (this._intervalActionsAreRunning == true) {
				//console.log( this.id + " will pauseIntervalActions");
				for (var i = 0, len=this._intervalActions.length; i<len; i++) {
					clearInterval( this._intervalActions[i].interval );
					this._intervalActions[i].running = false;
					//console.log( this.id + " clearInterval");
				}

				this._intervalActionsAreRunning = false;
				//console.log(this.id + "paused "+this._intervalActions.length+" interval actions");

			}
		},
		resumeIntervalActions: function() {
			if (this._intervalActionsAreRunning == false && this._intervalActions.length > 0) {

				var self = this;
				for (var i = 0, len=this._intervalActions.length; i<len; i++) {
					var _ai = this._intervalActions[i];

					if (_ai.running) continue;

					(function(_ai) {
						clearInterval( _ai.interval );
						_ai.interval = setInterval(function() {
							_ai.action.apply( _ai.ownerScope, arguments );
						}, _ai.intervalTime);				
					})(_ai);
					this._intervalActions[i].running = true;
				}
				this._intervalActionsAreRunning = true;
			}
		},
		pauseIntervalActionsIfAllowed: function( recursive ) {
			if (recursive == undefined) recursive = true;
					
			if (this.pauseIntervalActionsOnHide) {

				this.pauseIntervalActions();
				if (recursive == true) {
					var self = this;
					(function(obj){
						setTimeout( function() {
							var svs = obj.getSubviewsRecursive();
							if (svs == undefined) return;
							for (var i = 0, len=svs.length; i<len; i++) {
								svs[i].pauseIntervalActionsIfAllowed.call( svs[i], false );
							}
						}, 25);
					})(self);
				}
			}
		},
		resumeIntervalActionsIfAllowed: function( recursive ) {
			if (recursive == undefined) recursive = true;
			
			if (this.pauseIntervalActionsOnHide) {
				this.resumeIntervalActions();
				var self = this;
				
				if (recursive == true) {
					(function(obj){
						setTimeout( function() {
							var svs = obj.getSubviewsRecursive();
							if (svs == undefined) return;
							for (var i = 0, len=svs.length; i<len; i++) {
								svs[i].resumeIntervalActionsIfAllowed.call( svs[i], false);
							}
						}, 25);
					})(self);
				}
			}		
		},
		hide: function() {
			this.pauseIntervalActionsIfAllowed();
		},
		show: function() {
			this.resumeIntervalActionsIfAllowed();	
		},
		destroy: function() {
			this.cancelAllIntervalActions();
		},
		identify: function() {
			return this.BDType;
		},
		describeForInterface: function() {
			var _compare = new Bind.classes[this.BDType](this);
			var _data = {};
			for (var i in this) {
				if (_compare[i] == undefined || _compare[i] != this[i]) {
					_data[i] = this[i];
				}
			}
			return _data;
		},
		method: function() {
			var self = this,
				args = Array.prototype.slice.call(arguments),
				m = args.shift();

			if (typeof this[m] != "function") return function() {console.log("No method named "+m+" found on object " +self.id);};

			return function(){
				self[m].apply(self, $B.extend(arguments, args));
			};
		},
		performMethodAfterDelay: function() {
			var args = [];
			for (var i = 0, len = arguments.length; i < len; i++) args.push( arguments[i] );
			var m = args.shift(),
				d = args.shift(),
				self = this;
			if (d == undefined) d = 20;
			if (this[m] && typeof this[m] == "function") {
				setTimeout( self.method( m, args ), d);
				return true;
			}
			return false;
		},
		on: function(evtName, listener, useCapture) {
			if (useCapture === undefined) useCapture = false;
			this.getElem().addEventListener(evtName, listener, useCapture);
			return listener;
		},
		off: function(evtName, listener, useCapture) {
			if (useCapture === undefined) useCapture = false;
			this.getElem().removeEventListener(evtName, listener, useCapture);
			return listener;
		}
	};
	BDObject.displayName = "BDObject";
	BDObject.create = function( prop ) {
		var o = new BDObject(prop);
		o.BDType = "BDObject";
		o.displayName = "BDObject";
		o._preInit();
		o._didPreInit = true;
		return o;
	};
	BDObject.objectWithObject = function(obj) {
		var o = BDObject.create();
		o.initWithObject(obj);
		return o;
	};

	BDObject.extend = function extend( attr ) {

		var _super = this.prototype, proto = null, i = null;
		
		init = true;
		
		proto = new this();

		init = false;

		for ( i in attr ) {
			proto[i] = (typeof attr[i] == "function" && typeof _super[i] == "function") ? 
			(function(i, func) {
				return function() {
					var tmp = this._super;

					this._super = _super[i];
					try {
						var rt = func.apply(this, arguments);
					} catch (E){
						console.log("An uncaught exception was thrown while executing a function ("+i+") in " + this.id + " below: Object, Exception");
						console.log(this);
						console.log(E);
					}
					this._super = tmp;

					return rt;
				};
			})(i, attr[i]) : attr[i];
		}
		var _origin = ((attr.displayName != undefined) ? attr.displayName : attr.name);
		if (typeof _origin == "string") {
			_origin = _origin.replace(/\./g, "_");
		} else {
			_origin = "BDPlugin";
		}
		if (_origin == undefined) _origin = "BDPlugin";
		
		var anObject = function BDObject() {
			this._observationHandlers = {};
			this._intervalActions = [];
			this.pauseIntervalActionsOnHide = true;
			this._intervalActionsAreRunning = false;
			if ( !init && this.init ) {
				this._preInit.apply( this, arguments );
				this._didPreInit = true;
				this.init.apply( this, arguments );
				this._didInit = true;
			}
		};

		try {
			anObject.displayName = _origin;
		} catch (E) {}

		anObject.prototype = proto;
		anObject.prototype.constructor = BDObject;
		anObject.extend = BDObject.extend;

		return anObject;
	};

	window.BDObject = BDObject;

	$B.vObjectDefDidLoad();

})();
/** BDArray **/

(function($B) {

	'use strict';

	kBEvents.BDArray = {
		willUpdate: 'BDArray:willUpdate',
		didUpdate:  'BDArray:didUpdate'
	};

	/**
	 * BDArray
	 * @constructor
	 * @extends BDObject
	 */
	var BDArray = BDObject.extend({
		displayName: "BDArray",
		init: function( prop ) {
			this.BDType = "BDArray";
			this.keepSortedByAttribute = null;
			this.orderAscending = true;
			for (var i in prop) this[i] = prop[i];

			this._sortRequested = false;
			this._insideChangesBatch = false;
			this._data = [];
		},
		initWithArray: function( a ) {
			this._data = a;
			return this;
		},
		beginChanges: function() {
			if (!this._dispatchBindingNotifications) return;
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, this._data);
			this._dispatchBindingNotifications = false;
			this._insideChangesBatch = true;
		},
		commitChanges: function() {
			if (this._sortRequested) {
				this.sortByObjectAttribute( this.keepSortedByAttribute, this.orderAscending );
			}
			this._dispatchBindingNotifications = true;
			this._insideChangesBatch = false;
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, this._data);
		},
		sortByObjectAttribute: function( attr, asc ) {
			if (asc == undefined) asc = this.orderAscending;
			var sfn = null;
			if (asc) {
				sfn = function sortByAttr(a,b) {
					var x = a[attr];
					var y = b[attr];
					return ((x < y) ? -1: ((x > y) ? 1: 0));
				};
			} else {
				sfn = function sortByAttr(b,a) {
					var x = a[attr];
					var y = b[attr];
					return ((x < y) ? -1: ((x > y) ? 1: 0));
				};
			}
			this.sort( sfn );
			this._sortRequested = false;
		},
		sort: function( fn ) {
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate);
			this._data.sort(fn);
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate);
		},
		empty: function() {
			return this.splice(0);
		},
		push: function( d ) {
			this._sortRequested = (this.keepSortedByAttribute != null);
			if (this._sortRequested) {
				this._dispatchBindingNotifications = false;
			}
			
			if (d && typeof d == "object" && d.notifyObserversOfEvent) {
				(function(self, d) {
					d.addObserverForEvent( self, "propertyDidChange", function(b) {
						var _i = self.indexOfObject( d );
//						console.log("BDArray: binding event: propertyDidChange atIndex: "+_i);
						self.notifyObserversOfEvent("objectDidChangeAtIndex", {property:b.property, value: b.value, index: _i});
					});
				})(this, d);
			}
			
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, d);
			var rtn = this._data.push( d );
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, d);
			
			if (this._sortRequested && !this._insideChangesBatch) {
				this.commitChanges();
			}
			return rtn;
		},
		pop: function() {
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, d);
			var rtn = this._data.pop();
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, d);
			return rtn;
		},
		unshift: function( d ) {
			var _performSort = this._dispatchBindingNotifications;
			if (this.keepSortedByAttribute != null && _performSort) {
				this.beginChanges();
			}

			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, d);
			var rtn = this._data.unshift( d );
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, d);
			
			if (this.keepSortedByAttribute != null && _performSort) {
				this.sortByObjectAttribute(this.keepSortedByAttribute);
				this.commitChanges();
			}
			return rtn;
		},
		shift: function() {
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, d);
			var rtn = this._data.shift();
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, d);
			return rtn;
		},
		slice: function( start, end ) {
			return this._data.slice(start, end);
		},
		sliceAndStrip: function() {
			var a = this.slice(0);
			for (var i = 0, len = a.length; i < len; i++) {
				if (a[i] && a[i].BDType && a[i].typeIsEqualTo("BDObject")) {
					a[i] = a[i].toJSObject();
				}
			}
			return a;
		},
		splice: function(index, length, newObjs) {
			if (newObjs == undefined) newObjs = null;
			var rtn = null;
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, null);
			if (newObjs != null) {
				rtn = this._data.splice( index, length, newObjs );
			} else if ( length == undefined ) {
				rtn = this._data.splice( index );
			} else {
				rtn = this._data.splice( index, length );
			}
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, null);
			return rtn;
		},
		addObjectsAsBDObjects: function( objArray ) {
			return this.addObjects( objArray, true );
		},
		addObjects: function( objArray, convertToBDObject ) {
			var i = null;
			this.beginChanges();
			if (convertToBDObject) {
				for (i in objArray) this.push( BDObject.objectWithObject( objArray[i] ) );
			} else {
				for (i in objArray) this.push( objArray[i] );
			}
			if (this.keepSortedByAttribute != null) {
				this.sortByObjectAttribute(this.keepSortedByAttribute);
			}
			this.commitChanges();
		},
		addObject: function( obj ) {
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, obj);
			var rtn = this._data.push( obj );
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, obj);
			return rtn;
		},
		insertObjectAtIndex: function( obj, index ) {
			this.notifyObserversOfEvent(kBEvents.BDArray.willUpdate, null);
			var rtn = this._data.splice( index, 0, obj );
			this.notifyObserversOfEvent(kBEvents.BDArray.didUpdate, null);
			return rtn;
		},
		length: function() {
			return this._data.length;
		},
		count: function() {
			return this._data.length;
		},
		objectAtIndex: function( i ) {
			return this._data[i];
		},
		objectsWithSearch: function( fn ) {
			var res = $B.Array.create();
			this.forEach( function( obj ) {
				if (fn(obj)) res.push(obj);
			});
			return res;
		},
		removeObject: function( o ) {
			var i = this.indexOfObject( o );
			if (i > -1) {
				this.removeObjectAtIndex( i );
			}
		},
		removeObjectAtIndex: function( i ) {
			return this.splice( i, 1 );
		},
		containsObject: function(o) {
			return (this.indexOfObject(0) > -1);
		},
		indexOfObject: function(o) {
			for (var i = 0, len = this.length(); i < len; i++) {
				if (this._data[i] === o) return i;
			}
			return -1;
		},
		forEach: function( f ) {
			var r = null;
			for (var i = 0; i < this._data.length; i++ ) {
				r = f.call( this, this.objectAtIndex(i), i, this._data );
				if ( r === -1 ) break;
			}
		}
	});
	
	Bind.classes.BDArray = BDArray;
	$B.Array = {
		create: function( prop ) {
			return new BDArray( prop );
		},
		arrayWithArray: function( a ) {
			return new BDArray().initWithArray(a);
		}
	};
	
})($B);/** BDEventCore **/

(function() {

	'use strict';
	
	/**
	 * BDEventCore
	 * @constructor
	 * @extends BDObject
	 */
var BDEventCore = BDObject.extend({
	displayName: "BDEventCore",
	init: function( attr ) {
		if (attr && attr.quantum != undefined && typeof attr.quantum == "number") this.quantum = attr.quantum;
		else this.quantum = 1000;
		this._UActivityIdleDelay = 1000;
		this._UAStateIsIdle = true;
		this._events = [];
		this._timeOfDayEvents = [];
		this._UAEvents = [];
	},
	pushTimerEvent:function(e){
		var _length = this._events.length;
		this._events[_length] = e;
		e.index = _length;
		return _length;
	},
	pushTimeOfDayEvent:function(e){
		var _length = this._timeOfDayEvents.length;

		this._timeOfDayEvents[_length] = e;
		e.index = _length;
		return _length;
	},
	pushUserActivityEvent: function(e) {
		var _length = this._UAEvents.length;
		e.index = _length;
		this._UAEvents[_length] = e;
		return _length;
	},
	removeTimerEvent:function(index) {
		if (index != undefined){
			for (var i = 0; i<this._events.length; i++) {
				if (this._events[i].index == index && index != i) {
					index = i;
					break;
				}
			}
			this._events.splice(index,1);
		}
	},
	removeTimeOfDayEvent:function(index) {
		if (index != undefined){
			for (var i = 0; i<this._timeOfDayEvents.length; i++) {
				if (this._timeOfDayEvents[i].index == index && index != i) {
					index = i;
					break;
				}
			}
			this._timeOfDayEvents.splice(index,1);
		}
	},
	removeUserActivityEvent: function(index) {
		if (index != undefined){
			// search for the original event index to make sure the
			// correct event is removed from the events array.
			for (var i = 0; i<this._UAEvents.length; i++) {
				if (this._UAEvents[i].index == index && index != i) {
					console.log("found event "+index+" in location "+i);
					index = i;
					break;
				}
			}
			this._UAEvents.splice(index,1);
		}
	},
	removeUserActivityEventID: function(id) {
		if (id != undefined) {
			for (var i = 0; i<this._UAEvents.length; i++) {
				if (this._UAEvents[i].id == id) {
					index = i;
					console.log("removed event id: "+id);
					this._UAEvents.splice(index,1);
				}
			}
		}
	},
	createTimedEvent: function(d, r, f, id) {
		var _event_ = new TimerEvent(d,r,f);
		if (id != undefined) _event_.setID(id);
		return this.pushTimerEvent(_event_);
	},
	createTimeOfDayEvent: function(attr) {
		var _event_ = new TimeOfDayEvent(attr);
		return this.pushTimeOfDayEvent(_event_);
	},
	tick: function() {
		if (this.onDuty) {
			for(var e = 0; e < this._events.length; e++) {
				try {
					if (this._events[e].lastExec == undefined) this._events[e].lastExec = 0;
					if ((NOW() - this._events[e].lastExec) >= this._events[e].duration)
					this._events[e].fire();
				} catch (E) {
					$B.dialog.create({title:"EventCore Exception: Event "+e, content:E.message});
				}
			}
			var d = new Date();
			for (var e = 0; e < this._timeOfDayEvents.length; e++) {
				try {
					if (this._timeOfDayEvents[e].h == d.getHours() && this._timeOfDayEvents[e].m == d.getMinutes() && d.getSeconds() == 0)
						this._timeOfDayEvents[e].fire();
				} catch (E) {
					$B.dialog.create({title:"EventCore Exception: Time of Day Event "+e, content:E.message});
				}
			}
			var _ec_ = this;
		}
	},
	putOnDuty:function() {
		if (this.onDuty == true){
			return true;
		}
		var self = this;
		this.onDuty = true;
		this.timeout = setInterval(function() {
			self.tick()
		},this.quantum);
		this.tick();
	},
	takeOffDuty: function() {
		this.onDuty = false;
		clearInterval(this.timeout);
	},
	setGlobalUAListening: function(t) {
		var self = this;
		if (t == true) {
			window.addEventListener("mousemove", this.userActivityHandler, false);
			this.UAExitIdle();
			console.log("attaching UA Listener");
			//UIServer.eventCore.userActivityHandler();
		} else {
			window.removeEventListener("mousemove", this.userActivityHandler, false);
		}
	},
	setGlobalUAIdleDelay: function(ms) {
		this._UActivityIdleDelay = ms;
	},
	userActivityHandler: function(e) {
		//$B.mousemove(e);
		if (this._UAStateIsIdle == true) {
			this.exitIdle();
		} else {
			clearTimeout(this._UATimeout);
			//console.log("UA Hit: "+this._UAStateIsIdle);
			this._UATimeout = setTimeout(function() {
				self.enterIdle()
			}, this._UActivityIdleDelay);
		}
	},
	/**
	  * User activity timeout event. Notifies all views in the interface that we're in idle state
	  */
	enterIdle: function() {
		if (this._UAStateIsIdle == false) {
			this._UAStateIsIdle = true;
			//console.log("UA Entering Idle");
			$B.dispatchEvent("UserActivity:didEnterIdle");
			for (var i=0; i<this._UAEvents.length; i++) {
				if (this._UAEvents[i].trigger == "enterIdle") {
					this._UAEvents[i].fire();
				}
			}
		}
	},
	// !TODO: Check this!
	/**
	  * User activity resume event. Notifies all views in the interface that we're exiting idle state
	  *
	  */
	exitIdle: function() {
		if (this._UAStateIsIdle == true) {
			this._UAStateIsIdle = false;
			//console.log("UA Exiting Idle");
			$B.dispatchEvent("UserActivity:didBecomeActive");
			for (var i=0; i<this._UAEvents.length; i++) {
				if (this._UAEvents[i].trigger == "wakeFromIdle") {
					this._UAEvents[i].fire();
				}
			}
			clearTimeout(this._UATimeout);
			this.userActivityHandler();
		}
	}
});

Bind.classes.BDEventCore = BDEventCore;

var TimeOfDayEvent = function(attr) {
	for (var i in attr) this[i] = attr[i];
	this.fire = function(){
		this.action();
	};
	this.setID = function(id) {
		this.id = id;
	};	
};
var EventCoreEvent = function(attr) {
	for (var i in attr) this[i] = attr[i];
	this.fire = function() {
		this.action();
	};
	this.setID = function(id) {
	
	};
};
var TimerEvent = function(duration, repeat, action) {
	this.duration 	= duration;
	this.repeat		= repeat;
	this.action		= action;
	this.lastExec 	= 0;
	this.id			= "";
	this.fire = function(){
		this.lastExec = NOW();
		this.action();
		if (this.repeat != true) {
			//$T.BDEventCore.removeTimerEvent(this.index);
		}
	};
	this.setID = function(id) {
		this.id = id;
	};
};

$B.EventCore = new BDEventCore({ quantum: 1000 });

})($B);
/** BDFocusController **/

(function($B) {


	kB.KeyCodes = {
		ENTER: 13,
		SPACE: 32,
		LEFT:  37,
		UP:    38,
		RIGHT: 39,
		DOWN:  40
	}

	/**
	 * BDFocusController
	 * @constructor
	 * @extends BDObject
	 */
	var BDFocusController = BDObject.extend({
		displayName: "BDFocusController",
		init: function( prop ) {
			this.BDType = "BDFocusController";
			
			for (var i in prop) this[i] = prop[i];

		},
		enableKeyboardNavigation: function() {
			this.__keyListenerProxy = this.method('_keyHandler');
			window.addEventListener('keydown', this.__keyListenerProxy, false);
		},
		disableKeyboardNavigation: function() {
			window.removeEventListener('keydown', this.__keyListenerProxy, false);
		},
		setKeyboardNavigationEnabled: function(bool) {
			if (bool) return this.enableKeyboardNavigation();
			return this.disableKeyboardNavigation();
		},
		_keyHandler: function(evt) {
			var K = kB.KeyCodes,
				cF = $B.currentFocus();

			if (!cF) return;

			switch (evt.keyCode) {
				case K.UP:
					this.focusUp();
				break;
				case K.RIGHT:
					this.focusRight();
				break;
				case K.DOWN:
					this.focusDown();
				break;
				case K.LEFT:
					this.focusLeft();
				break;
				case K.ENTER:
				case K.SPACE:
					this.click();
				break;
			}
		},
		focusUp: function() {
			$B.currentFocus().focusUp();
		},
		focusRight: function() {
			$B.currentFocus().focusRight();
		},
		focusDown: function() {
			$B.currentFocus().focusDown();
		},
		focusLeft: function() {
			$B.currentFocus().focusLeft();
		},
		click: function() {
			$B.currentFocus().click();
		}
	});
	
	$B.focusController = new BDFocusController({});
	
})($B);/** BDFormatter **/

(function($B) {

	/**
	 * BDFormatter
	 * @constructor
	 * @extends BDObject
	 */
	var BDFormatter = BDObject.extend({
		displayName: "BDFormatter",
		init: function( prop ) {
			this.BDType = "BDFormatter";
			
			for (var i in prop) this[i] = prop[i];

		}
	});
	
	Bind.classes.BDFormatter = BDFormatter;
	
})($B);/** BDDateFormatter **/

(function($B) {

	'use strict';

	/**
	 * BDDateFormatter
	 * @constructor
	 * @extends BDFormatter
	 */
	var BDDateFormatter = Bind.classes.BDFormatter.extend({
		displayName: "BDDateFormatter",
		init: function( prop ) {
			this.BDType = "BDDateFormatter";
			
			for (var i in prop) this[i] = prop[i];

		}
	});
	
	Bind.classes.BDDateFormatter = BDDateFormatter;
	$B.DateFormatter = {
		create: function(p) {
			return new BDDateFormatter( p );
		}
	};
	
})($B);

LocalizedMonthShortNames = [{ en: "Jan", fr: "Jan" },{ en: "Feb", fr: "Fév" },{ en: "Mar", fr: "Mar" },
							{ en: "Apr", fr: "Avr" },{ en: "May", fr: "Mai" },{ en: "Jun", fr: "Juin" },
							{ en: "Jul", fr: "Juil" },{ en: "Aug", fr: "Août" },{ en: "Sept", fr: "Sept" },
							{ en: "Oct", fr: "Oct" },{ en: "Nov", fr: "Nov" }, { en: "Dec", fr: "Déc" }];

Date.prototype.toRelativeDateString = function() {
	var s = Math.floor(((NOW() - this.getTime())/1000));
	var l = $B.currentLanguage();
	var past = true;
	
	var prefix = (l == "fr" ? "il y a ":""),
		suffix = (l == "fr" ? "" : "ago"),
		tUnit  = "secs";
	if (s < 0) {
		suffix = (l == "fr" ? "dès maintenant" : "from now");
		prefix = "";
		s *= -1;
		past = false;
	}
	if (s == 1) tUnit = "sec";
	var m = Math.floor(s/60),
		h = Math.floor(s/3600),
		d = Math.floor(s/86400);
		
	if (past && d == 1) return (l == "fr" ? "hier" : "yesterday");
	if (!past && d == 1) return (l == "fr" ? "demain" : "tomorrow");
	if (d > 1) return prefix + d + " " + (l == "fr" ? "jours":"days") + " "+suffix;
	if (d == 1) return prefix + d + " " + (l == "fr" ? "jours":"day") + " "+suffix;
	if (h > 1) return prefix + h + " " + (l == "fr" ? "heures":"hours") +" "+suffix;
	if (h == 1) return prefix + h + " " + (l == "fr" ? "heure":"hour") + " "+suffix;
	if (m > 1) return prefix + m + " " + (l == "fr" ? "mins":"mins") + " "+suffix;
	if (m == 1) return prefix + m + " " + (l == "fr" ? "mins":"min") + " "+suffix;
	

	
	return prefix + s + " " +tUnit+" "+suffix;
};
Date.prototype.toLocalizedShortDateString = function() {
	return { en: LocalizedMonthShortNames[this.getMonth()]['en'] + " " + this.getDate() + ", " + this.getFullYear(), fr: LocalizedMonthShortNames[this.getMonth()]['fr'] + " " + this.getDate() + ", " + this.getFullYear() };
};
Date.prototype.timeSince = function() {
	return NOW() - this.getTime();
};
Date.prototype.secondsSince = function() {
	return this.timeSince()/1000;
};
Date.prototype.toFuzzyString = function() {
	var str = "",
		ss = this.secondsSince();

	if (ss < 5) {
		str = {en: "just now"};
	} else if (ss < 45) {
		str = {en: "a few seconds ago"};
	} else if (ss >= 45 && ss < 120) {
		str = {en: "about a minute ago"};
	} else {
		str = this.toRelativeDateString();
	}
	return str;
};
/** BDNumberFormatter **/

(function($B) {
	
	/**
	 * BDNumberFormatter
	 * @constructor
	 * @extends BDFormatter
	 */
	var BDNumberFormatter = Bind.classes.BDFormatter.extend({
		displayName: "BDNumberFormatter",
		init: function( prop ) {
			this.BDType = "BDNumberFormatter";
			
			for (var i in prop) this[i] = prop[i];

		}
	});
	
	Bind.classes.BDNumberFormatter = BDNumberFormatter;
	$B.DateFormatter = {
		create: function(p) {
			return new BDNumberFormatter( p );
		}
	};
	
})($B);
/** BDMessage **/

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.reverse = function(){return this.split("").reverse().join("");};
String.prototype.format = function() {
	var _a = arguments;
	return this.replace(/{([\d][^}]*)}/g, function() {
		var _p = arguments[1].split(','),
			_r = _p[0];
			if (_p.length > 1) {
				switch(_p[1].toLowerCase()) {
					case 'time':
						return _a[_r].toLocaleTimeString();
					break;
					case 'date':
						return _a[_r].toLocaleDateString();
					break;
				}
			}
		return _a[_r];
	});
};
/** BDResponder **/

(function($B){

	'use strict';

var BDResponder = BDObject.extend({
		displayName: "BDResponder",
		create: function( attr ) {
			return new BDResponder( attr );
		},
		init: function( attr ) {
		
		},
		/**
		  * Default InteractionBegan handler
		  */
		handleInteractionBegan: function( evt ) {
			evt.preventDefault();
			var self = this;
			this.__currentEvent = evt;
			this._shouldPerformActionOnTouchUp = true;
			this._interactionOffset = null;
			this._interactionOffset = { x: evt.offsetX, y: evt.offsetY };
			
			if (this.onClickHold != null) {
				this._clickHoldTO = setTimeout( function( evt ) {
					self.onClickHold.call( self, evt );
				}, self.clickHoldDelay);
				window.addEventListener( kB.InteractionMoved, function interactionMovedListener() {
					window.removeEventListener( kB.InteractionMoved, interactionMovedListener, false );
					clearTimeout(self._clickHoldTO);
				}, false);
			}

			if (this.actionOnMouseDown == true) {
				if (this.enabled && this.action != null) this.action.call(this, evt);
			}
			
			if (this.objectGroup != null) this.dispatchObjectGroupNotification();

			if (this.draggable) {
				if (this.action == null) {
					this.beginDrag();
				} else {
					var __moveListener = function __moveListener( evt ) {
						window.removeEventListener( kB.InteractionMoved, __moveListener, false);
						self._shouldPerformActionOnTouchUp = false;
						self.beginDrag();
					};
					// listen for first move to beginDrag
					window.addEventListener( kB.InteractionMoved, __moveListener, false);
				}
			}

			// listen for release to clean up
			window.addEventListener( kB.InteractionEnded, function interactionEndedListener(evt) {
				window.removeEventListener( kB.InteractionMoved, __moveListener, false);
				window.removeEventListener( kB.InteractionEnded, interactionEndedListener, false);
				self.handleInteractionEnded.call( self, evt );
			}, false);
		},
		/**
		  * Default InteractionEnd handler
		  */
		handleInteractionEnded: function( evt ) {
			var self = this;

			clearTimeout( this._clickHoldTO );
			window.removeEventListener( kB.InteractionEnded, this.handleInteractionEnded, false );
			window.removeEventListener( kB.InteractionMoved, this.__movedProxy, false );
			
			if (this.enabled && this._shouldPerformActionOnTouchUp && !this._performDropOnInteractionEnded && this.action != null) {
				this.action.call(this, evt);
			}

			if (this._performDropOnInteractionEnded && !this._shouldPerformActionOnTouchUp) {
				this.endDrag.call( this, evt );
			}

			this._shouldPerformActionOnTouchUp = false;
			this._performDropOnInteractionEnded = false;
			this.__currentEvent = null;
		},
		/**
		  * Default InteractionMoved handler
		  */
		handleInteractionMoved: function( evt ) {
			var self = this;
			this.top( evt.pageY-this._interactionOffset.y );
			this.left( evt.pageX-this._interactionOffset.x );
		},
		/**
		 * default InteractionOver handler
		 * Used with droppables.
		 * @param  {UserEvent} evt event from the interaction
		 */
		handleInteractionOver: function( evt ) {
			if (this._currentDraggables[0]._currentDroppable != this) {
				for (var i = 0, len=this._currentDraggables.length;i<len; i++) {
					this._currentDraggables[i]._currentDroppable = this;
				}
			}
			if (this._draggableIsHovering) return;
			this._draggableIsHovering = true;
			this.addClass("BDDroppableHover");
						
			this.requestScrollIntoView();

		},
		/**
		 * default InteractionOut handler.
		 * Used with droppables.
		 * @param  {UserEvent} evt event from the interaction
		 */
		handleInteractionOut: function( evt ) {
			var self = this;
			if (!this._draggableIsHovering) return;

			for (var i = 0, len=this._currentDraggables.length;i<len; i++) {
				// Cancel if another droppable has already taken position
				if (this._currentDraggables[i]._currentDroppable != this ) break;
				this._currentDraggables[i]._currentDroppable = null;
			}
			
			this._draggableIsHovering = false;
			this.removeClass("BDDroppableHover");
		},
		setFocusTargets: function( targets ) {
			if (!this.focusTargets) this.focusTargets = {};
			if (targets.up) {
				this.focusTargets.up = targets.up;
			}
			if (targets.right) {
				this.focusTargets.right = targets.right;
			}
			if (targets.down) {
				this.focusTargets.down = targets.down;
			}
			if (targets.left) {
				this.focusTargets.left = targets.left;
			}
		},
		focusUp: function() {
			if (this.onFocusUp != undefined) {
				if (typeof this.onFocusUp === "function") {
					this.onFocusUp();
				}
			}
 			if (this.focusTargets && this.focusTargets.up) {
				if (typeof this.focusTargets.up === "object") {
					this.focusTargets.up.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.up, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusRight: function() {
			if (this.onFocusRight != undefined) {
				if (typeof this.onFocusRight === "function") {
					this.onFocusRight();
				}
			}
 			if (this.focusTargets && this.focusTargets.right) {
				if (typeof this.focusTargets.right === "object") {
					this.focusTargets.right.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.right, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusDown: function() {
			if (this.onFocusDown != undefined) {
				if (typeof this.onFocusDown === "function") {
					this.onFocusDown();
				}
			}
 			if (this.focusTargets && this.focusTargets.down) {
				if (typeof this.focusTargets.down === "object") {
					this.focusTargets.down.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.down, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusLeft: function() {
			if (this.onFocusLeft != undefined) {
				if (typeof this.onFocusLeft === "function") {
					this.onFocusLeft();
				}
			}
 			if (this.focusTargets && this.focusTargets.left) {
				if (typeof this.focusTargets.left === "object") {
					this.focusTargets.left.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.left, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		}
		
});

	Bind.classes.BDResponder = BDResponder;

})($B);
/** BDViewController **/

(function($B) {

	'use strict';
	
	/**
	 * BDViewController
	 * @constructor
	 */

	var BDViewController = Bind.classes.BDResponder.extend({
		displayName: "BDViewController",
		/**
		 * should be called by any subclasses
		 * @param  {Object} attr attributes to be applied
		 * @return {BDViewController}
		 */
		init: function( attr ) {
			var self = this;
			if (!attr) attr = {};
			
			if (!this.BDType) this.BDType		= "BDViewController";
			this.localizations 					= null;
			this._clickHoldTO 					= null;
			this.onClickHold 					= null;
			this.action		 					= null;
			this.dynamicContent 				= null;
			this._subviewNamespace 				= null;
			this.namespace 						= null;
			this.clickHoldDelay 				= 500;
			this.draggable						= false;
			this.actionOnMouseDown 				= false;
			this.objectGroup 					= null;
			this._observationHandlers			= {};
			this._shouldPerformActionOnTouchUp  = false;
			this._performDropOnInteractionEnded = false;
			this.registerWithUIServer			= true;
			this.droppable						= false;
			this.accepts						= [];
			this.onDrop							= null;
			this._isPoppedOutOfDocFlow			= false;
			this.delegate						= null;
			this.namespace						= $B.currentNamespace();
			this.draggableOptions				= null;
			this._draggableOptions				= { clone: false, placeholder: false, placeInBody: true, popToRootFrame: false };
			
			this.initNewProperty('title', null);

			if (attr.view != null) {
				this._view = attr.view;
				delete attr.view;
			}

			var _superInit = this._super;

			this._viewWillInit( attr );
			for (var i in attr) this[i] = attr[i];

			attr.displayName = this.displayName;

			_superInit.call(this, attr);

			if (this.draggableOptions != null) {
				for (i in this.draggableOptions) this._draggableOptions[i] = this.draggableOptions[i];
			}
			this.draggableOptions = this._draggableOptions;
			
			if ( this.dynamicContent != null ) {
				if (typeof this.dynamicContent == "object") {
					if (this.dynamicContent.contentId == undefined) this.dynamicContent.contentId = this.id;

					if (this.dynamicContent.delegate) {
						var delegate = this.dynamicContent.delegate;
						delegate.registerDynamicViewsWithContentId( this, this.dynamicContent.contentId );
					}
				}
			}
			
			if (this._view == undefined || this._view == null) {
				this._view = $B.View.create({ id: this.id, customClass: this.customClass, title: this.title, margins: this.margins, visible: this.visible, controller: this, registerWithUIServer: false });
			}

			this.loadView( this._view );

			if ( this.enableTouchScrolling != undefined && this.enableTouchScrolling == true ) this.attachTouchScrolling();
	
	

			if (this.droppable) {
				this._currentDraggables = [];
				// We use observation system to prevent hard-links
				// between eventCenters and this
				this.addObservationHandler("BDDraggable:didBeginDrag", function( obj ) {
					this.name="dropListener_"+self.id;
					var thisAcceptsObject = !(self.accepts.length > 0);
					for (var i=0, len=self.accepts.length; i < len; i++) {
						if (obj.containsClass( self.accepts[i] ) ) {
							thisAcceptsObject = true;
							break;
						}
					}
					if (thisAcceptsObject) {
						self._currentDraggables = [obj];
						self.addClass("BDDroppableDropzone");
						self.beginListeningForHover();
					}
				});
				this.addObservationHandler("BDDraggable:didDropOnItem", function( data ) {
					self.endListeningForHover();
					if (self.containsClass("BDDroppableDropzone")) {
						self.removeClass("BDDroppableDropzone");
						if (self._draggableIsHovering) {
							// Check that a draggable is hovering
							if (self.onDrop != null) {
								// Call onDrop action
								self.onDrop.call(self, data);
							}
						}
					}
					self.handleInteractionOut();
				});
				
				$B.addObserverForEvent( this, "BDDraggable:didBeginDrag");
				$B.addObserverForEvent( this, "BDDraggable:didDropOnItem");
			}

			
			if (attr != undefined && this.registerWithUIServer == true) $B.registerViewController(this);

			if (this.delegate != null) {
				for (i in this.delegate) {
					this[i] = this.delegate[i];
				}
			}
		
			if ($B.currentViewToAttachSubviews() != null) {
				$B.currentViewToAttachSubviews().append( this.view() );
			}

			return this;
		},
		_viewWillInit: function( attr ) {
			if (this._didExecuteViewWillInit) return;
			this._didExecuteViewWillInit = true;
			return this.viewWillInit( attr );
		},
		viewWillInit: function() {

		},
		/**
		 * placeholder interface
		 * @return {[type]}
		 */
		refresh: 	function() {

		},
		identifyBaseClass: function() {
			return "BDObject";
		},
		identifyType: function() {
			return this.BDType;
		},
		assignDynamicContent: function( content ) {
			console.log(this.id + " assignDynamicContent "+content);
			switch (this.identifyType()) {
				case "BDTableViewController":
					this.setDataSource( content );
					this.reloadData();
				break;
				default:
					this.setContent( content );
			}
		},
		setContentFromUrl: function(aUrl) {
			var self = this;
			$B.ajax({ url:aUrl, type:"GET", onComplete: function(content) {
				self.setContent( content );
			} });
		},
		/**
		  * sets the innerHTML of this view to the provided string
		  * @param {string} newContent new html for the view
		  * @deprecated
		  */
		setContent:	function(content) {
			this.view().layer.innerHTML = content;
		},
// 		setTitle: function( t ) {
// 			this.view().setTitle( t );	
// 		},
		setSubviewNamespace: function( p ) {
			var pv = this.parentBDView();
			if (pv != null && pv.subviewNamespace() != null) {
				p = pv.subviewNamespace() + "_" + p;
			}
			this._subviewNamespace = p;
		},
		subviewNamespace: function() {
			return this._subviewNamespace;	
		},
		/**
		 * pops a View out of the document flow and positions it absolutely
		 * on the page. This is used for custom drag and drop implementations.
		 * @param  {Object} userOpts options include: placeholder (false), placeInBody (true), unpopOnDrop (true), popToRootFrame (false)
		 */
		pop: function( userOpts ) {
			// prevent double popping if there's a clickhold event
			if (this._isPoppedOutOfDocFlow) return;
			
			var ph, e, pE, s, i, opts, rootFrame, pL, pT;
			
			opts = { placeholder: false, placeInBody: true, unpopOnDrop: true, popToRootFrame: false };
			for (i in userOpts) opts[i] = userOpts[i];
			
			
			e = this.getElem();
			pE = e.parentNode;

			
			if (opts.clone) {
				ph = this.clone(true);
				opts.placeholder = true;
				console.log(ph);
			} else {
				ph = $B.View.create({ id: this.id+"_placeholder", registerWithUIServer: false });
				s = ph.getElem().style;
								
				if (this.getElem().style.position == "relative") {
					ph.setStyle('position', 'relative');
				}
					
				if ( opts.placeholder == true ) {
					ph.addClass("BDDraggablePlaceholder");			
				} else {
					setTimeout(function() {
						ph.animate('height', 0);
						ph.animate('width', 0);
					},20);
				}
				ph.opacity( 0 );
				ph.setStyle( 'webkitTransition', "opacity 0.1s ease-in-out");
				
				self = this;
				setTimeout( function() {
					ph.setStyle('opacity', 1);
				},10);

			}
			

			this._placeholder = ph;
			
			// Slightly smaller to prevent shifting other elements
			ph.width(this.width());
			ph.height(this.height());

			rootFrame = window;
			if (opts.popToRootFrame == true ) {
				if (window.frameElement) {
					pL = $B.getLeftOffset(window.frameElement);
					pT = $B.getTopOffset(window.frameElement);

					this.left(this.left() + pL);
					this.top(this.top() + pT);
				}
				rootFrame = $B.getRootFrame();
			}

			this._previousZIndex = this.zIndex();
			this.zIndex( $B.controlPopupWindowLevel() );

			pE.insertBefore( ph.getElem(), e );
			pE.removeChild( e );
						
			if (opts.placeInBody) {
				rootFrame.document.body.appendChild( e );
				e.__parentElement = rootFrame.document.body;
			}
			this.getElem().style.position = "absolute";
			

			this._isPoppedOutOfDocFlow = true;
		},
		/**
		 * places a View back into the document flow after it has been popped.
		 * @param  {object} opts no options implemented at this time
		 */
		unpop: function( opts ) {
			if (this._isPoppedOutOfDocFlow != true) return;
			var e = this.getElem(),
				pE = this._placeholder.getElem().parentNode;
			
			// Remove from body
			// use __parentElement to make sure we're using correct body
			if (e.__parentElement != undefined) {
				e.__parentElement.removeChild( e );
			} else if (e.parentNode != undefined && e.parentNode != null) {
				e.parentNode.removeChild( e );
			}
			
			pE.insertBefore( e, this._placeholder.getElem());
			pE.removeChild( this._placeholder.getElem() );
			
			
			if (this._previousZIndex != undefined) this.zIndex(this._previousZIndex);
			
			this._placeholder.destroy();
			this._placeholder = null;
			this._isPoppedOutOfDocFlow = false;
		},
		/**
		 * begin a drag operation attaching the view to the cursor location
		 * @param  {Object} userOpts options include: placeholder (false), placeInbody (true), popToRootFrame (false)
		 */
		beginDrag: function( userOpts ) {
			if (this._isPoppedOutOfDocFlow) return;

			$B.dispatchEvent("BDDraggable:willBeginDrag", this);

			
			var opts = this.draggableOptions;
			for (var i in userOpts) opts[i] = userOpts[i];
			this._currentDroppable = null;
			
			var pv = this.parentBDScrollView();
			if (pv != null) {
				pv.cancelScroll();
			}

			this.__dragOpts = opts;

			this.bakeFrame();

			this.pop( opts );
			this.addClass("dragging");


			$B.notifyObserversOfEvent("BDDraggable:didBeginDrag", this);

			var rootFrame = window;
			
			if (opts.popToRootFrame) {
				rootFrame = $B.getRootFrame();
			}

			var self = this;
			
			self.__movedProxy = function( evt ) { self.handleInteractionMoved.call( self, evt ); };
				
			self.__dragEndedProxy = function __dragEndedProxy( evt ) { 
				rootFrame.removeEventListener( kB.InteractionEnded, __dragEndedProxy, false );
				rootFrame.removeEventListener( kB.InteractionMoved, self.__movedProxy, false );
				self.handleInteractionEnded.call( self, arguments ); 
			};
			
			rootFrame.addEventListener( kB.InteractionMoved, self.__movedProxy, false );
			rootFrame.addEventListener( kB.InteractionEnded, self.__dragEndedProxy, false );
			this._performDropOnInteractionEnded = true;
			if (this.__currentEvent && this.__currentEvent != null) {
				if (rootFrame.$B.currentCursorLocation.x != 0 && rootFrame.$B.currentCursorLocation.x != 0) {
					this.top( rootFrame.$B.currentCursorLocation.y-this._interactionOffset.y );
					this.left( rootFrame.$B.currentCursorLocation.x-this._interactionOffset.x );
				}
				this.__movedProxy(this.__currentEvent);
			}
		},
		endDrag: function(evt) {
			//console.log(this.id+" - endDrag");

			$B.notifyObserversOfEvent("BDDraggable:willDrop", this);
			$B.dispatchNotification("BDDraggable:willDrop", this);
			$B.notifyObserversOfEvent("BDDraggable:willDropOnItem", { obj:this, 'evt':evt, target:this._currentDroppable, draggable: this, droppable:this._currentDroppable });

			this.removeClass("dragging");
			//this.getElem().style.position = "";
			this.unpop();
			this.unbakeFrame();
			if (this.__clone != undefined) this.__clone.destroy();

			$B.notifyObserversOfEvent("BDDraggable:didDrop", this);
			$B.dispatchEvent("BDDraggable:didDrop", this);
			$B.notifyObserversOfEvent("BDDraggable:didDropOnItem", { obj:this, 'evt':evt, target:this._currentDroppable, draggable: this, droppable:this._currentDroppable });
			
			this._currentDroppable = null;
	
		},
		/**
		 * informs this view to begin observing dragging objects to see if the pass
		 * within the bounds of this view. Emulates MouseOver/:hover when mouseover is not
		 * applied to CSS.
		 */
		beginListeningForHover: function() {
			var self = this;
			this.__interactionMovedProxy = function( evt ) {
				if (BDPointInRect({ x:evt.pageX, y:evt.pageY}, self.frame())) {
					if (!self._draggableIsHovering) {
						self.handleInteractionOver.call(self, evt);
					}
					return;
				}
				if (self._draggableIsHovering) {
					self.handleInteractionOut.call(self, evt);
				}
			
			};
			window.addEventListener( kB.InteractionMoved, this.__interactionMovedProxy, false );
		},
		/**
		 * stop observing dragging objects for hover.
		 */
		endListeningForHover: function() {
			if (this.__interactionMovedProxy) {
				window.removeEventListener( kB.InteractionMoved, this.__interactionMovedProxy, false );
			}
		},
		/**
		 * searches for and returns this view's parent BDScrollView
		 * @return {BDScrollView} theScrollView
		 */
		parentBDScrollView: function() {
			var view = null,
				v = this.getElem();
			while ( v.parentNode != null) {
				if (v.controller != undefined && v.controller.isDescendantOf("BDScrollView")) {
					view = v.controller;
					break;
				}
				v = v.parentNode;
			}
			return view;
		},
		/**
		  * returns the parent BDView controller object
		  */
		parentBDView: function() {
			try {
				var pE = this.getElem().parentNode;
				if (pE == null) return null;

				while (pE.controller == undefined && pE.parentNode != null) {
					pE = pE.parentNode;
				}
				return pE.controller;
			} catch (E) {
				console.log(this.id+" threw an error locating parentBDView:");
				console.log( E );
			}
		},
		/**
		  * convenience method for presentModalViewControllerAnimated:
		  * defaults to animated:true
		  * @param {BDView} viewController
		  * @see BDView#presentModalViewControllerAnimated
		  */
		presentModalViewController: function( vc ) {
			return this.presentModalViewControllerAnimated( vc, true );
		},
		/**
		  * performs necessary setup and actions to use a
		  * css animation to present a modal view
		  * @param {BDView} viewController
		  * @param {Boolean} [animated] defaults to false
		  */
		presentModalViewControllerAnimated: function( vc, animated ) {
			if (animated == undefined) animated = false;
			var _vc = null;
			if (vc.view && typeof vc.view == "function") {
				_vc = vc;
				vc = vc.view();
			}
			vc.addClass("BDModalView");

			if (vc.modal != undefined && vc.model == true) {	
				vc.modalBlackdrop = this.append( $B.View.create({ id: vc.id+"_blackdrop", customClass: "BDModalBackdrop", registerWith$B: false }) );
				if (animated == true) {
					vc.modalBlackdrop.opacity(0);
					setTimeout( function() {
						vc.modalBlackdrop.opacity(1.0);
					}, 10);
				}
			}
			if ( animated != undefined && (animated == true || animated == kB.ViewTransitionPushBottom) ) {
				setTimeout( function() {
					vc.addClass("open");
				}, 10);
			}
			this.modalViewController = vc;
			vc.parentViewController = this;
			if (_vc != null) _vc.parentViewController = this;
			this.view().append( vc );
		},
		/**
		  * dismisses current modal view controller
		  * @param {Boolean} [animated] defaults to false
		  */
		dismissModalViewController: function( animated ) {
			if (animated == undefined) animated = false;
			
			if (this.modalViewController != undefined) {
				if ( this.modalViewController.modalBlackdrop != undefined ) {
					this.modalViewController.modalBlackdrop.removeClass('open');
				}
				this.modalViewController.removeClass('open');
				var self = this;
				self.modalViewController.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
					self.modalViewController.getElem().removeEventListener( kB.CSSTransitionEnd, transitionEndListener, false );
					self.modalViewController.destroy();
					delete self.modalViewController;
				}, false);
			} else {
				console.log("NO MBDC found");
			}
		},
		setAction: function(a) {
			this.action = a;
		},
		takeFocus: function() {
			var obj = this;
			if (obj.indentifyType == undefined && obj.control != undefined) obj = obj.control;
			if (obj == undefined) return false;
			$B.currentFocus( obj );
			if (obj.onFocus != undefined) {
				if (typeof obj.onFocus == "string") eval(obj.onFocus);
				else obj.onFocus();
			}
		},
		releaseFocus: function() {
			var obj = this;
			if (obj.indentifyType == undefined && obj.control != undefined) obj = obj.control;
			if (obj == undefined) return false;
			if (obj.onBlur != undefined) {
				if (typeof obj.onBlur == "string") eval(obj.onBlur);
				else obj.onBlur();
			}
		},
		attachTouchScrolling: function() {
			var view = this;
			view.getElem().addEventListener('touchstart', function(evt) {
				view.startY = evt.targetTouches[0].pageY;
				view.initialScrollOffset = view.getElem().scrollTop;
				view.touchMove = function(evt) {
					var offset = view.startY - evt.targetTouches[0].pageY + view.initialScrollOffset;
					view.getElem().scrollTop = offset;
				};
				view.getElem().addEventListener('touchmove', view.touchMove, false);
			}, false);
			view.getElem().addEventListener('touchend', function(evt) {
			
				view.getElem().removeEventListener('touchmove', view.touchMove, false);			
				
			}, false);
		},
		switchLanguage: function(lang) {

		},
		beginSubviews: function() {
			this.view().beginSubviews();
			return this;
		},
		getElem: function() {
			return this.view().getElem();
		},
		view: function() {
			return this._view;
		},
		setView: function( v ) {
			this._view = v;
			return v;
		},
		loadView: function( v ) {
			this.setView( v );
			//this.view().init();
			return this._viewDidInit(this._view);
		},
		_viewDidInit: function(v) {
			if (this._didFinishInitFn != undefined) this._didFinishInitFn.apply( this, arguments );
			this.viewDidInit(v);
			this.viewDidLoad(v);
		},
		viewDidLoad: function() {
		
		},
		viewDidInit: function() {
		
		},
		setOnViewDidInit: function( fn ) {
			if (fn != undefined) {
				this._didFinishInitFn = fn;
			}		
		},
		/**
		 * placeholder interface
		 * called just before view is animated
		 */
		viewWillAnimate: function() {
			
		},
		/**
		 * placeholder interface
		 * called just after view animation
		 * is complete
		 */
		viewDidAnimate: function() {
			
		},
		/**
		 * placeholder interface
		 * called just before view is transitioned
		 * or injected
		 */
		viewWillAppear: function() {
			
		},
		/**
		 * placeholder function
		 * called just before view is transitioned out
		 * or destroyed
		 * @return {[type]}
		 */
		viewWillDisappear: function() {
			
		},
		/**
		 * placeholder function
		 * called just after the view finishes
		 * transitioning in or appeared
		 */
		viewDidAppear: function() {
			
		},
		/**
		 * placeholder function
		 * called just after removing from DOM
		 */
		viewDidDisappear: function() {
			
		},
		destroy: function() {
			this._view.destroy();
			$B.destroyViewController( this );
			this._super();
		}
	});
	
	Bind.classes.BDViewController = BDViewController;
	BDViewController.create = function( attr ) {
		return new BDViewController( attr );
	};
	$B.ViewController = {
		create: function (attr) {
			return new BDViewController( attr );
		}
	};
})($B);

/** BDView **/

(function($B) {

	'use strict';
	
	/**
	 * BDView
	 * @constructor
	 */

	var BDView = BDObject.extend({
		displayName: "BDView",
		create: function(attr) {
			return new BDView(attr);
		},
		/**
		 * should be called by any subclasses
		 * @param  {Object} attr attributes to be applied
		 * @return {BDView}
		 */
		init: function( attr ) {
			var self = this;
			
			if (attr != undefined && attr._scope != undefined) {
				self = attr._scope;
			}
			this.BDType 						= this.displayName;
			this.__animation 					= null;
			this._isVisible	 					= false;
			this.localizations 					= null;
			this._subWidgets 					= [];
			this._subViews   					= [];
			this._subObjects 					= [];
			this.enabled 						= true;
			this._clickHoldTO 					= null;
			this.onClickHold 					= null;
			this.action		 					= null;
			this.dynamicContent 				= null;
			this._subviewNamespace 				= null;
			this.namespace 						= null;
			this.clickHoldDelay 				= 500;
			this.draggable						= false;
			this.actionOnMouseDown 				= false;
			this.objectGroup 					= null;
			this._observationHandlers			= {};
			this._shouldPerformActionOnTouchUp  = false;
			this._performDropOnInteractionEnded = false;
			this._shouldIgnoreClicks			= false;
			this.registerWithUIServer			= true;
			this.useSpanElement					= false;
			this.retain							= false;
			this.droppable						= false;
			this.accepts						= [];
			this.focusTargets 					= {};
			this.onDrop							= null;
			this._isPoppedOutOfDocFlow			= false;
			this.delegate						= null;
			this.preventDoubleClick				= true;
			this.layoutType						= kB.ViewLayoutTypeStandard;
			this.namespace						= $B.currentNamespace();
			this.draggableOptions				= null;
			this._hasActionBeganListener		= false;
			this.scrollIntoViewOnDroppableHover = false;
			this._draggableOptions				= { clone: false, placeholder: false, placeInBody: true, popToRootFrame: false };
			
			for ( var i in attr ) this[i] = attr[i];
			
			if (this.usesCustomActionHandling == undefined) this.usesCustomActionHandling = false;
			
			if (this.draggableOptions != null) {
				for (i in this.draggableOptions) this._draggableOptions[i] = this.draggableOptions[i];
			}
			this.draggableOptions = this._draggableOptions;
			
			var fireViewDidInit = false;
			if (this.layer == undefined) {
				fireViewDidInit = true;
				if (this.useSpanElement) {
					this.layer = new Elem("span", this.id, "BDView");
				} else {
					this.layer = new Elem("div", this.id, "BDView");
				}
// 				if (this.draggable == true) {
// 					this.layer.setAttribute('draggable', true);
// 				}
				if (!this.usesCustomActionHandling && (this.action != null || this.onClickHold != null || this.draggable == true)) {
					this._hasActionBeganListener = true;
					self.layer.addEventListener( kB.InteractionBegan, function( evt ) {
						self.handleInteractionBegan.apply( self, arguments );
					}, false );
				}
				this.layer.control = this;
				this.layer.controller = this;
				this.layer.view   = this;
				this.layer.object = this;

			}
					 
			if (this.BDType == undefined) {
				this.BDType = "BDView";
			}

			if (this.customClass != undefined) {
				$B.addClass(this.layer, this.customClass);
			}
	
			if (this.content != undefined) {
				if (this.content.identifyType != undefined) {
					delete this.layer;
					this.layer = this.content.getElem();
				} else if (typeof this.content == "object") {
					delete this.layer;
					this.layer = this.content;
					try {
						this.content.parentNode.removeChild(this.content);
					} catch (E) { }
				} else {
					this.layer.innerHTML = this.content;
				}
	
				if (this.content.innerHTML != undefined) {
					this._defaultContent = this.content.innerHTML;
				} else {
					this._defaultContent = this.content;
				}
			}
			
			if (this.backgroundImage != undefined) {
				this.setBackgroundImage( this.backgroundImage );
			}
			
			if (this.visible != undefined && this.visible == false) {
				this.hide();
			}
	
			// set margins using the built-in
			// left, top, bottom, right methods
			if ( this.margins != undefined ) {
				this.layoutType = kB.ViewLayoutTypeMargins;
				for ( var m in this.margins ) {
					if (this[m]) {
						this[m]( this.margins[m] );
					}
				}
			}

			if (this.layoutType == kB.ViewLayoutTypeMargins) {
				this.layer.style.position = "absolute";
			}

			if ( this.enableTouchScrolling != undefined && this.enableTouchScrolling == true ) this.attachTouchScrolling();
	
	

			// if (this.namespace != null) {
			// 	this.setSubviewNamespace( this.namespace );
			// }

			if (this.droppable) {
				this._currentDraggables = [];
				// We use observation system to prevent hard-links
				// between eventCenters and this
				this.addObservationHandler("BDDraggable:didBeginDrag", function( obj ) {
					this.name="dropListener_"+self.id;
					var thisAcceptsObject = !(self.accepts.length > 0);
					for (var i=0, len=self.accepts.length; i < len; i++) {
						if (obj.containsClass( self.accepts[i] ) ) {
							thisAcceptsObject = true;
							break;
						}
					}
					if (thisAcceptsObject) {
						self._currentDraggables = [obj];
						self.addClass("BDDroppableDropzone");
						self.beginListeningForHover();
					}
				});
				this.addObservationHandler("BDDraggable:didDropOnItem", function( data ) {
					self.endListeningForHover();
					if (self.containsClass("BDDroppableDropzone")) {
						self.removeClass("BDDroppableDropzone");
						if (self._draggableIsHovering) {
							// Check that a draggable is hovering
							if (self.onDrop != null) {
								// Call onDrop action
								self.onDrop.call(self, data);
							}
						}
					}
					self.handleInteractionOut();
				});
				
				$B.addObserverForEvent( this, "BDDraggable:didBeginDrag");
				$B.addObserverForEvent( this, "BDDraggable:didDropOnItem");
			}

			if ( this.dynamicContent != null ) {
				if (typeof this.dynamicContent == "object") {
					if (this.dynamicContent.contentId == undefined) this.dynamicContent.contentId = this.id;

					if (this.dynamicContent.delegate) {
						var delegate = this.dynamicContent.delegate;
						delegate.registerDynamicViewsWithContentId( this, this.dynamicContent.contentId );
					}

				}
			}

	
			if (attr != undefined && attr.id != undefined && this.registerWithUIServer == true) $B.registerView(this);

			if (this.delegate != null) {
				for (i in this.delegate) {
					this[i] = this.delegate[i];
				}
			}
		
			if ($B.currentViewToAttachSubviews() != null) {
				$B.currentViewToAttachSubviews().append( this );
			}
			
			if (!self.__didSwitchLanguageHook) {
				$B.attachEventHook("$B:didSwitchLanguage", function(l, hook) {
					self.__didSwitchLanguageHook = hook;
					self.switchLanguage(l);
				});
			}

			this._viewDidInit();
			return this;
		},
		/**
		 * placeholder interface
		 * @return {[type]}
		 */
		refresh: 	function() {

		},
		/**
		  * force webkit to redraw view rect
		  */
		setNeedsDisplay: function() {
			// force webkit to redraw the view rect
			var transform = this.layer.style.webkitTransform;
			var self = this;
			this.layer.style.webkitTransform = "scale(1.0)";
			setTimeout( function() {
				self.div.style.webkitTransform = transform;
			}, 10);
		},
		/**
		 * placeholder interface
		 * called just before view is animated
		 */
		viewWillAnimate: function() {
			if (this.controller) {
				this.controller.viewWillAnimate();
			}
		},
		/**
		 * placeholder interface
		 * called just after view animation
		 * is complete
		 */
		viewDidAnimate: function() {
			if (this.controller) {
				this.controller.viewDidAnimate();
			}
		},
		/**
		 * placeholder interface
		 * called just before view is transitioned
		 * or injected
		 */
		viewWillAppear: function() {
			if (this.controller) {
				this.controller.viewWillAppear();
			}
		},
		/**
		 * placeholder function
		 * called just before view is transitioned out
		 * or destroyed
		 * @return {[type]}
		 */
		viewWillDisappear: function() {
			if (this.controller) {
				this.controller.viewWillDisappear();
			}
		},
		/**
		 * placeholder function
		 * called just after the view finishes
		 * transitioning in or appeared
		 */
		viewDidAppear: function() {
			if (this.controller) {
				this.controller.viewDidAppear();
			}
		},
		/**
		 * placeholder function
		 * called just after removing from DOM
		 */
		viewDidDisappear: function() {
			if (this.controller) {
				this.controller.viewDidDisappear();
			}
		},
		/**
		 * perform CSS animation with name
		 * define these animations in CSS with keyframes
		 * @param  {String} aniName name of the CSS animation as defined in the CSS file
		 */
		doCSSAnimation: function(aniName) {
			this.layer.style.webkitAnimationName = "";
			var self = this;
			setTimeout( function() {
				self.layer.style.webkitAnimationName = aniName;	
			}, 20);
			
		},
		/**
		  * hide the view (sets display:none)
		  */
		hide: function(execNotifs) {
			if (execNotifs == undefined) execNotifs = true;

			try {
				if (execNotifs) this.viewWillDisappear();
			} catch (E) {
				console.log(this.id+":viewWillDisappear: an error occurred:");	
				console.log(E);
			}
	
			this.layer.style.display = "none";
			
			if ($B.currentFocus() == this) $B.popFocus();
			this._isVisible = false;
	
			try {
				if (execNotifs) this.viewDidDisappear();
			} catch (E) {
				console.log(this.id+":viewDidDisappear: an error occurred:");	
				console.log(E);
			}
		},
		/**
		  * show the view (sets display:"" to restore CSS property)
		  */
		show: function(execNotifs) {
			if (execNotifs == undefined) execNotifs = true;

			try {
				if (execNotifs) this.viewWillAppear();
			} catch (E) {
				console.log(this.id+":viewWillAppear: an error occurred:");	
				console.log(E);
			}
			
			this.layer.style.display = "";
			this._isVisible = true;
			try {
				if (execNotifs) this.viewDidAppear();
			} catch (E) {
				console.log(this.id+":viewDidAppear: an error occurred:");	
				console.log(E);
			}
		},
		isVisible: function() {
			return this._isVisible;
		},
		/**
		  * hides the view with fadeOut animation powered by an BDAnimation
		  * @param {int} duration in ms
		  * @param function callback function where this is the view
		  */
		fadeOut: function(d, cb) {
			if (d == undefined) d = 250;
			var self = this;
			var o = this.opacity();
			if (o <= 0) return false;
			if (o == undefined || isNaN(o)) o = 1;
			var c = cb;
			if (this.__animation != null) {
				this.__animation.cancel();
			}
			this.__animation = $B.Animation.create({ id: this.id+"_fadeOut", target: this, attribute: 'opacity', from: o, to: 0, duration:d, callback: function() {
				self.hide(false);
				self.opacity(0);
				self.__animation = null;
				self.viewDidAnimate({ parameter: 'opacity' });
				self.viewDidDisappear();
				if (c != undefined) c.apply(self, arguments);
			}
			});
			this.viewWillDisappear();
			this.viewWillAnimate({ parameter: 'opacity', fromValue: o, toValue: 0 });
			this.__animation.begin();
		},
		/**
		  * shows the view with fadeIn animation powered by an BDAnimation
		  * @param {int} duration in ms
		  * @param function callback function where this is the view
		  */
		fadeIn: function(d, cb) {
			if (d == undefined) d = 250;
			var self = this;
			var c = cb;
			if (this.layer.style.display != "none" && this.opacity() == 1) return;
			this.show(false);
			this.opacity(0);
			if (this.__animation != null) {
				this.__animation.cancel();
			}
			this.__animation = $B.Animation.create({ id: this.id+"_fadeIn", target: this, attribute: 'opacity', from: 0, to: 1, duration:d, callback: function() {
				self.opacity(1);
				self.__animation = null;
				self.viewDidAnimate({ parameter: 'opacity' });
				self.viewDidAppear();
				if (c != undefined) c.apply(self, arguments);
			}
			});
			this.viewWillAppear();
			this.viewWillAnimate({ parameter: 'opacity', fromValue: 0, toValue: 1 });
			this.__animation.begin();
		},
		/**
		  * sets a value to the specified parameter
		  * @param {string} parameter to which to apply the value
		  * @param {Number|string} value
		  */
		setParam: function( p, v ) {
			this[p](v);
		},
		/**
		 * sets style attribute with css param and value
		 * @param {String} p JS name for CSS attribute
		 * @param {String} v CSS Value
		 */
		setStyle: function( p, v ) {
			this.getElem().style[p] = v;
		},
		/**
		  * makes best effort to return exact left position of element on the page
		  */
		getLeftOffset: function() {
			var cE = this.getElem();
			var l  = 0;
			do {
				l += cE.offsetLeft;
				if (cE.offsetParent == null) break;
				cE = cE.offsetParent;
			} while( cE != null && cE.tagName.toLowerCase() != "body");
			
			var sv = this.parentBDScrollView();
			if (sv) {
				l -= sv.getElem().scrollLeft;
			}
			
			return l;
		},
		/**
		  * makes best effort to return exact top position of element on the page
		  */
		getTopOffset: function() {
			var cE = this.getElem();
			var t  = 0;
			do {
				t += cE.offsetTop;
				if (cE.offsetParent == null) break;
				cE = cE.offsetParent;
			} while( cE != null && cE.tagName.toLowerCase() != "body");

			var sv = this.parentBDScrollView();
			if (sv) {
				t -= sv.getElem().scrollTop;
			}

			return t;
		},
		/**
		  * updates private frame variable for view which is used in
		  * several actions and animations on a view. There is typically
		  * no reason to call this method directly. It's invoked automatically.
		  */
		refreshFrame: function() {
			this._frame = {};
			this._frame.computedStyle = window.getComputedStyle( this.layer );
			this._frame.size = { width: parseInt(this._frame.computedStyle.width, 10), height: parseInt(this._frame.computedStyle.height, 10) };
			this._frame.origin = { x: 0, y: 0 };
			this._frame.origin.x = this.getLeftOffset();
			this._frame.origin.y = this.getTopOffset();
			this._frame.lastUpdateTime = NOW();

			if (this.layer.offsetHeight > this._frame.size.height) this._frame.size.height = this.layer.offsetHeight;
			if (this.layer.offsetWidth > this._frame.size.width) this._frame.size.width = this.layer.offsetWidth;

		},
		/**
		  * intelligently determines if it should call refreshFrame before
		  * returning the frame of the view
		  * @returns {BDRect} viewFrame
		  */
		frame: function() {
			if (this._frame == undefined) this.refreshFrame();
			if (NOW() - this._frame.lastUpdateTime > 250) this.refreshFrame();
			return this._frame;
		},
		setMargins: function( t, r, b, l, absL ) {
			this.detach();
			if (this.layoutType == kB.ViewLayoutTypeMargins) {
				this.layer.style.position = "absolute";
			}

			if (typeof t == "object") {
				for ( var m in this.margins ) {
					if (this[m]) this[m]( this.margins[m] );
				}
				return;
			}
			this.top(t);
			this.right(r);
			this.bottom(b);
			this.left(l);
			this.reattach();
		},
		convertRectToView: function( rect, view ) {
			var targetFrame = view.frame();
			return BDRectMake( 	rect.origin.x-targetFrame.origin.x,
								rect.origin.y-targetFrame.origin.y,
								rect.size.width, rect.size.height );
		},
		convertRectFromView: function( rect, view ){
			var sourceFrame = view.frame();
			return BDRectMake( 	rect.origin.x+sourceFrame.origin.x,
								rect.origin.y+sourceFrame.origin.y,
								rect.size.width, rect.size.height );
		},
		/**
		 * returns coordinate objects for each of the corners
		 * of the view frame. Corners are addressed as 
		 * topLeft, topRight, bottomRight, bottomLeft
		 * and each contain their own x and y.
		 * @return {Object}
		 */
		frameCorners: function() {
			return { 	
					topLeft: 	 { x: this.frame().origin.x, y: this.frame().origin.y },
					topRight: 	 { x: this.frame().origin.x + this.frame().size.width, y: this.frame().origin.y },
					bottomRight: { x: this.frame().origin.x + this.frame().size.width, y: this.frame().origin.y + this.frame().size.height },
					bottomLeft:  { x: this.frame().origin.x, y: this.frame().origin.y + this.frame().size.height }
				   };
		},
		/**
		 * calculates the offset of each frame corner from the 
		 * frame corners of the parent BDView. Note: this returns
		 * only the parent BDView not any parent element. This is 
		 * used to determine a view's offset inside a parent BDScrollView.
		 * 
		 * Corners are addressed as:
		 * topLeft, topRight, bottomRight, bottomLeft
		 * and each contain their own x and y relative to the parent's
		 * cooresponding corner.
		 * @return {Object}
		 */
		cornerOffsetVectors: function() {
			var c = this.frameCorners(),
				pSV = this.parentBDScrollView();

				if (pSV == null) {
					return {     topLeft: { x: 0, y: 0 },
							    topRight: { x: 0, y: 0 },
							 bottomRight: { x: 0, y: 0 },
							  bottomLeft: { x: 0, y: 0 }
							};
				}

			var pC = this.parentBDScrollView().frameCorners(),
				pEScrollLeft = pSV.getElem().scrollLeft,
				pEScrollTop = pSV.getElem().scrollTop,
				cVectors = {     topLeft: { x: c.topLeft.x - pC.topLeft.x - pEScrollLeft, y: c.topLeft.y - pC.topLeft.y - pEScrollTop },
							    topRight: { x: pC.topRight.x - c.topRight.x + pEScrollLeft, y: c.topRight.y - pC.topRight.y - pEScrollTop },
							 bottomRight: { x: pC.bottomRight.x - c.bottomRight.x + pEScrollLeft, y: pC.bottomRight.y - c.bottomRight.y + pEScrollTop },
							  bottomLeft: { x: c.bottomLeft.x - pC.bottomLeft.x - pEScrollLeft, y: pC.bottomLeft.y - c.bottomLeft.y + pEScrollTop }
							};
			return cVectors;
		},
		/**
		 * requests the parent BDScrollView to scroll to an offset
		 * that reveals the full frame of this view.
		 * @param  {Number} padding amount of padding to apply to prevent 
		 * the view from sitting on the edge after reveal. Defaults to 2/3
		 * of this view's width.
		 */
		requestScrollIntoView: function( padding ) {
			if (padding == undefined) padding = this.width()*0.667;			
			var offset = { x: 0, y: 0 };
			var pSV = this.parentBDScrollView();

			if (pSV != null && pSV.allowWheelScroll == true && $B.device.isPointerDriven()) {
				try {
					this.getElem().scrollIntoView();
				} catch (E) {}
				return;
			}
			
			// force refreshFrame
			this.refreshFrame();
			if (pSV) {
				pSV.refreshFrame();
			}
			
			// Calc corner vectors, if any vectors are < 0
			// a scroll is needed
			var cVectors = this.cornerOffsetVectors();
			// scroll left
			if (cVectors.topLeft.x < 0) {
				offset.x = -1*cVectors.topLeft.x;				 
			} 
			// scroll right
			else if (cVectors.bottomRight.x < 0) {
				offset.x = cVectors.bottomRight.x;
			}
			// scroll top
			if (cVectors.topLeft.y < 0) {
				offset.y = -1*cVectors.topLeft.y;
			}
			// scroll bottom
			else if (cVectors.bottomRight.y < 0) {
				offset.y = cVectors.bottomRight.y;
			}
			
			if (offset.x != 0 || offset.y != 0) {
				if (offset.x < 0) offset.x -= padding;
				else offset.x += padding;
				if (offset.y < 0) offset.y -= padding;
				else offset.y += padding;
				
				if (pSV) {
					pSV.setOffsetWithDelta( offset );
				}
			}
		},
		/**
		  * creates and performs an BDAnimation on a specified parameter to a new targetValue
		  * @param {string} parameter to which animation should be applied
		  * @param {Number} targetValue
		  * @param {object} [params] object containing additional parameters: duration, curve
		  * @param function [aCallback] function to call when animation is complete
		  */
		animate: function( param, targetValue, params, aCallback ) {
			var _p = { duration: 300, curve: "ease-in-out" };
			for (var i in params) _p[i] = params[i];
			var self = this;
			var animation = $B.Animation.create({ id: this.id+"_animation", target: this, attribute: param, from: this[param](), to: targetValue, duration: _p.duration, curve: _p.curve, callback: function() {
				if (aCallback != undefined) aCallback.apply( self, arguments );
				self.viewDidAnimate({ parameter: param });
			} });
			this.viewWillAnimate({ parameter: param, fromValue: this[param](), toValue: targetValue });
			animation.begin();
		},
		/**
		  * applies an BDRect to the view
		  * @param {BDRect} aRect
		  * @see BDRectMake
		  */
		setFrame: function( aRect ) {
			this.top( aRect.origin.y );
			this.left( aRect.origin.x );
			this.width( aRect.size.width );
			this.height( aRect.size.height );
			this.refreshFrame();
		},
		/**
		  * sets width and height of the view
		  * @param {Number} width
		  * @param {Number} height
		  * @see BDView#width
		  * @see BDView#height
		  */
		setSize: function( w, h ) {
			this.width( w );
			this.height( h );
		},
		/**
		  *	Applies absolute dimensions to the
		  * element based on the current
		  * document flow. Used for
		  * popping an an element out of
		  * the document flow.
		  **/
		bakeFrame: function() {
			this.refreshFrame();
			this.width( this.width() );
			this.height( this.height() );
			this.top( this.getTopOffset() );
			this.left( this.getLeftOffset() );
		},
		/**
		  * clears an element's style attribute
		  * returning it to document flow
		  **/
		unbakeFrame: function() {
			this.getElem().removeAttribute("style");
			var cn = this.getElem().className;
			this.getElem().className = "";
			this.getElem().className = cn;
		},
		/**
		  * sets top and left corner
		  * @param {Number} x
		  * @param {Number} y
		  * @see BDView#top
		  * @see BDView#left
		  */
		setOrigin: function( x, y ) {
			this.top( y );
			this.left( x );
		},
		/**
		 * Returns whether or not this view contain any CSS classes
		 * that match the supplied String.
		 * @param  {String} c CSS class to look for
		 * @return {Boolean}
		 */
		containsClass: function( c ) {
			return $B.containsClass( this.getElem(), c );
		},
		/**
		  * adds specified className to this view if not already included
		  * @param {string} className
		  */
		addClass: function( c )
		{
			$B.addClass(this.getElem(), c);
		},
		/**
		  * removes specified className to this view if present
		  * @param {string} className
		  */
		removeClass: function( c )
		{
			$B.removeClass(this.getElem(), c);
		},
		/**
		  * toggles specified className to this view
		  * @param {string} className
		  */
		toggleClass: function( c )
		{
			$B.toggleClass( this.getElem(), c );
		},
		/**
		  * appends this view to the document body
		  */
		inject:		function() {
			document.body.appendChild(this.layer);
		},
		/**
		  * removes this view from the document body
		  */
		remove:		function() {
			document.body.removeChild(this.layer);
		},
		setOnViewDidInit: function(fn) {
			if (fn != undefined) {
				this._didFinishInitFn = fn;
				return;
			}		
		},
		_viewDidInit: function() {
			if (this._didFinishInitFn != undefined) this._didFinishInitFn.apply( this, arguments );
			return this.viewDidInit();
		},
		viewDidInit: function() {
		
		},
		assignDynamicContent: function( content ) {
// 			console.log(this.id + " assignDynamicContent "+content);
// 			console.log(content);

			if (this.dynamicContent.assignToProperty) { 
				this[this.dynamicContent.assignToProperty] = content;
				return;
			}

			switch (this.identifyType()) {
				case "BDImageView":
				case "BDMovieView":
					this.load( content );
				break;
				case "BDButton":
				case "BDLabel":
					this.setText( content );
				break;
				case "BDTextField":
				case "BDTextArea":
					this.setValue( content );
				break;
				case "BDTableView":
					this.setDataSource( content );
					this.reloadData();
				break;
				default:
					this.setContent( content );
			}
		},
		reloadDynamicContent: function() {
			if (!(this.dynamicContent)) return;
			var content = this.dynamicContent.delegate.contentWithId( this.dynamicContent.contentId );
		
			this.assignDynamicContent( content );
		},
		setContentFromUrl: function(aUrl) {
			var self = this;
			$B.ajax({ url:aUrl, type:"GET", onComplete: function(content) {
				self.setContent( content );
			} });
		},
		/**
		  * sets the innerHTML of this view to the provided string
		  * @param {string} newContent new html for the view
		  * @deprecated
		  */
		setContent:	function(content) {
			this.layer.innerHTML = content;
		},
		/**
		  * sets the class attribute of this view to the provided string
		  * overwriting any existing classes
		  * @param {string} className CSS class
		  */
		setClass: function(className) {
			this.layer.setAttribute("class", className);
		},
		/**
		  * sets the backgroundImage style attribute of this view to the provided url
		  * overwriting any css backgroundImages
		  * @param {string} url path to background image relative to the current page
		  */
		setBackground: function(url) {
			this.layer.style.backgroundImage = "url("+url+")";
			this.layer.style.backgroundRepeat = "no-repeat";
		},
		/**
		 * sets the background color of the view via style.backgroundColor
		 * @param {CSS Color} color CSS color to apply to the background
		 */
		setBackgroundColor: function( color ) {
			this.getElem().style.backgroundColor = color;
		},
		/**
		 * fetches computed style data and returns it.
		 * Note: Because this relies on window.getComputedStyle it is only
		 * available while the view is in the DOM.
		 * @return {Object}
		 */
		getComputedStyle: function() {
			return window.getComputedStyle( this.getElem() );
		},
		/**
		 * fetches computed style and returns the value for particular attribute.
		 * @param  {String} attr attribute to fetch
		 * @return {Value}
		 */
		getStyleSheetAttribute: function( attr ) {
			return this.getComputedStyle()[attr];
		},
		/**
		  * registers this view with the $B.
		  * this method is typically called automatically and
		  * rarely requires manual calling
		  */
		register: function() {
			$B.registerView(this);
		},
		/**
		  * informs the view to NOT fire any actions on kB.InteractionEnded
		  */
		cancelEvents: function() {
			this._shouldPerformActionOnTouchUp = false;
		},
		/**
		  * removes the view from the DOM and recursively cleans up memory footprint
		  * @see BDView#destroySubObjects
		  */
		destroy: function() {
			try {
				if (this.getElem().parentNode != null) {
					this.getElem().parentNode.removeChild(this.getElem());
				}
			} catch (E) {
				console.log("  Unable to remove BDView:"+this.id+" from DOM because: "+E.message);
			}
			
			this.destroySubObjects();
			this.removeAllObservations();
			$B.destroyView(this);
		},
		/**
		  * destroys any objects registered as children of this view
		  */
		destroySubObjects: function() {
			//var _subObjects = this.getSubTMObjects();
			if (this.retain) return;

			if (DEBUG_MODE) console.log(">>"+this.identifyType()+":"+this.id+" was asked to destroySubObjects. "+this._subObjects.length+" objects found.");
			for (var i = 0, len = this._subObjects.length; i < len; i++) {
				if (this._subObjects[i] != undefined && this._subObjects[i].destroy != undefined) {
					try {
						this._subObjects[i].destroy();
					} catch (E) {}
				}
				this._subObjects[i] = null;
			}
			this._subObjects = [];
			if (DEBUG_MODE) console.log("<<"+this.identifyType()+":"+this.id+" didFinish destroySubObjects");
		},
		isDescendantOf: function( t ) {
			return (this.identifyType() == t);
		},
		/**
		  * identifies the type of the BDView
		  * @return {string} viewType
		  */
		identifyType: function() {
			return this.BDType;
		},
		/**
		  * identifies the type of the BDView with view id
		  * @return {string} viewType:id
		  */
		identify: function() {
			return this.BDType+":"+this.id;
		},
		identifyBaseClass: function() {
			return "BDView";
		},
		/**
		  * adds a view or element to the beginning of this View
		  */
		prepend: function(child) {
			if (child.identifyType != undefined){
				if (child.identifyBaseClass() == "BDView") {
					this._subViews[this._subViews.length] = child;
				} else if (child.identifyBaseClass() == "BDControl") {
					this._subWidgets[this._subWidgets.length] = child;
				}

				this.layer.insertBefore(child.getElem(), this.layer.childNodes[0]);
			} else {
				try {
					if (child.control != undefined) {
						var obj = child.control;
					} else {
						obj = child.view;
					}
					if (obj.identifyBaseClass() == "BDView") {
						this._subViews[this._subViews.length] = obj;
					} else if (obj.identifyBaseClass() == "BDControl") {
						this._subWidgets[this._subWidgets.length] = obj;
					}
				} catch (E) { }

				try {
				this.layer.parentNode.insertBefore(child, this.layer.childNodes[0]);
				} catch (E) {
					if (DEBUG_MODE) console.log("CAUGHT EXCEPTION: "+this.id+".append("+child.id+")");
					if (DEBUG_MODE) console.log(this);
					if (DEBUG_MODE) console.log(child);
				}
			}
		},
		/**
		  * adds a view or element to this View
		  * @return {object} theChildObject
		  * @see BDView#append
		  */
		addSubview: function( child ) {
			return this.append( child );
		},
		/**
		  * adds a view or element to this View
		  * @return {object} theChildObject
		  */
		append: function(child) {
			if (child.identifyType != undefined){
				if (child.identifyBaseClass() == "BDView") {
					this._subViews[this._subViews.length] = child;
				} else if (child.identifyBaseClass() == "BDControl") {
					this._subWidgets[this._subWidgets.length] = child;
				}
				this._subObjects.push(child);
				// if (this.subviewNamespace() != null) {
				// 	child.id = this.subviewNamespace() + child.id;
				// 	child.setSubviewNamespace( this.subviewNamespace() );
				// }

				this.layer.appendChild(child.getElem());
			} else {
				try {
					if (child.control != undefined) {
						var obj = child.control;
					} else {
						obj = child.view;
					}
	
					// if (this.subviewNamespace() != null) {
					// 	obj.id = this.subviewNamespace() + obj.id;
					// 	obj.setSubviewNamespace( this.subviewNamespace() );
					// }
					if (obj != undefined){
						this._subObjects.push(obj);
						if (obj.identifyBaseClass() == "BDView") {
							this._subViews[this._subViews.length] = obj;
						} else if (obj.identifyBaseClass() == "BDControl") {
							this._subWidgets[this._subWidgets.length] = obj;
						}
					}
				} catch (E) { }

				try {
					this.layer.appendChild(child);
				} catch (E) {
					if (DEBUG_MODE) console.log("CAUGHT EXCEPTION: "+this.id+".prepend("+child.id+")");
					if (DEBUG_MODE) console.log(this);
					if (DEBUG_MODE) console.log(child);
				}
			}
			return child;
		},
		/**
		 * temporarily removes the View from the DOM to make editing
		 * child elements much more efficient. Remembers location in
		 * DOM to re-attach later
		 * @see BDView#reattach
		 */
		detach: function() {
			if (this.layer.parentNode == undefined) return;
			this._detachParent = this.layer.parentNode;
			this._detachParent.removeChild( this.layer );
		},
		/**
		 * re-inserts the View into the DOM after using detach.
		 * @see BDView#detach
		 */
		reattach: function() {
			if (this._detachParent == undefined) return;
			this._detachParent.appendChild( this.layer );
		},
		setSubviewNamespace: function( p ) {
			var pv = this.parentBDView();
			if (pv != null && pv.subviewNamespace() != null) {
				p = pv.subviewNamespace() + "_" + p;
			}
			this._subviewNamespace = p;
		},
		subviewNamespace: function() {
			return this._subviewNamespace;	
		},
		/**
		  * sets the backgroundImage style attribute of this view to the provided url
		  * overwriting any css backgroundImages
		  * @param {string} url path to background image relative to the current page
		  */
		setBackgroundImage: function( src ) {
			this.backgroundImage = src;
			this.getElem().style.backgroundImage = "url("+src+")";
		},
		/**
		  * sets the innerHTML of this view to the provided string
		  * @param {string} newContent new html for the view
		  * @deprecated
		  */
		html: function(h) {
			if (h == undefined) return this.layer.innerHTML;
			this.layer.innerHTML = h;
		},
		/**
		  * Default InteractionBegan handler
		  */
		handleInteractionBegan: function( evt ) {
			evt.preventDefault();
			if (this._shouldIgnoreClicks) return;
			var self = this;
			this.__currentEvent = evt;
			this._shouldPerformActionOnTouchUp = true;
			this._interactionOffset = null;
			this._interactionOffset = { x: evt.offsetX, y: evt.offsetY };
			
			if (this.onClickHold != null) {
				this._clickHoldTO = setTimeout( function( evt ) {
					self.onClickHold.call( self, evt );
				}, self.clickHoldDelay);
				window.addEventListener( kB.InteractionMoved, function interactionMovedListener() {
					window.removeEventListener( kB.InteractionMoved, interactionMovedListener, false );
					clearTimeout(self._clickHoldTO);
				}, false);
			}

			if (this.objectGroup != null) this.dispatchObjectGroupNotification();

			if (this.actionOnMouseDown == true) {
				if (this.enabled && this.action != null) this.action.call(this, evt);
				this._shouldPerformActionOnTouchUp = false;
			}
			
			if (this.draggable) {
				if (this.action == null) {
					this.beginDrag();
				} else {
					var __moveListener = function __moveListener( evt ) {
						window.removeEventListener( kB.InteractionMoved, __moveListener, false);
						self._shouldPerformActionOnTouchUp = false;
						self.beginDrag();
					};
					// listen for first move to beginDrag
					window.addEventListener( kB.InteractionMoved, __moveListener, false);
				}
			}

			// listen for release to clean up
			window.addEventListener( kB.InteractionEnded, function interactionEndedListener(evt) {
				window.removeEventListener( kB.InteractionMoved, __moveListener, false);
				window.removeEventListener( kB.InteractionEnded, interactionEndedListener, false);
				self.handleInteractionEnded.apply( self, arguments );
			}, false);
		},
		/**
		  * Default InteractionEnd handler
		  */
		handleInteractionEnded: function( evt ) {
			var self = this;

			clearTimeout( this._clickHoldTO );
			window.removeEventListener( kB.InteractionEnded, this.handleInteractionEnded, false );
			window.removeEventListener( kB.InteractionMoved, this.__movedProxy, false );
			
			if (this.enabled && this._shouldPerformActionOnTouchUp && !this._performDropOnInteractionEnded && this.action != null) {
				try {
					this.action.call(this, evt);
				} catch (E) {
					console.log("An error occurred while executing action bound to view: "+this.id);
					console.log(E);
				}
			}

			if (this._performDropOnInteractionEnded && !this._shouldPerformActionOnTouchUp) {
				this.endDrag.call( this, evt );
			}

			if (this.preventDoubleClick) {
				this._shouldIgnoreClicks = true;
				setTimeout( function() {
					self._shouldIgnoreClicks = false;
				}, 300);
			}
			this._shouldPerformActionOnTouchUp = false;
			this._performDropOnInteractionEnded = false;
			this.__currentEvent = null;
		},
		/**
		  * Default InteractionMoved handler
		  */
		handleInteractionMoved: function( evt ) {
			var self = this;
			this.top( evt.pageY-this._interactionOffset.y );
			this.left( evt.pageX-this._interactionOffset.x );
		},
		/**
		 * default InteractionOver handler
		 * Used with droppables.
		 * @param  {UserEvent} evt event from the interaction
		 */
		handleInteractionOver: function( evt ) {
			if (this._currentDraggables[0]._currentDroppable != this) {
				for (var i = 0, len=this._currentDraggables.length;i<len; i++) {
					this._currentDraggables[i]._currentDroppable = this;
				}
			}
			if (this._draggableIsHovering) return;
			this._draggableIsHovering = true;
			this.addClass("BDDroppableHover");
			
			if (this.scrollIntoViewOnDroppableHover) {
				this.requestScrollIntoView();
			}

		},
		/**
		 * default InteractionOut handler.
		 * Used with droppables.
		 * @param  {UserEvent} evt event from the interaction
		 */
		handleInteractionOut: function( evt ) {
			var self = this;
			if (!this._draggableIsHovering) return;

			for (var i = 0, len=this._currentDraggables.length;i<len; i++) {
				// Cancel if another droppable has already taken position
				if (this._currentDraggables[i]._currentDroppable != this ) break;
				this._currentDraggables[i]._currentDroppable = null;
			}
			
			this._draggableIsHovering = false;
			this.removeClass("BDDroppableHover");
		},
		/**
		 * pops a View out of the document flow and positions it absolutely
		 * on the page. This is used for custom drag and drop implementations.
		 * @param  {Object} userOpts options include: placeholder (false), placeInBody (true), unpopOnDrop (true), popToRootFrame (false)
		 */
		pop: function( userOpts ) {
			// prevent double popping if there's a clickhold event
			if (this._isPoppedOutOfDocFlow) return;
			
			var ph, e, pE, s, i, opts, rootFrame, pL, pT;
			
			opts = { placeholder: false, placeInBody: true, unpopOnDrop: true, popToRootFrame: false };
			for (i in userOpts) opts[i] = userOpts[i];
			
			
			e = this.getElem();
			pE = e.parentNode;

			
			if (opts.clone) {
				ph = this.clone(true);
				opts.placeholder = true;
				console.log(ph);
			} else {
				ph = $B.View.create({ id: this.id+"_placeholder", registerWithUIServer: false });
				s = ph.getElem().style;
								
				if (this.getElem().style.position == "relative") {
					ph.setStyle('position', 'relative');
				}
					
				if ( opts.placeholder == true ) {
					ph.addClass("BDDraggablePlaceholder");			
				} else {
					setTimeout(function() {
						ph.animate('height', 0);
						ph.animate('width', 0);
					},20);
				}
				ph.opacity( 0 );
				ph.setStyle( 'webkitTransition', "opacity 0.1s ease-in-out");
				
				self = this;
				setTimeout( function() {
					ph.setStyle('opacity', 1);
				},10);

			}
			

			this._placeholder = ph;
			
			// Slightly smaller to prevent shifting other elements
			ph.width(this.width());
			ph.height(this.height());

			rootFrame = window;
			if (opts.popToRootFrame == true ) {
				if (window.frameElement) {
					pL = $B.getLeftOffset(window.frameElement);
					pT = $B.getTopOffset(window.frameElement);

					this.left(this.left() + pL);
					this.top(this.top() + pT);
				}
				rootFrame = $B.getRootFrame();
			}

			this._previousZIndex = this.zIndex();
			this.zIndex( $B.controlPopupWindowLevel() );

			pE.insertBefore( ph.getElem(), e );
			pE.removeChild( e );
						
			if (opts.placeInBody) {
				rootFrame.document.body.appendChild( e );
				e.__parentElement = rootFrame.document.body;
			}
			this.getElem().style.position = "absolute";
			

			this._isPoppedOutOfDocFlow = true;
		},
		/**
		 * places a View back into the document flow after it has been popped.
		 * @param  {object} opts no options implemented at this time
		 */
		unpop: function( opts ) {
			if (this._isPoppedOutOfDocFlow != true) return;
			var e = this.getElem(),
				pE = this._placeholder.getElem().parentNode;
			
			// Remove from body
			// use __parentElement to make sure we're using correct body
			if (e.__parentElement != undefined) {
				e.__parentElement.removeChild( e );
			} else if (e.parentNode != undefined && e.parentNode != null) {
				e.parentNode.removeChild( e );
			}
			
			pE.insertBefore( e, this._placeholder.getElem());
			pE.removeChild( this._placeholder.getElem() );
			
			
			if (this._previousZIndex != undefined) this.zIndex(this._previousZIndex);
			
			this._placeholder.destroy();
			this._placeholder = null;
			this._isPoppedOutOfDocFlow = false;
		},
		/**
		 * begin a drag operation attaching the view to the cursor location
		 * @param  {Object} userOpts options include: placeholder (false), placeInbody (true), popToRootFrame (false)
		 */
		beginDrag: function( userOpts ) {
			if (this._isPoppedOutOfDocFlow) return;

			$B.dispatchEvent("BDDraggable:willBeginDrag", this);

			
			var opts = this.draggableOptions;
			for (var i in userOpts) opts[i] = userOpts[i];
			this._currentDroppable = null;
			
			var pv = this.parentBDScrollView();
			if (pv != null) {
				pv.cancelScroll();
			}

			this.__dragOpts = opts;

			this.bakeFrame();

			this.pop( opts );
			this.addClass("dragging");


			$B.notifyObserversOfEvent("BDDraggable:didBeginDrag", this);

			var rootFrame = window;
			
			if (opts.popToRootFrame) {
				rootFrame = $B.getRootFrame();
			}

			var self = this;
			
			self.__movedProxy = function( evt ) { self.handleInteractionMoved.call( self, evt ); };
				
			self.__dragEndedProxy = function __dragEndedProxy( evt ) { 
				rootFrame.removeEventListener( kB.InteractionEnded, __dragEndedProxy, false );
				rootFrame.removeEventListener( kB.InteractionMoved, self.__movedProxy, false );
				self.handleInteractionEnded.call( self, arguments ); 
			};
			
			rootFrame.addEventListener( kB.InteractionMoved, self.__movedProxy, false );
			rootFrame.addEventListener( kB.InteractionEnded, self.__dragEndedProxy, false );
			this._performDropOnInteractionEnded = true;
			if (this.__currentEvent && this.__currentEvent != null) {
				if (rootFrame.$B.currentCursorLocation.x != 0 && rootFrame.$B.currentCursorLocation.x != 0) {
					this.top( rootFrame.$B.currentCursorLocation.y-this._interactionOffset.y );
					this.left( rootFrame.$B.currentCursorLocation.x-this._interactionOffset.x );
				}
				this.__movedProxy(this.__currentEvent);
			}
		},
		clone: function( recursive ) {
			if (recursive == undefined) recursive = true;
			var viewType = this.identifyType();
			if (viewType.indexOf("V") == 0) viewType = viewType.split("V")[1];
			
			var opts = {};
			for (var i in this) {
				if (i == "id" || i == "layer" || i == "_input") continue;
				if (typeof this[i] != "function") {
					opts[i] = this[i];
				}
			}
			opts.registerWithUIServer = false;
			opts.id = this.id + "_CLONE";
			
			var newView = $B[viewType].create(opts);
			newView.__clone = this;
			newView._isClone = true;
			

			for (i in this.subviews()) {
				newView.append( this.subviews()[i].clone(true) );
			}
			return newView;
		},
		/**
		 * end a drag operation
		 * @param  {UserEvent} evt drop event
		 */
		endDrag: function(evt) {
			//console.log(this.id+" - endDrag");

			$B.notifyObserversOfEvent("BDDraggable:willDrop", this);
			$B.dispatchNotification("BDDraggable:willDrop", this);
			$B.notifyObserversOfEvent("BDDraggable:willDropOnItem", { obj:this, 'evt':evt, target:this._currentDroppable, draggable: this, droppable:this._currentDroppable });

			this.removeClass("dragging");
			//this.getElem().style.position = "";
			this.unpop();
			this.unbakeFrame();
			if (this.__clone != undefined) this.__clone.destroy();

			$B.notifyObserversOfEvent("BDDraggable:didDrop", this);
			$B.dispatchEvent("BDDraggable:didDrop", this);
			$B.notifyObserversOfEvent("BDDraggable:didDropOnItem", { obj:this, 'evt':evt, target:this._currentDroppable, draggable: this, droppable:this._currentDroppable });
			
			this._currentDroppable = null;
	
		},
		/**
		 * informs this view to begin observing dragging objects to see if the pass
		 * within the bounds of this view. Emulates MouseOver/:hover when mouseover is not
		 * applied to CSS.
		 */
		beginListeningForHover: function() {
			var self = this;
			this.__interactionMovedProxy = function( evt ) {
				if (BDPointInRect({ x:evt.pageX, y:evt.pageY}, self.frame())) {
					if (!self._draggableIsHovering) {
						self.handleInteractionOver.call(self, evt);
					}
					return;
				}
				if (self._draggableIsHovering) {
					self.handleInteractionOut.call(self, evt);
				}
			
			};
			window.addEventListener( kB.InteractionMoved, this.__interactionMovedProxy, false );
		},
		/**
		 * stop observing dragging objects for hover.
		 */
		endListeningForHover: function() {
			if (this.__interactionMovedProxy) {
				window.removeEventListener( kB.InteractionMoved, this.__interactionMovedProxy, false );
			}
		},
		/**
		 * searches for and returns this view's parent BDScrollView
		 * @return {BDScrollView} theScrollView
		 */
		parentBDScrollView: function() {
			var view = null,
				v = this.getElem();
			while ( v.parentNode != null) {
				if (v.controller != undefined && v.controller.isDescendantOf("BDScrollView")) {
					view = v.controller;
					break;
				}
				v = v.parentNode;
			}
			return view;
		},
		/**
		  * returns the parent BDView controller object
		  */
		parentBDView: function() {
			try {
				var pE = this.getElem().parentNode;
				if (pE == null) return null;

				while (pE.controller == undefined && pE.parentNode != null) {
					pE = pE.parentNode;
				}
				return pE.controller;
			} catch (E) {
				console.log(this.id+" threw an error locating parentBDView:");
				console.log( E );
			}
		},
		/**
		  * convenience method for presentModalViewControllerAnimated:
		  * defaults to animated:true
		  * @param {BDView} viewController
		  * @see BDView#presentModalViewControllerAnimated
		  */
		presentModalViewController: function( vc ) {
			return this.presentModalViewControllerAnimated( vc, true );
		},
		/**
		  * performs necessary setup and actions to use a
		  * css animation to present a modal view
		  * @param {BDView} viewController
		  * @param {Boolean} [animated] defaults to false
		  */
		presentModalViewControllerAnimated: function( vc, animated ) {
			if (animated == undefined) animated = false;

			vc.addClass("BDModalView");

			if (vc.modal != undefined && vc.model == true) {	
				vc.modalBlackdrop = this.append( $B.View.create({ id: vc.id+"_blackdrop", customClass: "BDModalBackdrop", registerWith$B: false }) );
				if (animated == true) {
					vc.modalBlackdrop.opacity(0);
					setTimeout( function() {
						vc.modalBlackdrop.opacity(1.0);
					}, 10);
				}
			}
			if ( animated != undefined && (animated == true || animated == kB.ViewTransitionPushBottom) ) {
				setTimeout( function() {
					vc.addClass("open");
				}, 10);
			}
			this.modalViewController = vc;
			vc.parentViewController = this;
			this.append( vc );
		},
		/**
		  * dismisses current modal view controller
		  * @param {Boolean} [animated] defaults to false
		  */
		dismissModalViewController: function( animated ) {
			if (animated == undefined) animated = false;
			
			if (this.modalViewController != undefined) {
				if ( this.modalViewController.modalBlackdrop != undefined ) {
					this.modalViewController.modalBlackdrop.removeClass('open');
				}
				this.modalViewController.removeClass('open');
				var self = this;
				self.modalViewController.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
					self.modalViewController.getElem().removeEventListener( kB.CSSTransitionEnd, transitionEndListener, false );
					self.modalViewController.destroy();
					delete self.modalViewController;
				}, false);
			} else {
				console.log("NO MBDC found");
			}
		},
		getSubTMObjects: function() {
			var _temp = this._subWidgets;
			for (var i = 0; i < this._subViews.length; i++) {
				_temp.push( this._subViews[i] );
			}
			return _temp;
		},
		getSubviewsRecursive: function() {
			var sv = this.subviews(),
				asv = [];
			if (sv == undefined) return [];
			for (var i = 0, len = sv.length; i<len; i++) {
				asv.push( sv[i] );
				if (sv[i].getSubviewsRecursive != undefined) {
					var ssv = sv[i].getSubviewsRecursive();
					for (var j = 0, sublen = ssv.length; j < sublen; j++) {
						asv.push(ssv[j]);
					}
				}
			}
			return asv;
		},
		/**
		 * returns array of all immediate sub BDObjects 
		 * @return {Array of BDViews}
		 */
		subviews: function() {
			return this._subObjects;
		},
		/**
		 * synonym for BDView#subviews
		 * @see BDView#subviews
		 * @return {Array of BDViews}
		 */
		getSubviews: function() {
			return this._subObjects;
		},
		getSubBDViews: function() {
			return this._subViews;
		},
		getSubBDControls: function() {
			return this._subWidgets;
		},
		/**
		 * returns this BDView's DOM Element
		 * @return {HTMLElement}
		 */
		getElem: function() {
			if (this.layer != undefined) return this.layer;
			console.log( "****"+ this.identify() + ".layer is undefined");
			return this.layer;
		},
		/**
		 * sets and/or returns the current opacity of this BDView
		 * @param  {Number} o optional - sets the style.opacity to this value
		 * @return {Number} currentOpacity
		 */
		opacity: function( o ) {
			if (o != undefined) this.getElem().style.opacity = o;
			var eo = parseFloat(this.getElem().style.opacity);
			if (eo == undefined || eo === "" || isNaN(eo)) eo = 1;
			return eo;
		},
		enable: function() {
			this.enabled = true;
			this.removeClass("disabled");
			if (this._input) {
				this._input.disabled = false;
			}
		},
		disable: function() {
			this.enabled = false;
			this.addClass("disabled");
			if (this._input) {
				this._input.disabled = true;	
			}
		},
		/**
		 * apply CSS transform appropriate for current browser/device
		 * @param  {CSS String} t CSS Transform String
		 */
		transform: function( t ) {
			this.layer.style.webkitTransform = t;
		},
		translateX: function( x ) {
			this.transform( "translateX("+x+"px)" );
		},
		translateY: function( y ) {
			this.transform( "translateY("+y+"px)" );
		},
		translate3d: function( x, y, z ) {
			this.transform( "translate3d("+x+"px, "+y+"px, "+z+"px)" );
		},
		marginTop: function(t) {
			if (t != undefined) {
				if (typeof t == "string") this.getElem().style.marginTop = t;
				else this.getElem().style.marginTop = t+"px";
			} else {
				var v = parseFloat(this.getElem().style.marginTop);
				if (isNaN(v)) v = 0;
				return v;
			}
		},
		marginRight: function(r) {
			if (r != undefined) {
				if (typeof r == "string") this.getElem().style.marginRight = r;
				else this.getElem().style.marginRight = r+"px";
			} else {
				var v = parseFloat(this.getElem().style.marginRight);
				if (isNaN(v)) v = 0;
				return v;

			}
		},
		marginBottom: function(b) {
			if (b != undefined) {
				if (typeof b == "string") this.getElem().style.marginBottom = b;
				else this.getElem().style.marginBottom = b+"px";
			} else {
				var v = parseFloat(this.getElem().style.marginBottom);
				if (isNaN(v)) v = 0;
				return v;
			}
		},
		marginLeft: function(l) {
			if (l != undefined) {
				if (typeof l == "string") this.getElem().style.marginLeft = l;
				else this.getElem().style.marginLeft = l+"px";
			} else {
				var v = parseFloat(this.getElem().style.marginLeft);
				if (isNaN(v)) v = 0;
				return v;
			}
		},
		left: function(l) {
			if (l != undefined) {
				if (typeof l == "string") this.getElem().style.left = l;
				else this.getElem().style.left = l+"px";
			} else {
				//return this.getElem().style.left.split("px")[0];
				return this.getElem().offsetLeft;
			}
		},
		top: function(t) {
			if (t != undefined) {
				if (typeof t == "string") this.getElem().style.top = t;
				else this.getElem().style.top = t+"px";
			} else {
				//return this.getElem().style.top.split("px")[0];
				return this.getElem().offsetTop;
			}
		},
		right: function(r) {
			if (r != undefined) {
				if (typeof r == "string") this.getElem().style.right = r;
				else this.getElem().style.right = r+"px";
			} else {
				//return this.getElem().style.top.split("px")[0];
				return $B.device.screenWidth() - this.getLeftOffset() - this.getElem().offsetWidth;
			}
		},
		bottom: function(b) {
			if (b != undefined) {
				if (typeof b == "string") this.setStyle( 'bottom', b );
				else this.setStyle('bottom', b+"px");
			} else {
				if (this.getElem().style.bottom != undefined) return parseFloat(this.getElem().style.bottom);
				return $B.device.screenHeight() - this.getTopOffset() - this.getElem().offsetHeight;
			}
		},
		width: function(w) {
			if (w != undefined) {
				if (typeof w == "string") this.getElem().style.width = w;
				else this.getElem().style.width = w+"px";

				// TODO: Does this work?
				this.frame().size.width = w;

			} else {
				//return this.getElem().style.width.split("px")[0];
				try {
					var width = this.frame().size.width;
					//if (width == 0) width = this.getElem().offsetWidth;
					return width;
				} catch (E) {
					console.log(E.message);
					return this.getElem().offsetWidth;
				}
			}
		},
		height: function(h) {
			if (h != undefined) {
				if (typeof h == "string") this.getElem().style.height = h;
				else this.getElem().style.height = h+"px";

				this.frame().size.height = h;
				
			} else {
				try {
					return this.size().height;
				} catch (E) {
					return this.getElem().offsetHeight;
				}
			}
		},
		minWidth: function( w ) {
			if (w != undefined) {
				if (typeof w == "string") this.getElem().style.minWidth = w;
				else this.getElem().style.minWidth = w+"px";
			} else {
				return parseFloat( this.getElem().style.minWidth );
			}
		},
		minHeight: function( h ) {
			if (h != undefined) {
				if (typeof h == "string") this.getElem().style.minHeight = h;
				else this.getElem().style.minHeight = h+"px";
			} else {
				return parseFloat( this.getElem().style.minHeight );
			}			
		},
		maxWidth: function( w ) {
			if (w != undefined) {
				if (typeof w == "string") this.getElem().style.maxWidth = w;
				else this.getElem().style.maxWidth = w+"px";
			} else {
				return parseFloat( this.getElem().style.maxWidth );
			}
		},
		maxHeight: function( h ) {
			if (h != undefined) {
				if (typeof h == "string") this.getElem().style.maxHeight = h;
				else this.getElem().style.maxHeight = h+"px";
			} else {
				return parseFloat( this.getElem().style.maxHeight );
			}			
		},
		clientWidth: function() {
			// offsetWidth
			return this.getElem().clientWidth;
		},
		clientHeight: function() {
			// offsetHeight
			return this.getElem().clientHeight;
		},
		scrollWidth: function() {
			return this.getElem().scrollWidth;
		},
		scrollHeight: function() {
			return this.getElem().scrollHeight;
		},
		zIndex: function(z) {
			if (z != undefined) this.getElem().style.zIndex=z;
			return z;
		},
		scrollLeft: function( l ) {
			if (l != undefined) {
				if (typeof l == "string") {
					if (l.indexOf("+=") == 0) {
						this.getElem().scrollLeft = this.getElem().scrollLeft + parseInt(l.substr(2, l.length), 10);
					}
					else if (l.indexOf("-=") == 0) {
						this.getElem().scrollLeft = this.getElem().scrollLeft - parseInt(l.substr(2, l.length), 10);
					}

				} else {
					this.getElem().scrollLeft = l;
				}
			}
			return this.getElem().scrollLeft;
		},
		scrollTop: function( t ) {
			if (t != undefined) {
				if (typeof t == "string") {
					if (t.indexOf("+=") == 0) {
						this.getElem().scrollTop = this.getElem().scrollTop + parseInt(t.substr(2, t.length), 10);
					}
					else if (t.indexOf("-=") == 0) {
						this.getElem().scrollTop = this.getElem().scrollTop - parseInt(t.substr(2, t.length), 10);
					}

				} else {
					this.getElem().scrollTop = t;
				}
			}
			return this.getElem().scrollTop;		
		},
		size: function() {
			this.frame();
			//this._computedStyle = window.getComputedStyle( this.layer );
			//this._size = { width: parseInt(this._computedStyle.width), height: parseInt(this._computedStyle.height) };
			this._size = this._frame.size;
			return this._size;
		},
		click: function() {
			if (this.action != null) {
				this.action();
			}
		},
		setAction: function(a) {
			this.action = a;
			if (this._hasActionBeganListener != true && !this.usesCustomActionHandling) {
				if (this.action != null) {
					var self = this;
					this._hasActionBeganListener = true;
					this.layer.addEventListener( kB.InteractionBegan, function( evt ) {
						self.handleInteractionBegan.apply( self, arguments );
					}, false );
				}
			}

		},
		setFocusTargets: function( targets ) {
			if (targets.up) {
				this.focusTargets.up = targets.up;
			}
			if (targets.right) {
				this.focusTargets.right = targets.right;
			}
			if (targets.down) {
				this.focusTargets.down = targets.down;
			}
			if (targets.left) {
				this.focusTargets.left = targets.left;
			}
		},
		focusUp: function() {
			if (this.onFocusUp != undefined) {
				if (typeof this.onFocusUp === "function") {
					this.onFocusUp();
				}
			}
 			if (this.focusTargets && this.focusTargets.up) {
				if (typeof this.focusTargets.up === "object") {
					this.focusTargets.up.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.up, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusRight: function() {
			if (this.onFocusRight != undefined) {
				if (typeof this.onFocusRight === "function") {
					this.onFocusRight();
				}
			}
 			if (this.focusTargets && this.focusTargets.right) {
				if (typeof this.focusTargets.right === "object") {
					this.focusTargets.right.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.right, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusDown: function() {
			if (this.onFocusDown != undefined) {
				if (typeof this.onFocusDown === "function") {
					this.onFocusDown();
				}
			}
 			if (this.focusTargets && this.focusTargets.down) {
				if (typeof this.focusTargets.down === "object") {
					this.focusTargets.down.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.down, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		focusLeft: function() {
			if (this.onFocusLeft != undefined) {
				if (typeof this.onFocusLeft === "function") {
					this.onFocusLeft();
				}
			}
 			if (this.focusTargets && this.focusTargets.left) {
				if (typeof this.focusTargets.left === "object") {
					this.focusTargets.left.takeFocus();
				} else {
					var targetObj = V(this.focusTargets.left, this.namespace);
					if (targetObj) targetObj.takeFocus();
				}
			}
		},
		takeFocus: function() {
			var obj = this;
			if (obj.indentifyType == undefined && obj.control != undefined) obj = obj.control;
			if (obj == undefined) return false;
			$B.currentFocus( obj );
			obj.addClass('BDFocused');
			if (typeof obj.onFocus === "function") {
				obj.onFocus();
			}
		},
		releaseFocus: function() {
			var obj = this;
			if (obj.indentifyType == undefined && obj.control != undefined) obj = obj.control;
			if (obj == undefined) return false;
			obj.removeClass('BDFocused');
			if (typeof obj.onBlur === "function") {
				obj.onBlur();
			}
		},
		attachTouchScrolling: function() {
			var view = this;
			view.getElem().addEventListener('touchstart', function(evt) {
				view.startY = evt.targetTouches[0].pageY;
				view.initialScrollOffset = view.getElem().scrollTop;
				view.touchMove = function(evt) {
					var offset = view.startY - evt.targetTouches[0].pageY + view.initialScrollOffset;
					view.getElem().scrollTop = offset;
				};
				view.getElem().addEventListener('touchmove', view.touchMove, false);
			}, false);
			view.getElem().addEventListener('touchend', function(evt) {
			
				view.getElem().removeEventListener('touchmove', view.touchMove, false);			
				
			}, false);
		},
		dispatchObjectGroupNotification: function( notif ) {
			var siblings = $B.itemsInGroupWithId( this.objectGroup );
			for ( var i = 0, len = siblings.length; i < len; i++ ) {
				if (siblings[i].receiveObjectGroupNotification) {
					siblings[i].receiveObjectGroupNotification( { event: kB.ObjectGroupItemReceivedClick, object: this } );
				}
			}
		},
		switchLanguage: function(lang) {
			
		},
		beginSubviews: function( namespace ) {
			if (namespace == undefined) namespace = null;

			$B.beginAttachingSubviewsToView( this );
			return this;
		},
		endSubviews: function() {
			$B.endAttachingSubviewsToView( this );
		}
	});
	
	Bind.classes.BDView = BDView;
	$B.View = {
		create: function (attr) {
			return new BDView( attr );
		}
	};
})($B);

/** BDControl **/

(function($B) {

	/**
	 * BDControl
	 * @constructor
	 */
	kB.ControlAppearanceDefault = 0;
	kB.ControlAppearanceSystem  = 1;
	kB.ControlAppearanceCustom  = 2;

	var BDControl = Bind.classes.BDView.extend({
		displayName: "BDControl",
		init: function( attr ) {
			var self = this;
			if (attr != undefined && attr._scope != undefined) self = attr._scope;
			
			this.appearance = kB.ControlAppearanceDefault;
			this._offsetX = 0;
			this._offsetY = 0;
			this.constrainToXAxis = false;
			this.constrainToYAxis = false;
			this.constrainToParent = false;
			this.useCSSTransforms = true;
			this.textFormat = kB.StringFormatDefault;
			this.prefix = null;
			this.suffix = null;
			this.setTextOnPrefixChange = false;
			this.setTextOnSuffixChange = false;
			this.text = "";
			this.prefixSeparator = " ";
			this.suffixSeparator = " ";

			this._super( attr );
			
			this.setPrefix(this.prefix);
			this.setSuffix(this.suffix);
			this.setText(this.text);

			
			$B.attachEventHook('BDFormatter:StringFormatDidChange', function( format ) {
				if (self.textFormat != kB.StringFormatDefault) {
					if (self.text == undefined) return;
					self.setText( self.text );
				}
			});
		},
		click: function() {
			this.action();
		},
		simulateClick: function() {
			this.click();
		},
		select: function() {
			this.takeFocus();
		},
		switchLanguage: function(l) {
			if (this.localizations == null) return;
			this._currentLanguage = l;
			if (this._propertyString) {
				console.log(this.identify()+":"+this.id+":will setText with propertyString:"+this._propertyString);
				this.setText(this._propertyString);
				return;
			}
			if (this._valuePropertyString) {
				this.setValue(this._valuePropertyString);
			}
			if (this._placeholderPropertyString) {
				this.setPlaceholder( this._placeholderPropertyString );
			}

			if (DEBUG_MODE) console.log(this.identify()+":"+this.id+":"+this.localizations[l]);
			if (this.localizations[l] != undefined) this.setText(this.localizations[l]);
			else {
				if (this.defaultLanguageText == undefined) {
					// pull first defined language as default
					for (var i in this.localizations) {
						this.defaultLanguageText = this.localizations[i];
						break;
					}
				}
				
				if (this.defaultLanguageText != undefined && this.defaultLanguageText != null) this.setText(this.defaultLanguageText);
			}
		},
		setText: function(t) {
			if ( t == null || t == undefined) return;
			if ( this.prefix == undefined ) this.prefix = "";
			if ( this.suffix == undefined ) this.suffix = "";
			this.text = t;
			this.originalText = this.text;
			
			if (typeof this.text == "object") {
				this.localizations = this.text;
				this.text = this.localizations[$B.currentLanguage()];
				if (this.defaultLanguageText == undefined) {
					// pull first defined language as default
					for (var i in this.localizations) {
						this.defaultLanguageText = this.localizations[i];
						break;
					}
				}
			}
			
			if (typeof this.prefix == "object") {
				this.prefixLocalizations = this.prefix;
				if (this.prefixLocalizations[$B.currentLanguage()] == undefined) {
					for (var _p in this.prefixLocalizations) {
						var dP = this.prefixLocalizations[_p];
						break;
					}
					// set first defined as default prefix
					this.prefixLocalizations[$B.currentLanguage()] = dP;
				}
				this.prefix = this.prefixLocalizations[$B.currentLanguage()];
			}
			if (typeof this.suffix == "object") {
				this.suffixLocalizations = this.suffix;
				if (this.suffixLocalizations[$B.currentLanguage()] == undefined) {
					for (var _s in this.suffixLocalizations) {
						var dS = this.suffixLocalizations[_s];
						break;
					}
					// set first defined as default suffix
					this.suffixLocalizations[$B.currentLanguage()] = dS;
				}
				this.suffix = this.suffixLocalizations[$B.currentLanguage()];
			}
			
			if (typeof this.text == "string" && this.text.substr(0,9) == "string://") {
				this._propertyString = this.text;
				this.setText($B.localizedValueForProperty(this._propertyString.substr(9)));
				return;
			}
			
			if (this.textFormat != kB.StringFormatDefault) {
				this.text = $B.formatString( this.text, this.textFormat );
			}
			
			// If we're this far and still undefined, try defaultText
			if (this.text == undefined) {
				
				//console.log(this.id + " is using defaultLanguageText");
				this.text = this.defaultLanguageText;

				// if that didn't work, it's time to abort
				if (this.text == undefined) {
					console.log(this.id + " has serious localization issues, aborting");
					return false;
				}
			};
			
			if (this._prefixPropertyString) {
				this.prefix = $B.localizedValueForProperty(this._prefixPropertyString.substr(9));
			}
			if (this._suffixPropertyString) {
				this.suffix = $B.localizedValueForProperty(this._suffixPropertyString.substr(9));
			}

			
			var str = "";
				str = (this.prefix != "" && this.prefix != undefined) ? "<span class='prefix'>" + this.prefix + this.prefixSeparator + "</span>" : "";
				str += this.text;
				str += (this.suffix != "" && this.suffix != undefined) ? "<span class='suffix'>" + this.suffixSeparator + this.suffix + "</span>" : "";

			if (this.identify() == "BDTextField" || this.identify() == "BDTextArea") {
				this.layer.setAttribute("value", this.text);
				if (this.prefix != "" || this.suffix != "") {
					this.layer.value = this.prefix + this.text + this.suffix;
				} else {
					this.layer.value = this.text;
				}
			} else {
				if (this._text) {
					this._text.innerHTML = str;
					// innerText bug workaround
					if ( this._text.innerHTML == "") {
						this._text.innerText = str;
					}

				} else {
					this.layer.innerHTML = str;
					// innerText bug workaround					
					if ( this.layer.innerHTML == "") {
						this.layer.innerText = str;
					}
				}
			}
			if (this.enableFocusLabeling == true) {
				this.layer.setAttribute("defaultText", this.text);
			}
			this.text = this.originalText;
		},
		setPrefix: function( pf, setText ) {
			if (pf == null || pf == undefined) return;
			if (setText == undefined) setText = this.setTextOnPrefixChange;
			
			if (typeof pf == "string" && pf.substr(0,9) == "string://") {
				this._prefixPropertyString = pf;
				this.prefix = $B.localizedValueForProperty(this._prefixPropertyString.substr(9));
			} else {
				this.prefix = pf;
			}
	
			if (setText) this.setText( this.text );
		},
		setSuffix: function( sf, setText ) {
			if (sf == null || sf == undefined) return;
			if (setText == undefined) setText = this.setTextOnSuffixChange;
			
			if (typeof sf == "string" && sf.substr(0,9) == "string://") {
				this._suffixPropertyString = sf;
				this.suffix = $B.localizedValueForProperty(this._suffixPropertyString.substr(9));
			} else {
				this.suffix = sf;
			}

			if (setText) this.setText( this.text );
		},
		getValue: function() {
			return this.layer.value;
		},
		getElem: function() {
			if (this._container != undefined) return this._container;
			return this.layer;
		},
		getParentElem: function() {
			return this.getElem().parentNode;
		},
		typeIsEqualTo: function( t ) {
			return (this.BDType == t);
		},
		identify: function() {
			return 	this.BDType+"-"+this.id;
		},
		identifyType: function () {
			return this.BDType;
		},
		identifyBaseClass: function() {
			return "BDControl";
		},
		setZIndex: function(index) {
			this.getElem().style.zIndex = index;
		},
		ready: function() {
			if (this.BDType == "BDImage") return this.layer.complete;
			return true;
		},
		takeFocus: function() {
			this._super();
			if (this._input != undefined) {
				this._input.focus();
			}
		},
		releaseFocus: function() {
			this._super();
		}
	});
	
	Bind.classes.BDControl = BDControl;

})($B);

/** BDButton **/

(function($B) {

	'use strict';

	kB.ButtonTypeDefault 	= 0;
	kB.ButtonTypeStandard 	= 0;
	kB.ButtonTypeRadio		= 1;
	kB.ButtonTypeToggle	= 2;
	
	/**
	 * BDButton
	 * @constructor
	 * @extends BDControl
	 */
		
	var BDButton = Bind.classes.BDControl.extend({
		displayName: "BDButton",
		init: function( attr ) {
			var self = this;
			attr._scope = this;
			this.id = attr.id;
			this.BDType = "BDButton";
			this.draggable = false;
			this.tooltip   = null;
			this.selectedState = 0;
			this.customClass = null;
			this.useThreeSliceLayout = false;
			this.type = kB.ButtonTypeDefault;
			this.textFormat = kB.StringFormatDefault;
			this.hasColorWell = false;
			this.colorForColorWell = null;
			this.onMouseUp = null;
			this.useContainer = false;
			this.icon = null;
		
			// Load in attributes
			for (var i in attr) this[i] = attr[i];

			// attributes are applied in super
			this.layer = new Elem("a", this.id);
			this.layer.setClass("BDButton");
			
			if (this.icon != null) {
				if ($B.ContentManager != undefined && typeof this.icon == "string" && this.icon.indexOf(":") > 0 && this.icon.indexOf("http") != 0) {
					this.icon = $B.ContentManager.transformURL( this.icon );
				}
	
				this._icon = new Image();
				this._icon.src = this.icon;
				this._icon.controller = this;
				this._icon.view = this;
				this.layer.appendChild(this._icon);
			}

			if (this.text != undefined || this.useContainer == true){
				if (this.icon != undefined || this.useThreeSliceLayout || this.useContainer == true) {
					this._text = new Elem("span");
					this._text.controller = this;
					this._text.view = this;
					this.layer.appendChild(this._text);
				}
			}
			
			this._super( attr );
	
			if (this.customClass != null) $B.addClass(this.layer, this.customClass);
			if (this.defaultButton) $B.addClass(this.layer, "Default");
	
			if (this.useThreeSliceLayout) {
				this._leftSlice   = new Elem("div", null, "left");
				this._middleSlice = new Elem("div", null, "middle");
				this._rightSlice  = new Elem("div", null, "right");
				$B.addClass(this.layer, "BDThreeSliceButton");
				this.layer.appendChild( this._leftSlice );
				this.layer.appendChild( this._middleSlice );
				this.layer.appendChild( this._rightSlice );
			}
			
			if (this.id != undefined) this.layer.setAttribute('id', this.id);
			if (this.text != undefined || this.useContainer == true){
				this.setText( this.text );	
			}
			else if (this.title != undefined) this.layer.innerHTML = this.title;
				
			if (this.textColor != undefined) {
				this.layer.style.color = this.textColor;
			}
			
			if (this.hasColorWell || this.colorForColorWell != null) {
				this.colorWell = $B.View.create({ id: this.id+"_ColorWell", customClass: "ColorWell", useSpanElement: true });
				this.colorWell.setBackgroundColor( this.colorForColorWell );
				this.getElem().appendChild( this.colorWell.getElem() );
			}
			
			//if (this.draggable) this.makeDraggable();
			
			if (this.type == kB.ButtonTypeRadio) {
				this.actionOnMouseDown = true;
			}
			
			if (this.defaultText == undefined) this.defaultText = this.text;
			if (this.action != null) {
				this.layer.addEventListener( kB.InteractionBegan, function( evt ) {
					self.handleInteractionBegan.apply( self, arguments );
				}, false );
			}
			if (this.onMouseUp != null) {
				window.addEventListener( kB.InteractionEnded, function( evt ) {
					self.onMouseUp.apply( self, arguments );
				}, false );
			}
			if (this.visible != undefined && this.visible == false) {
				this.layer.style.display = "none";
			}
	
			if (this.tooltip != null) this.layer.setAttribute("alt", this.tooltip);
			if (this.registerWithUIServer == undefined || this.registerWithUIServer == true) $B.registerControl(this);
			
			if (this.objectGroup != null) {
				$B.addItemToGroupWithId( this, this.objectGroup );
			}
	
			if (this.visible == undefined) this.visible = true;
			if (!this.visible) this.hide();
			
			if ($B.browser.iOS || $B.browser.android) {
				this.layer.addEventListener( kB.InteractionBegan, function( evt ) {
					$B.addClass(self.getElem(), 'active');
				}, false);
				this.layer.addEventListener( kB.InteractionEnded, function( evt ) {
					$B.removeClass(self.getElem(), 'active');
				}, false);
			}
			
			this.layer.view = this;
			this.layer.controller = this;
			this.layer.control = this;
			
	
			if (this.useContainer) {
				this.container = $B.View.create({ id: this.id + "_container", customClass: "BDButtonContainer" });
				
				if (this.customClass) this.container.addClass( this.customClass );
				
				this.container.removeClass("BDView");
				this.container.append( this.layer );
				this._buttonElem = this.layer;
				this.layer = this.container.getElem();
			}
		
			return this;
		},
		receiveObjectGroupNotification: function( notif ) {
			if (notif.event == kB.ObjectGroupItemReceivedClick && this.type == kB.ButtonTypeRadio) {
				this.deselect();
			}
		},
		select: function() {
			this.addClass("selected");
		},
		deselect: function() {
			this.removeClass("selected");
		},
		cancelEvents: function() {
			this._shouldPerformActionOnTouchUp = false;
		},
		setTitle: function( str ) {
			if (str == undefined) return;
			this._text.innerHTML = str;
			if (this._text.innerHTML == "") {
				this._text.innerText = str;
			};
		}
	});
	
	Bind.classes.BDButton = BDButton;
	$B.Button = {
		create: function( attr ) {
			return new BDButton( attr );
		}
	};

})($B);

/** BDLabel **/

(function($B) {

	'use strict';
	
	kB.LabelTypeDefault 		 = 0;
	kB.LabelTypeText    		 = 0;
	kB.LabelTypeNumber   		 = 1;
	kB.LabelTypeCurrency 		 = 2;
	kB.LabelTypeDate     		 = 3;
	kB.LabelTypeCurrencyInCents = 4;
	/**
	 * BDLabel
	 * @constructor
	 * @extends BDControl
	 */
	var BDLabel = Bind.classes.BDControl.extend({
		displayName: "BDLabel",
		init: function(attr) {
			this.BDType = "BDLabel";
			this.registerWithUIServer = true;
			this.type = kB.LabelTypeDefault;
			
			this._super( attr );

			if (this.type != kB.LabelTypeDefault) this.textFormat = this.type;
			if (this.type == kB.LabelTypeCurrencyInCents) this.textFormat = kB.StringFormatCurrencyInCents;

			this.removeClass("BDView");
			this.addClass("BDLabel");

			this._viewDidInit();

			return this;
		}
	});

	Bind.classes.BDLabel = BDLabel;
	$B.Label = {
		create: function(attr) {
			return new BDLabel(attr);
		}
	};

})($B);

/** BDAnimation **/

(function($B) {

	'use strict';

	kB.AnimationCurveEaseInOut  = 0;
	kB.AnimationCurveEaseIn 	 = 1;
	kB.AnimationCurveEaseOut 	 = 2;
	kB.AnimationCurveLinear 	 = 3;

	/**
	 * BDAnimation
	 * @constructor
	 */
	var BDAnimation = function BDAnimation( params, callback ) {
		this.from = 0;
		this.to = 1;
		this.duration = 1000;
		this.curve = kB.AnimationCurveEaseInOut;
		this.autoStart = false;
		this.callback = callback;
		this.startTime = null;
		this.isAnimating = false;
		this.method = null;
		this._interval = null;
		
		this.target = null;
		this.attribute = null;
		
		for (var i in params) this[i] = params[i];
		
		if (this.callback == undefined) this.callback = null;
		
		if (this.autoStart == true) return this.begin();
		
		return this;
	};
	BDAnimation.prototype.create = function( params, callback ) {
		return new BDAnimation( params, callback );
	};
	BDAnimation.prototype.requestFrame = (function( callback ) {
	    return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback) { return setTimeout(function() {
				callback(NOW());
			}, kB.AnimationDesiredFrameDuration); }
		// return function(callback) { return setTimeout(callback, kB.AnimationDesiredFrameDuration); };
	})();
	BDAnimation.prototype.cancelFrameRequest = (function(timer) {
		    return window.cancelRequestAnimationFrame
			|| window.webkitCancelAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| clearTimeout
		// return clearTimeout;
	})();
	BDAnimation.prototype.animate = function( params, callback ) {
		params.autoStart = true;
		return new BDAnimation( params, callback );
	};
	BDAnimation.prototype.begin = function() {
		var self = this;
		this.step = 0;
		this.startTime = NOW();
		this.value = this.from;
		this.isAnimating = true;
		
		this.displacement = this.to - this.from;
	//	if (this.to > this.from) {
	//		this.displacement *= -1;
	//	}
		
		//this._interval = this.requestFrame.call(window, function(now){self.doStep.apply(self,arguments)});
		this._interval = window.setInterval( function() {
			self.doStep.apply( self, [NOW()] );
		}, kB.AnimationDesiredFrameDuration);
		return this;
	};
	BDAnimation.prototype.doStep = function(NOW) {
		this._elapsedTime = NOW - this.startTime;
		if (this._elapsedTime > this.duration) {
			this.end();
		}
		this._progress = this._elapsedTime / this.duration;
		if (this._progress > 1) {
			this._progress = 1;
			this.value = this.to;
			this.end();
		}
		if (this.curve == kB.AnimationCurveEaseInOut) {
			this.value = -0.5*Math.cos(Math.PI*this._progress)+0.5;
			
		} else if (this.curve == kB.AnimationCurveEaseIn) {
			this.value = -1*((this._progress-1)*(this._progress-1)) + 1;
		} else if (this.curve == kB.AnimationCurveEaseOut) {
			this.value = -1*(this._progress*this._progress) + 1;
		} else {
			this.value = this._progress;
		}
		
		this.value *= this.displacement;
		this.value += this.from;
		
		if ( this.method != null ) {
			this.method.call( this.target, this.value );
		} else {
			this.target.setParam( this.attribute, this.value );	
		}
	};
	BDAnimation.prototype.end = function() {
		window.clearInterval( this._interval );
		if (this.isAnimating) {
			this.isAnimating = false;
			this.didFinishAnimating();
		}
	};
	BDAnimation.prototype.cancel = function() {
		window.clearInterval( this._interval );
		this.isAnimating = false;
	};
	BDAnimation.prototype.didFinishAnimating = function() {
		if (this.attribute != null){
			this.target.setParam( this.attribute, this.to );
		}
		if (this.callback != null) this.callback();
	};

	BDAnimation.displayName = "BDAnimation";
	Bind.classes.BDAnimation = BDAnimation;
	$B.Animation = BDAnimation.prototype;

})($B);
/** BDSplitView **/

(function($B) {

	/**
	 * BDSplitView
	 * @constructor
	 * @extends BDView
	 */
var BDSplitView = Bind.classes.BDView.extend({
	displayName: "BDSplitView",
	init: function( attr ) {
		this._super( attr );
		this.resizable = false;
		this.isVertical = true;
		this.hasTitleBar = false;
		this.divider = $B.View.create({ customClass: "BDSplitViewDivider" });
		this.divider.removeClass("BDView");

		for (var i in attr) this[i] = attr[i];

		this.addClass("BDSplitView");
		
		if (this.hasTitleBar) {
			this._titleBarContainer = $B.View.create({ customClass: "BDSplitViewTitleBarContainer" });
			var v = $B.View.create({ customClass: "BDTitleBar Master" });
			this._masterViewLabel = v.append( $B.Label.create({ }) );
			this._titleBarContainer.append( v );
			v = $B.View.create({ customClass: "BDTitleBar Detail" });
			this._detailViewLabel = v.append( $B.Label.create({ }) );
			this._titleBarContainer.append( v );
			this.getElem().appendChild( this._titleBarContainer.getElem() );
		}
		
		return this;
	},
	layoutSubviews: function() {
		var f = this.frame();

		if (!this.isVertical && this._subViews[1].autoResizingMask) { // views are on top of each other
			if (this._subViews[0].autoResizingMask == kB.ViewAutoresizeHeight) { // detail view is fixed height
				this._subViews[0].bottom( this._subViews[1].height() );
			} else if (this._subViews[1].autoResizingMask == kB.ViewAutoresizeHeight) {
				this._subViews[1].top( this._subViews[0].height() );
			}
		}

	},
	setMasterViewTitle: function( t ) {
		this._masterViewLabel.setText( t );
	},
	setDetailViewTitle: function( t ) {
		this._detailViewLabel.setText( t );
	},
	append: function( vc ) {
		if (this._subViews.length == 0) {
			vc.addClass("MasterView");
			if (vc.title) {
				this.setMasterViewTitle( vc.title );
				if (vc.controller) {
					this._masterViewLabel.bind('text', vc.controller, 'title');
				}
			}
		}
		if (this._subViews.length == 1) {
			this.getElem().appendChild( this.divider.getElem() );
			vc.addClass("DetailView");
			if (vc.title) {
				this.setDetailViewTitle( vc.title );
				if (vc.controller) {
					this._detailViewLabel.bind('text', vc.controller, 'title');
				}
			}
		}
		return this._super( vc );
	}
});

Bind.classes.BDSplitView = BDSplitView;
$B.SplitView = {
	create: function( attr ) {
		return new BDSplitView( attr );
	}
};


})($B);
/** BDScrollView **/

(function($B) {

	'use strict';

	/**
	 * BDScrollView
	 * @constructor
	 * @extends BDView
	 */
var BDScrollView = Bind.classes.BDView.extend({
	displayName: "BDScrollView",
	init: function( prop ) {
		this._super.call( this, prop );
		this.BDType = "BDScrollView";
		this.offset = 0;
		this._scrollOffset = 0;
		this._initialOffset = 0;
		this._endOffset = null;
		this._interval = null;
		this._direction = 0;
		this.elementSize = { portrait: 0, landscape: 0 };
		this.isVertical = true;
		this.infinite = false;
		this.limitsOnePagePerFlick = false;
		this.overrideNestedScrollPrevention = false;
		this.autoSizeSliderView = false;
		this.wrapInMaskingLayer = false;
		this.snapsToScrollInterval = { portrait: 1, landscape: 1 };
		this._willScrollEventDidDispatch = false;
		this.redrawOnOrientationChange = true;
		this.initialIndex = 0;
		this.enableInteraction = true;
		this.bounces = true;
		this.useCSSTransitions = false;
		this.scrollable = true;
		this.preventDefault = true;
		this.pageIndex = 0;
		this.allowWheelScroll = false;
		this.__autoSizeAttemptCount = 0;
		this._animating = false;
		this.enable2DScroll = false;
		this.useTransforms = ($B.device.supportsHardwareAcceleration() || $B.device.isChrome());

		this._execTimes = [];

		// DEPRECATED:
		// this.minNumberOfItemsInView = 1;
		
		for ( var i in prop ) this[i] = prop[i];
		if (prop && prop.autoSizeSliderView == undefined) this.autoSizeSliderView = !this.isVertical;
		
		if (typeof this.snapsToScrollInterval != "object") {
			this.snapsToScrollInterval = { portrait: this.snapsToScrollInterval, landscape: this.snapsToScrollInterval };
		}
		
		if (typeof this.elementSize != "object") {
			this.elementSize = { portrait: this.elementSize, landscape: this.elementSize };
		}
		
		this.slider = $B.View.create({id:this.id+"_ScrollLayer", customClass:"BDScrollView_ScrollLayer", registerWithUIServer: true });
		
		this.slider.layer.style.position = "relative";

		var self = this;

		//this.container = new Elem("div", this.id, "BDScrollView");
		this.layer.className = "BDScrollView";
		
		if (this.wrapInMaskingLayer) {
			this.maskingLayer = new Elem("div", this.id+"_MaskLayer", "BDScrollView_MaskLayer");
			this.maskingLayer.appendChild( this.slider.layer );
			this.maskingLayer.controller = this;
			this.maskingLayer.style.visibility = "hidden";
			this.layer.appendChild( this.maskingLayer );
			// TODO: Please fix this!
			setTimeout( function() {
				//console.log(self.getStyleSheetAttribute('position'));
				if (self.getStyleSheetAttribute('position') != "absolute") {
					self.layer.style.position = "relative";
					self.maskingLayer.style.position = "absolute";
					self.maskingLayer.style.top = 0;
					self.maskingLayer.style.left = 0;
					self.maskingLayer.style.right = 0;
					self.maskingLayer.style.bottom = 0;
				}
				self.maskingLayer.style.visibility = "visible";
			}, 150);

		} else {
			this.layer.appendChild( this.slider.layer );
		}
		
		if (this.customClass != undefined) {
			$B.addClass(this.layer, this.customClass);
		}

		this._initialOffset = (-1*this.initialIndex*this._scrollPageSize());
		
		if (this.isVertical) {
			this.slider.layer.style.webkitTransform = "translate3d(0,"+this._initialOffset+"px, 0)";
		} else {
			this.slider.layer.style.webkitTransform = "translate3d("+this._initialOffset+"px)";
		}
		
		if (isNaN(this._initialOffset)) {
			setTimeout( function() {
				self._initialOffset = (-1*self.initialIndex*self._scrollPageSize());
			}, 250);
		}

		this.layer.controller = this;
		this.slider.layer.controller = this;

		//$B.registerView(this);
		
		if (this.redrawOnOrientationChange == true) {
			$B.attachEventHook("BDDevice:didRotateToInterfaceOrientation", function( orientation ) {
				self.redrawSlider();
			});
		}

		if ( this.enableInteraction && ($B.device.isTouchEnabled() || !this.allowWheelScroll) ) {
			this.slider.getElem().addEventListener( kB.InteractionBegan, function( evt ) {
				if (self.preventDefault) {
					evt.preventDefault();
				}
				//evt.stopPropagation();
				self._touchesBegan.apply( self, arguments );
			}, false );
// 			this.container.addEventListener( "mousewheel", function( evt ) {
// 				self._handleScrollEvent.apply( self, arguments );
// 			}, false );
		}
		if ($B.browser.mousedriven && this.allowWheelScroll) {
			if (this.enable2DScroll) {
				this.layer.style.overflowX = "auto";
				this.layer.style.overflowY = "auto";
			} else {
				if (this.isVertical) {
					//this.layer.style.overflowX = "hidden";
					this.layer.style.overflowY = "auto";
				} else {
					this.layer.style.overflowX = "auto";
					//this.layer.style.overflowY = "hidden";
				}
				
			}
		}
		
		if (this.autoSizeSliderView == true) {
			this.slider.getElem().style.visibility = "hidden";
			setTimeout( function() {
				self.updateSliderSize();
			}, 180);
		}

		if (this.enable2DScroll) {
			this.layer.addEventListener("mousewheel", function( evt ) {
				evt.__enableScroll = true;
			});
		} else {
		
			this.layer.addEventListener("mousewheel", function( evt ) {
				var vectors = self.slider.cornerOffsetVectors();
				
				if (evt.wheelDeltaX > 0 && vectors.topLeft.x < 0) { // scroll request to the right check topLeft
					evt.__enableScroll = true;
					return;
				} else if (evt.wheelDeltaX < 0 && vectors.topRight.x < 0) { // scroll request to the left check topRight
					evt.__enableScroll = true;
					return;
				}

				if (evt.wheelDeltaY > 0 && vectors.topLeft.y < 0) { // to the top
					evt.__enableScroll = true;
					return;
				} else if (evt.wheelDeltaY < 0  && vectors.bottomLeft.y < 0) {
					evt.__enableScroll = true;
					return;
				}
			}, false);
		}
		
		this._sliderSizeAttempt = 0;

		return this;
	},
	/**
	  * sets the innerHTML of this view to the provided string
	  * @param {string} newContent new html for the view
	  * @deprecated
	  */
	setContent:	function(content) {
		this.slider.setContent( content );
	},
	firstSubview: function() {
		var v = this.slider.subviews();
		if (v[0] == undefined) {
			return { clientWidth: function() {return 0;}, clientHeight: function() {return 0;}};
		}
		return v[0];
	},
	subviews: function() {
		return this.slider.subviews();
	},
	_scrollPageSize: function() {
		if (this.snapsToScrollInterval.landscape == "auto" && this.firstSubview().clientWidth && this.firstSubview().clientWidth() > 0) {
			this.snapsToScrollInterval.landscape = this.isVertical ? this.firstSubview().clientHeight() : this.firstSubview().clientWidth();
		}
		if (this.snapsToScrollInterval.portrait == "auto" && this.firstSubview().clientHeight && this.firstSubview().clientHeight() > 0) {
			this.snapsToScrollInterval.portrait = this.isVertical ? this.firstSubview().clientHeight() : this.firstSubview().clientWidth();
		}
		return $B.device.orientationIsLandscape() ? this.snapsToScrollInterval.landscape : this.snapsToScrollInterval.portrait;
	},
	_elementSize: function() {
		if (this.elementSize.landscape == "auto" && this.clientWidth() > 0) {
			this.elementSize.landscape = this.isVertical ? this.clientHeight() : this.clientWidth();
		}
		if (this.elementSize.portrait == "auto" && this.clientHeight() > 0) {
			this.elementSize.landscape = this.isVertical ? this.clientHeight() : this.clientWidth();
		}
		return $B.device.orientationIsLandscape() ? this.elementSize.landscape : this.elementSize.portrait;
	},
	_didEndScrolling: function() {
		this.slider.getElem().style.webkitTransition = this._sliderTransition;
	},
	_handleScrollEvent: function( evt ) {
		this._sliderTransition = this.slider.getElem().style.webkitTransition;
		var self = this;
		clearTimeout( self.restoreTransition );
		self.restoreTransition = setTimeout( function() {
			self._didEndScrolling.apply( self, arguments );
		}, 250);
		this.slider.getElem().style.webkitTransition = "none";
		this._scrollOffset += evt.wheelDelta/400;

		if (this._scrollOffset > 0) {
			this._scrollOffset = 0;
		}

		if (this.isVertical) {
			if (this._scrollOffset < this.endOffset()) {
				this._scrollOffset = this.endOffset();
			}
			this.setTransform( "translate3d(0,"+this._scrollOffset+"px, 0)");
		} else {
			if (this._scrollOffset < this.endOffset()) {
				this._scrollOffset = this.endOffset();
			}
			this.setTransform( "translate3d("+this._scrollOffset+"px, 0, 0)");
		}
	},
	_touchesBegan: function( evt ) {
		if ((this.isVertical && this.slider.height() < this.height()) || (!this.isVertical && this.slider.width() < this.width())) return false;
		if (!this.scrollable) return false;
		this._willScrollEventDidDispatch = false;
		this.endDeceleration();
		
		
		this._scrollPageSize();
		this._elementSize();

		if (evt.target.className != undefined && evt.target.className.indexOf("BDScrollView_ScrollLayer") >= 0 
			&& evt.target != this.layer 
			&& evt.target != this.slider.layer 
			&& this.overrideNestedScrollPrevention == false)
		{
			return;
		};
		var self = this;
		if ($B.browser.touchscreen) {
			//this._startPoint = { x: evt.targetTouches[0].pageX, y: evt.targetTouches[0].pageY };
			this._startPoint = { x: evt.touches[0].pageX, y: evt.touches[0].pageY };
		} else {
			this._startPoint = { x: evt.clientX, y: evt.clientY };
		}
		
		this.offset = { x: 0, y: 0 };

		this._startTime = NOW();
		this._endOffset = null;
		this._endOffset = this.endOffset();
		//console.log(this._startTime+": Start Interaction");
		
		this._initialTransition = this.slider.layer.style.webkitTransition;
		this.slider.layer.style.webkitTransition = "none";

		var tracker = function( evt ) { 
			self._touchesMoved.call( self, evt );
		};
		var win = window;
		win.addEventListener( kB.InteractionMoved, tracker, false );
		win.addEventListener( kB.InteractionEnded, function interactionEndedListener( evt ) { 
			win.removeEventListener( kB.InteractionEnded, interactionEndedListener, false );
			win.removeEventListener( kB.InteractionMoved, tracker, false );
			self._touchesEnded.apply( self, arguments ); 
		}, false );
		this._execTimes = [];
		this._execTimesEpoch = NOW();
		this._frameTimes = [];
		this._updateOffsetInt = setInterval( function() {
			self._updateOffsetRunloop.apply( self, arguments );
		}, kB.AnimationDesiredFrameDuration);
	},
	_touchesMoved : function( evt ) {
		this.__touchesDidMove = true;
		//var _startTime = new Date();
		if ($B.browser.touchscreen) {
			if (evt.touches.length != 1) return;
			this.offset = { x: evt.touches[0].pageX - this._startPoint.x, y: evt.touches[0].pageY - this._startPoint.y };
		} else {
			this.offset = { x: evt.clientX - this._startPoint.x, y: evt.clientY - this._startPoint.y };
		}
		

		if (this._willScrollEventDidDispatch == false) {
			var _offsetMagnitude = Math.abs((this.isVertical == true) ? this.offset.y : this.offset.x);
			if ( _offsetMagnitude > 2) {
				$B.dispatchEvent(this.id+":willBeginScrolling", evt);
				var sv = this.getSubviewsRecursive();
				for (var i = 0, len = sv.length; i<len; i++) {
						if (sv[i].cancelEvents) {
							sv[i].cancelEvents();
						}
				}
				this._willScrollEventDidDispatch = true;
			}
		}

		// if (this.infinite) {
		// 	this._scrollOffset = this.offset.x + this._initialOffset;
		// 	this.layoutSubviewsWithOffset( this._scrollOffset );
		// } else {
			if (this.isVertical) {
				this._scrollOffset = this.offset.y + this._initialOffset;
			} else {
				this._scrollOffset = this.offset.x + this._initialOffset;
			}

			// handle end of view tension
			var offset = this._scrollOffset;
			if (this._scrollOffset > 0) {
				offset /= 2;
			} else if (this._scrollOffset < this.endOffset()) {
				offset = (this._scrollOffset - this.endOffset())/2 + this.endOffset();
			}
			//if (this._scrollOffset != offset) this._offsetUpdateNeedsDraw = true;
			this._scrollOffset = offset;
			// commit the offset
			

		// }
		//this._execTimes.push( NOW() - _startTime.getTime() );
	},
	_updateOffsetRunloop: function() {
		//if (!this._offsetUpdateNeedsDraw) return;
		if (!this.__touchesDidMove) return;
		this.updateOffset( this._scrollOffset );
		//this._frameTimes.push( 0 );
		this.__touchesDidMove = false;
	},
	_touchesEnded: function( evt ) {
		clearInterval( this._updateOffsetInt );
		//console.log(this.id+"._touchesEnded()");
		var avg = 0, avg2 = 0, len2 = 0;
		for (var i = 0, len = this._execTimes.length; i < len; i++ ) {
			avg += this._execTimes[i];
		}
		for (i = 0, len2 = this._frameTimes.length; i < len; i++ ){
			avg2 != this._frameTimes[i];
		}
		avg2 /= len2;

		// var _NOW_ = NOW(),
		// 	time1 = (_NOW_ - this._execTimesEpoch),
		// 	time2 = ( len / ((_NOW_ - this._execTimesEpoch)/1000)),
		// 	time3 = ( len2 / ((_NOW_ - this._execTimesEpoch) / 1000)),
		// 	time4 = ( len2 / ((_NOW_ - this._execTimesEpoch) / 1000));

		// console.log( len + " moves, avg execTime: " + avg + "ms, " + time2 + " exec/s " + time3 + " fps, Frames Rendered:" + len2);

		var InteractionDuration = NOW() - this._startTime;

		var offsetMagnitude = this.isVertical ? this.offset.y : this.offset.x;
		var velocity = offsetMagnitude / InteractionDuration;
		this._velocity = velocity*1000;
		
		var snapDirection = offsetMagnitude % this._scrollPageSize();
		if (this.useCSSTransitions) {

			if (this._scrollPageSize() > 1) {
			
				// finish transition only if swipe is greater than 21% of the view
				if (Math.abs(offsetMagnitude) > 0.21*this._scrollPageSize()) {

					if (this.limitsOnePagePerFlick == true) {
						if (snapDirection > 0) {
							this._scrollOffset = this._initialOffset + this._scrollPageSize();
						} else {
							this._scrollOffset = this._initialOffset - this._scrollPageSize();
						}
					}
				
					else { // Not limited to one page at a time
						offsetMagnitude += velocity*150;
						var targetIndex = Math.round(offsetMagnitude/this._scrollPageSize());
						this._scrollOffset = targetIndex*this._scrollPageSize() + this._initialOffset;
					}
				} else { // touch offset was insufficient so revert
					this._scrollOffset = this._initialOffset;
				}
			}
		

			//var clientSize = (this.isVertical == true) ? this.slider.clientHeight() : this.slider.clientWidth();
		
			// Check to make sure that we're keeping the layer in bounds
			if (this._scrollOffset > 0) {
				this._scrollOffset = 0;
			}
			else if ( this._scrollOffset < this.endOffset() ) {
				this._scrollOffset = this.endOffset();
			}
		
			// Send Page Change Notification
			var pageIndex = Math.floor( Math.abs( this._scrollOffset / this._scrollPageSize() ) );
			this.pageIndex = pageIndex;
			$B.dispatchEvent(this.id+":willSwitchPage", pageIndex);
		
			this._initialOffset = this._scrollOffset;
			this._existingWebkitTransition = this.slider.layer.style.webkitTransition;
			
			if ( $B.device.isAndroid() || $B.device.isChrome() ) {
				this.slider.layer.style.webkitTransition = "all 0.3s ease-out";
			} else if ( $B.device.isFirefox() ) {
				this.slider.layer.style.MozTransition = "all 0.3s ease-out";			
			} else {
				this.slider.layer.style.webkitTransition = "-webkit-transform 0.3s ease-out";
			}

			this.updateOffset( this._scrollOffset );
			var self = this;

			this.slider.layer.addEventListener(kB.CSSTransitionEnd, function transitionEndListener() {
				self.slider.layer.removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
				$B.dispatchEvent(self.id+":didSwitchPage", pageIndex);
				$B.dispatchEvent(self.id+":didSwitchIndex", pageIndex);
			}, false);
		} else {
			this.beginDeceleration();
		}
		
	},
	beginDeceleration: function() {
		//var t = Math.abs(this._velocity/0.4);
		//var d = 0.5*0.4*t^2+this._velocity/1000*t;
		this._mVelocity = this._velocity/1000;
		//this._decelShouldTake = t;
		//console.log( "will decelerate from "+this._velocity+" px/s in "+t+"ms and "+d+"px" );
		var self = this;
		this._decelerationStartTime = NOW();
		this._didReverseOnBounce = false;
		this._bounceTime = null;
		this.finishTransitionTime = 250;

		//$B.Animation.cancelFrameRequest();//this._interval
		clearTimeout( this._interval );
		this.size();
		this.slider.size();

		//this.__animationFrames = 0;
		this._animating = true;

		this._interval = $B.Animation.requestFrame.call( window, function(now){self.doDecelerationStep(now)} );
	},
	doDecelerationStep: function(NOW) {
		//this.__animationFrames++;
		this._mVelocity *= kB.AnimationFrictionFactor;
		//console.log(this._mVelocity);
		if (Math.abs(this._mVelocity) < 0.005) this.endDeceleration();

		// TODO: Fix missing bounce case that causes
		// scrollView to stop scrolling without bouncing back
		if (this._scrollOffset > 0) {
			// we're past the beginning of the scrollLayer
			
			if (this._mVelocity < 0 && !this._didReverseOnBounce) {
				this._direction = -1;
				this._didReverseOnBounce = true;
				this._bounceTime = NOW;
				this._bounceApex = this._scrollOffset;
				this._mVelocity = -this._scrollOffset/this.finishTransitionTime;
			}
			if (this._didReverseOnBounce) {
				var e = NOW - this._bounceTime;
				var p = e/this.finishTransitionTime;
				if (p > 1) p = 1;
				var pe = -1*((p-1)*(p-1))+1;
				this._scrollOffset = this._bounceApex - (this._bounceApex * pe);
			} else {
				this._mVelocity -= (this._scrollOffset * 0.0025);
				this._scrollOffset += this._mVelocity * kB.AnimationDesiredFrameDuration;
			}
		
		} else if (this._scrollOffset < this.endOffset()) {
			// We're past the end of the scrollLayer
			
			if (this._mVelocity > 0 && !this._didReverseOnBounce) {
				this._direction = 1;
				this._didReverseOnBounce = true;
				this._bounceTime = NOW;
				this._bounceApex = Math.abs(this._scrollOffset - this.endOffset());
				this._mVelocity = -this._bounceApex/this.finishTransitionTime;
			}
			if (this._didReverseOnBounce) {
				e = NOW - this._bounceTime;
				p = e/this.finishTransitionTime;
				pe = ((p-1)*(p-1));
				if (p > 1) this.endDeceleration(this.endOffset());
				this._scrollOffset = this.endOffset() - (this._bounceApex * pe);

			} else {
				this._mVelocity -= ((this._scrollOffset - this.endOffset()) * 0.0025);
				this._scrollOffset += this._mVelocity * kB.AnimationDesiredFrameDuration;
			}
			
		} else {
			if (this._didReverseOnBounce) {
				if (this._direction == 1){
					this.endDeceleration(this.endOffset());
				} else {
					this.endDeceleration(0);
				}
				this._animating = false;
				return;
			}
			this._scrollOffset += this._mVelocity * kB.AnimationDesiredFrameDuration;
		}

		this.setOffset( this._scrollOffset );
		var self = this;
		if (this._animating)
			this._interval = $B.Animation.requestFrame.call( window, function(now){self.doDecelerationStep(now)} );
		
	},
	endDeceleration: function(snapToOffset) {
		//$B.Animation.cancelFrameRequest();
		this._animating = false;
		// if (this.__animationFrames && this.__animationFrames > 0) {
		// 	alert(this.__animationFrames + " frames animated");
		// 	this.__animationFrames = 0;
		// }

		if (this._interval) $B.Animation.cancelFrameRequest.call( window, this._interval );

		if (snapToOffset != undefined) this.setOffset(snapToOffset);
		if (this._scrollOffset > 0) {
			this._scrollOffset = 0;		
			this.setOffset( this._scrollOffset );
		} else if (this._scrollOffset < this.endOffset()) {
			this._scrollOffset = this.endOffset();
			this.setOffset( this._scrollOffset );
		}
		this._endOffset = null;
	},
	animationDidFinish: function() {
		
	},
	cancelScroll: function() {
		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent(kB.InteractionEnded, true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
		this._touchesEnded(evt);
		this.updateOffset( this._scrollOffset );
	},
	// bottomOffset: function() {
	// 	return this.clientHeight() - this.slider.scrollHeight();
	// },
	endOffset: function() {
		if (this._endOffset != null) return this._endOffset;
		if (!this.isVertical) {
			return this.clientWidth() - this.slider.scrollWidth();
		}
		return this.clientHeight() - this.slider.scrollHeight();
	},
	append: function( obj ) {
		var rtn = this.slider.append( obj );
		clearTimeout( this._appendTimer );
		var self = this;
		this._appendTimer = setTimeout( function() {
			if (self.autoSizeSliderView) {
				self.updateSliderSize();
			}
		}, 100);
		return rtn;
	},
	updateSliderMinSize: function() {
		var _set = false, self = this;
		if (this.clientHeight() > 0) {
			this.slider.minHeight( this.clientHeight() );
			_set = true;
		}
		if (this.clientWidth() > 0) {
			this.slider.minWidth( this.clientWidth() );
			_set = true;
		}
		if (_set) {
			this._sliderSizeAttempt = 0;
			return;
		}
		this._sliderSizeAttempt++;
		console.log("will retry _sliderSizeAttempt");
		if (this._sliderSizeAttempt >= 5) {
			this._sliderSizeAttempt = 0;
			return;
		}
		setTimeout(function() {
			self.updateSliderMinSize();
		}, 250);
	},
	updateSliderSize: function() {
		var width = 0, self = this,
			svs = [], i = 0, view = null;

		if (this.clientWidth() == 0 || this.clientHeight() == 0) {
			this.__autoSizeAttemptCount++;
			if (this.__autoSizeAttemptCount < 8) {
				setTimeout( function() {
					self.updateSliderSize();
				}, 50);
				return;
			}
		}
		svs = this.slider.subviews();
		for (i=0; i < svs.length; i++) {
			view = svs[i];
			if (!this.isVertical) {
				width += (this._elementSize() > 0) ? this._elementSize() : view.width();
			}
		}
		if (isNaN(width)) {
			console.log(self.id + " is waiting for subtreemodification");
			this.getElem().addEventListener("DOMSubtreeModified", function modificationListener(evt) {
				self.getElem().removeEventListener("DOMSubtreeModified", modificationListener, false);
				console.log(self.id + " DETECTED subtreemodification");
				setTimeout(function() {
					self.updateSliderSize();
				}, 25);
			}, false );
		}
		//console.log("new slider width with "+svs.length+" subviews and elementSize: "+this._elementSize()+" gives us: "+width);
		var _h = this.clientHeight();
		//this.slider.getElem().style.minWidth = this.clientWidth()+"px";
		//this.slider.getElem().style.minHeight = _h + "px";
		if (width > 0) {
			this.slider.width( width );
		}
		if (!this.isVertical) {
			this.slider.height( _h );
		}
		// else {
// 			this.slider.minHeight( _h );
// 		}
		this.slider.getElem().style.visibility = "";
	},
	getSubviewsRecursive: function() {
		return this.slider.getSubviewsRecursive();
	},
	redrawSlider: function() {
		this.updateSliderSize();
		this.setOffset( -1 * this.pageIndex*this._scrollPageSize() );
	},
	setTransform: function( transform ) {
		this.slider.layer.style.webkitTransform = transform;	
	},
	matrix3dForTransform: function( tX, tY, tZ ) {
		return "matrix3d( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, " + tX + ", " + tY + ", " + tZ + ", 1 )";
	},
	matrixForTransform: function( tX, tY ) {
		return "matrix( 1, 0, 0, 1, " + tX + ", " + tY +")";
	},
	updateOffset: function( offset ) {

		if (this.useTransforms) {
			this.slider.layer.style.webkitTransform = this.isVertical ? "translate3d( 0, " + offset + "px, 0 )" : "translate3d( " + offset + "px, 0, 0 )";
			//this.slider.layer.style.webkitTransform = this.isVertical ? this.matrix3dForTransform( 0, offset, 0 ) : this.matrix3dForTransform( offset, 0, 0 );
		} else {
			if (this.isVertical) {
				this.slider.layer.style.top = offset+"px";
			} else {
				this.slider.layer.style.left = offset+"px";			
			}

		}
	},
	setOffsetWithDelta: function( delta, animated ) {
		if ( animated == undefined) animated = true;
		if (typeof delta == "object") {
			if (this.allowWheelScroll) {
				if (animated) {
					var self = this,
						d = 250,
						fV = this.getElem().scrollLeft,
						tV = fV - delta.x;
						
					this.__animation = $B.Animation.animate({ id: this.id+"_Scroll", target: this, attribute: 'scrollLeft', from: fV, to: tV, duration:d, callback: function() {
						self.scrollLeft(tV);
						self.__animation = null;
					}
					});
				} else {
					this.scrollTop( "-=" + delta.y );
					this.scrollLeft( "-=" + delta.x );
				}
			}			
		} else {
			if (this.allowWheelScroll) {
				if (this.isVertical) {
					this.scrollTop( "-=" + delta );
				} else {
					this.scrollLeft( "-=" + delta );
				}
			} else {
				this.setOffset( this._initialOffset + delta );
			}
		}
	},
	setOffset: function( offset ) {
		this._initialOffset = offset;
		this.updateOffset( offset );
	},
	goToPageIndex: function ( index ) {
		if ( index*this._scrollPageSize() < Math.abs(this.endOffset())+5 ) {
			this.pageIndex = index;
			this.setOffset( -1 * this.pageIndex*this._scrollPageSize() );
			$B.dispatchEvent(this.id+":didSwitchPage", this.pageIndex);
			$B.dispatchEvent(this.id+":didSwitchIndex", this.pageIndex);
		}
	},
	prevPage : function() {
		var prevPage = this.pageIndex-1;
		if (prevPage > -1 ) {
			this.pageIndex = prevPage;
			this.setOffset( -1 * prevPage*this._scrollPageSize() );
			$B.dispatchEvent(this.id+":didSwitchPage", this.pageIndex);
			$B.dispatchEvent(this.id+":didSwitchIndex", this.pageIndex);
		}
	},
	nextPage : function() {
		var nextPage = this.pageIndex+1;
		if (nextPage*this._scrollPageSize() < Math.abs(this.endOffset())+5 ) {
			this.pageIndex = nextPage;
			this.setOffset( -1 * nextPage*this._scrollPageSize() );
			$B.dispatchEvent(this.id+":didSwitchPage", this.pageIndex);
			$B.dispatchEvent(this.id+":didSwitchIndex", this.pageIndex);
		}
	},
	// !TODO: Come back to this for final cleanup
	destroy: function() {
		this.slider.destroy();
		//delete this.slider;
		this._super();
	},
	_clear: function() {
		this.slider.destroySubObjects();
		this.slider._subViews = [];
		this.slider.html("");
	},
	empty: function() {
		this._clear();
	}
});

	Bind.classes.BDScrollView = BDScrollView;
	$B.ScrollView = {
		create: function( attr ) {
			return new BDScrollView( attr );
		}
	};
	
})($B);

/** BDTableView **/

(function($B) {

	/**
	 * BDTableView
	 * @constructor
	 * @extends BDScrollView
	 */
var BDTableView = Bind.classes.BDScrollView.extend({
	displayName: "BDTableView",
	init: function( attr ) {
		this.cell = function BDTableViewCell( data ) {
			if (typeof data == "string") {
				return new Elem("div", null, "BDTableViewCell", data);
			} else if (typeof data == "object") {
				return new Elem("div", null, "BDTableViewCell", data.text);
			}
		};
		
		
		this._super.call( this, attr );
		
		this.BDType = "BDTableView";
		this.layer.className = this.BDType;
		
		if (this.customClass != undefined) this.addClass(this.customClass);
		
		this._isEditing = false;
		this._didScroll = false;
		this._didReceiveMouseDown = false;
		this._interactionBeganOnCell = -1;
		this.preservesSelectionOnReload = true;
		this._preventEventBubble = false;
		this.preventDoubleClick = true;
		this._shouldIgnoreClick = false;

		
		this.slider.groupIdentity = attr.groupIdentity;
		var self = (this.controller != undefined) ? this.controller : this;
		$B.attachEventHook(this.id+":willBeginScrolling", function( evt ) {
			self._didScroll = true;
			self.deselectAllRows();
		});
		var _selfView = this;
		this.slider.getElem().addEventListener( kB.InteractionBegan, function( evt ) {
			if (_selfView._preventEventBubble === true) {
				_selfView._preventEventBubble = false;
				return;
			}
			if (self._shouldIgnoreClick) return;

			self._didScroll = false;
			self._didReceiveMouseDown = true;
			self._interactionBeganOnCell = evt.target;


			var pv = self.parentBDView();
			while (pv != null) {
				if (pv.typeIsEqualTo("BDTableView")) {
					pv.preventEventBubble(evt);
					break;
				}
				pv = pv.parentBDView();
			}
		}, false);

		this.slider.getElem().addEventListener( kB.InteractionEnded, function( evt ) {
			var cellElem = evt.target;
			if (!self._didScroll && !self._isEditing && self._didReceiveMouseDown && self._interactionBeganOnCell == cellElem) {
				while ((cellElem.__cellTable == undefined || cellElem.__cellTable != self ) && cellElem != null && cellElem != document.body) {
					cellElem = cellElem.parentNode;
				}
				if (self.preventDoubleClick) {
					self._shouldIgnoreClicks = true;
					console.log("ignoringClicks");
					setTimeout( function() {
						console.log("listeningClicks");
						self._shouldIgnoreClicks = false;
					}, 500);
				}

				self.deselectAllRows();
				$B.addClass(cellElem, "selected");
				self._selectionIndex = cellElem._rowIndex;
				try {
					self.didSelectRowAtIndex(cellElem._rowIndex, cellElem, evt);
				} catch (E) {
					console.log(this.id+":didSelectRowAtIndex:"+cellElem._rowIndex+": threw an error" );
					console.log(E);
				}
				self._didReceiveMouseDown = false;
			}
		}, true );

		this.getElem().controller = this;
		
		this._viewDidInit();

		return this;
	},
	preventEventBubble: function(evt) {
		this._preventEventBubble = true;
	},
	isDescendantOf: function( t ) {
		if (this.identifyType() == t) return true;
		if (t == "BDScrollView") return true;
		if (t == "BDView") return true;
		return false;
	}

});	
	Bind.classes.BDTableView = BDTableView;
	$B.TableView = {
		create: function( attr ) {
			return new BDTableView( attr );
		}
	};

})($B);

/** BDTableViewController **/

(function($B) {

	'use strict';
	
	/**
	 * BDTableViewController
	 * @constructor
	 */
	var BDTableViewController = Bind.classes.BDViewController.extend({
		displayName: "BDTableViewController",
		/**
		 * should be called by any subclasses
		 * @param  {Object} attr attributes to be applied
		 * @return {BDViewController}
		 */
		init: function( attr ) {
			var self = this;
			if (!attr) attr = {};
			
			this.dataSource = [];
			this.prefixCell = null;
			this.suffixCell = null;
			this._contentFilter = null;
			this.contentFilter = null;
			this._enabledContentItems = null;
			this._contentLastSet = 0;
			this._contentFilterLastRun = 0;
			this._contentFilterLastSet = 0;
			this._removeButtonOnRight = false;
			this._lastReload = 0;
			this._dataSourceIsBindable = false;
			this._tvId = $B.randomStringWithLength(14);
			this.focusTargets = {};
			this.useSimpleView = false;
			this.namespace = $B.currentNamespace();
	
			if (attr.useCSSTransitions == undefined) attr.useCSSTransitions = false;
			if (attr.goToBeginningOnReload == undefined) attr.goToBeginningOnReload = false;
			if (attr.groupIdentity == undefined) attr.groupIdentity = null;
			if (attr.enableSectionGrouping == undefined) attr.enableSectionGrouping = false;
			
			this._selectionIndex = -1;
			this._cells = [];
			
			this.BDType = "BDTableViewController";

			var _superInit = this._super;

			this._viewWillInit( attr );
			for (var i in attr) this[i] = attr[i];
			if (this.contentFilter != null) this.setContentFilter(this.contentFilter);

			attr.controller = this;
			attr.dynamicContent = null;
			if (attr.id == undefined) {
				attr.id = this._tvId;
			} else {
				this._tvId = attr.id;
			}
			

			if (this.useSimpleView) {
				this._view = $B.View.create(attr);
				this._view.slider = this._view;
				this._view.updateSliderSize = function() {};
			} else {
				this._view = $B.TableView.create(attr);
			}

			delete attr.id;
			attr.dynamicContent = this.dynamicContent;
			attr.displayName = this.displayName;
			_superInit.call(this, attr);

			$B.attachEventHook(this._tvId+":willBeginScrolling", function() {
				self.cancelSubviewEvents();
			});
			
			return this;
		},
		deselectAllRows: function() {
			for (var i = 0, len = this._cells.length; i < len; i++) {
				$B.removeClass(this._cells[i], "selected");
				this.didDeselectRowAtIndex( i, this._cells[i]);
			}
		},
		dataObjectAtIndex: function( index ) {
			return (this._enabledContentItems != null) ? this._enabledContentItems.objectAtIndex(index) : this.dataSource.objectAtIndex(index);
		},	
		cellForRowAtIndex: function( index ) {
			var data = this.dataObjectAtIndex(index);
			if (typeof data == "string") {
				return new Elem("div", null, "BDTableViewCell", data);
			} else if (typeof data == "object") {
				return new Elem("div", null, "BDTableViewCell", data.text);
			}
		},
		existingCellAtIndex: function( index ) {
			return this._cells[index];
		},
		didFocusRowAtIndex: function( index, cellElement ) {

		},
		didSelectRowAtIndex: function( index, cellElement ) {
			
		},
		didDeselectRowAtIndex: function( index, cellElement  ) {
			
		},
		focusRowAtIndex: function( index ) {
			var cell = this.existingCellAtIndex(index);
			if (typeof cell.requestScrollIntoView === "function") cell.requestScrollIntoView();

			this.selectRowAtIndex( index, false );
			this.didFocusRowAtIndex( index, cell );
		},
		selectRowAtIndex: function( index, performSelection ) {
			if (performSelection === undefined) performSelection = true;

			var cellElem = this._cells[index];
			if (!cellElem) return;
			var cellBDView = cellElem.controller;
			//if (cellElem.getElem) cellElem = cellElem.getElem();
			this.deselectAllRows();
			$B.addClass(cellElem, "selected");
			this._selectionIndex = cellElem._rowIndex;
			if (cellBDView != undefined) {
				try {
					cellBDView.requestScrollIntoView();
				} catch (E) {}
			}
			try {
				if (performSelection) {
					this.didSelectRowAtIndex(cellElem._rowIndex, cellElem, {});
				}
			} catch (E) {
				console.log(this.id+":didSelectRowAtIndex:"+cellElem._rowIndex+": threw an error" );
				console.log(E);
				console.log(E.stack);
			}
		},
		setDataSource: function( aDataSource ) {
			if (typeof aDataSource != "object") return;
			
			if (aDataSource.typeIsEqualTo && aDataSource.typeIsEqualTo("BDArray")) {
				this.dataSource = aDataSource;
			} else {
				this.dataSource = $B.Array.create().initWithArray(aDataSource);
			}

			var self = this;
			this._dataSourceIsBindable = true;
			if (!this.hasObservationHandlerForEvent("BDArray:didUpdate")) {
				this.addObservationHandler( "BDArray:didUpdate", function( v ) {
					console.log("TBDC: received BDArray:didUpdate observerationEvent");
					self.reloadData();
				});
			}
			if (!this.hasObservationHandlerForEvent("objectDidChangeAtIndex")) {
				var __TO = null;
				this.addObservationHandler("objectDidChangeAtIndex", function(b) {
					clearTimeout(__TO);
					__TO = setTimeout(function() {
						var index = b.index;
						if (self.currentDataSource() != self.dataSource) {
							index = self.currentDataSource().indexOfObject( self.dataSource.objectAtIndex(index) );
						}
						console.log("TBDC: received binding event objectDidChangeAtIndex "+index + " did change "+b.property+" to value: " +b.value);
						if (index < 0) return;
						self.reloadRowAtIndex(index);
					},10);
				});
			}
			this.dataSource.addObserverForEvent(this, "BDArray:didUpdate");
			this.dataSource.addObserverForEvent(this, "objectDidChangeAtIndex");
			this._contentLastSet = NOW();
			this.applyContentFilter();
		},
		setContentFilter: function(f) {
			var match = null, attr = null, matchOp = null;
			if (f == null) {
				this._contentFilter	= null;
				this._enabledContentItems = null;
			}
			try {
				if (typeof f == "string") {
					if (f.indexOf("==")>0) {
						attr = f.split("==");
						match = attr[1];
						attr = attr[0];
						matchOp = "==";
						this._contentFilterString = f;
					} else if (f.indexOf("!=") > 0) {
						attr = f.split("!=");
						match = attr[1];
						attr = attr[0];
						matchOp = "!=";
						this._contentFilterString = f;
					}
					this._contentFilter = function(item) {
						if (matchOp == "==" && item[attr] == match) return true;
						if (matchOp == "!=" && item[attr] != match) return true;
						return false;
					};
				} else if (typeof f == "function") {
					this._contentFilter = f;
				}
			} catch (E) {
				console.log(E);
			}
			this._contentFilterLastSet = NOW();
		},
		applyContentFilter: function() {
			if (this._contentFilter != null) {
				this._enabledContentItems = $B.Array.create();
				for (var i = 0, len = this.dataSource.length(); i<len; i++) {
					if (this._contentFilter(this.dataSource.objectAtIndex(i))) this._enabledContentItems.push(this.dataSource.objectAtIndex(i));
				}
			} else {
				this._enabledContentItems = null;
			}
			this._contentFilterLastRun = NOW();
		},
		switchLanguage: function( lang ) {
			this.reloadData();
		},
		cancelSubviewEvents: function() {
			var sv = this.view().slider.subviews();
			for (var i = 0, len = sv.length; i<len; i++) {
				if (sv[i].cancelEvents) {
					sv[i].cancelEvents();
				}
			}
		},
		_clear: function() {
			if (this.prefixCell != null) {
				this.prefixCell.retain = true;
			}
			if (this.suffixCell != null) {
				this.suffixCell.retain = true;
			}
			this.view().slider.destroySubObjects();
			this.view().slider._subViews = [];
			this.view().slider.html("");
		},
		_updateCellIndexes: function() {
			for ( var i = 0, len = this._cells.length; i < len; i++ ) {
				this._cells[i]._rowIndex = i;
				this._cells[i].__cellTable = this;
			}
		},
		insertRowAtIndex: function( index ) {
			if (index == undefined) index = this._cells.length;
			var d = this.dataObjectAtIndex( index );
			var c = this.cellForRowAtIndex( index );
			if ( d && index >= this._cells.length ) {
				this.view().slider.append( c );
				this._cells.push( c );
			} else {
				this.view().slider.getElem().insertBefore( c, this._cells[index] );
				this._cells.splice(index, 0, c);
			}
			this._updateCellIndexes();
			return c;
		},
		reloadRowAtIndex: function( index ) {
			if (this.dataObjectAtIndex(index) == undefined) return;

			var newCell = this.cellForRowAtIndex( index );
			if (this._cells[index]) {
				this._cells[index].parentNode.insertBefore( newCell, this._cells[index] );
				this._cells[index].parentNode.removeChild( this._cells[index] );
			}
			newCell._rowIndex = index;
			newCell.__cellTable = this;

			if (this._isEditing) {
				if (this._removeButtonOnRight) {
					newCell.appendChild( $B.Button.create({ customClass: "BDTableViewCellRemoveButton", text: "&ndash;", cellIndex: i, actionOnMouseDown: true, action: function(evt) { evt.preventDefault();evt.stopPropagation();self._removeRowAtIndex( this.cellIndex ); } }).getElem() );
				} else {
					newCell.controller.prepend( $B.Button.create({ customClass: "BDTableViewCellRemoveButton", text: "&ndash;", cellIndex: i, actionOnMouseDown: true, action: function(evt) { evt.preventDefault();evt.stopPropagation();self._removeRowAtIndex( this.cellIndex ); } }) );
				}
			}
			
			this._cells[index] = newCell;
			if (this._selectionIndex == index) {
				$B.addClass(this._cells[index], "selected");
			}
		},
		reloadData: function() {
			if (this.dataSource == undefined) return;
			this.notifyObserversOfEvent('willReloadData');
			
			var v = this.view();
			if (this._contentFilter != null) { // && this._contentFilterLastSet >= this._contentFilterLastRun
				this.applyContentFilter();
			}
			if ($B.currentNamespace() != this.namespace) {
				console.log("BDTBDC: WARNING: CurrentNamespace mismatch: "+$B.currentNamespace() + " should be "+ this.namespace);
			}
			this._clear();
			v.slider.detach();
			this._cells = [];
			var self = this;
			var sectionTitle = null;
			var currentSection = null;
	// 		if (this.dataSource[0].editor_groupBy != undefined) {
	// 			sectionTitle = "";
	// 			currentSection = "";
	// 			var sortBy = this.dataSource[0].editor_groupBy;
	// 			this.dataSource.sort(function( a, b ) {
	// 				var x = a[sortBy];
	// 				var y = b[sortBy];
	// 				console.log( x+ " " +y);
	// 				return ((x < y) ? -1: ((x > y) ? 1: 0));
	// 			});
	// 		}
			if (this.prefixCell != null) {
				if (this.prefixCell.BDType != undefined) {
					this.prefixCell.addClass("BDTableViewPrefixCell");
					this.prefixCell.getElem().__cellTable = this;
					this.prefixCell.getElem()._rowIndex = -1;
					this._cells.push( this.prefixCell.getElem() );
					v.slider.append( this.prefixCell );
					
					if (!this.retain) {
						this.prefixCell.retain = false;	
					}
				} else {
					$B.addClass(this.prefixCell, "BDTableViewPrefixCell");
					this.prefixCell.__cellTable = this;
					this.prefixCell._rowIndex = -1;
					this._cells.push( this.prefixCell );	
					v.slider.append( this.prefixCell );
				}
			}
			var ds = (this._enabledContentItems != null) ? this._enabledContentItems : this.dataSource;
			
			for (var i = 0, len = ds.length(); i < len; i++) {
				if (currentSection != null && this.enableSectionGrouping) {
					if (currentSection != ds.objectAtIndex(i)[ds.objectAtIndex(i).editor_groupBy]) {
						if (ds.objectAtIndex(i)[ds.objectAtIndex(i).editor_groupBy] != undefined) {
							sectionTitle = ds.objectAtIndex(i)[ds.objectAtIndex(i).editor_groupBy];
							currentSection = ds.objectAtIndex(i)[ds.objectAtIndex(i).editor_groupBy];
							if (sectionTitle.indexOf('-') != -1) {
								sectionTitle = sectionTitle.split('-')[1];
							}
							v.slider.append( $B.Label.create({ registerWithUIServer: false, id: this.id+"SectionHeader", customClass: "BDTableViewSectionHeader", text: sectionTitle }) );
						}
					}
				}
				var cell = this.cellForRowAtIndex(i);
				cell._rowIndex = i;
				cell.__cellTable = this;
	
				if (this.preservesSelectionOnReload && this._selectionIndex > -1 && this._selectionIndex == i) {
					$B.addClass(cell, "selected");
				}
				if (this._isEditing) {
					if (this._removeButtonOnRight) {
						cell.appendChild( $B.Button.create({ customClass: "BDTableViewCellRemoveButton", text: "&ndash;", cellIndex: i, actionOnMouseDown: true, action: function(evt) { evt.preventDefault();evt.stopPropagation();self._removeRowAtIndex( this.cellIndex ); } }).getElem() );
					} else {
						cell.controller.prepend( $B.Button.create({ customClass: "BDTableViewCellRemoveButton", text: "&ndash;", cellIndex: i, actionOnMouseDown: true, action: function(evt) { evt.preventDefault();evt.stopPropagation();self._removeRowAtIndex( this.cellIndex ); } }) );
					}
				}
				v.slider.append( cell );
				this._cells.push( cell );
			}
			
			if (this.suffixCell != null) {
				if (this.suffixCell.BDType != undefined) {
					this.suffixCell.addClass("BDTableViewSuffixCell");
					this.suffixCell.getElem().__cellTable = this;
					this.suffixCell.getElem()._rowIndex = i+1;
					this._cells.push( this.suffixCell.getElem() );
					v.slider.append( this.suffixCell );
	
					if (!this.retain) {
						this.suffixCell.retain = false;	
					}
				} else {
					$B.addClass( this.suffixCell, "BDTableViewSuffixCell" );
					this.suffixCell.__cellTable = this;
					this.suffixCell._rowIndex = i+1;
					this._cells.push( this.suffixCell );
					v.slider.append( this.suffixCell );
				}
			}
			v.slider.reattach();
			if (v._elementSize && v._elementSize() > 0 && v.isVertical === false) {
				// var additionalCells = 0;
				// if (this.prefixCell != null) additionalCells += this.prefixCell.height();
				// if (this.suffixCell != null) additionalCells += this.suffixCell.height();
				v.slider.width( this.view()._elementSize() * this._cells.length );
			} else {
				this.view().updateSliderSize();
			}
			if (this.goToBeginningOnReload == true) {
				this.setOffset( 0 );
			}
			this._lastReload = NOW();

			this.notifyObserversOfEvent('didReloadData');
			$B.dispatchEvent("BDTableView:"+this.id+":didReloadData", this);
		},
		currentDataSource: function() {
			return (this._enabledContentItems != null) ? this._enabledContentItems : this.dataSource;
		},
		currentSelectedRowIndex: function() {
			return this._selectionIndex;
		},
		_removeRowAtIndex: function( index ) {
			var self = this;
			this.removeRowAtIndex.apply( self, arguments );
		},
		removeRowAtIndex: function( index ) {
			
		},
		_beginEditing: function() {
			this._isEditing = true;
			this.reloadData();
			var self = this;
			setTimeout( function() {
				self.view().addClass("isEditing");
			}, 10);
			if (this._editBtn != null) {
				this._editBtn.setText({en:"Done", fr: "OK"});
			}
		},
		_endEditing: function() {
			this._isEditing = false;
			this.reloadData();
			var self = this;
			setTimeout( function() {
				self.view().removeClass("isEditing");
			}, 10);

			if (this._editBtn != null) {
				this._editBtn.setText({en:"Edit", fr: "Modifier"});
			}
		},
		setEditButton: function( b ) {
			this._editBtn = b;
		},
		setEditing: function( e ) {
			if (e == -1) {
				if (this._isEditing) {
					this._endEditing();
				} else {
					this._beginEditing();
				}
			} else if (e == true) {
				this._beginEditing();
			} else {
				this._endEditing();
			}
		},
		setPreservesSelectionOnReload: function( s ) {
			this.preservesSelectionOnReload = s;	
		},
		takeFocus: function() {
			this._super();
			if (this._selectionIndex === -1) {
				this._selectionIndex = 0;
			}
			this.view().addClass('BDFocused');
			this.focusRowAtIndex(this.currentSelectedRowIndex(), false);
		},
		releaseFocus: function() {
			this._super();
			this.view().removeClass('BDFocused');
			this.deselectAllRows();
		},
		click: function() {
			return this.didSelectRowAtIndex(this.currentSelectedRowIndex());
		},
		focusUp: function() {
			var cFI = this.currentSelectedRowIndex();
			if (this.view().isVertical && cFI > 0) {
				cFI -= 1;
				return this.focusRowAtIndex(cFI, false);
			}
			return this._super();
		},
		focusRight: function() {
			var cFI = this.currentSelectedRowIndex();

			if (!this.view().isVertical && cFI < this._cells.length) {
				cFI += 1;
				return this.focusRowAtIndex(cFI, false);
			}
			return this._super();
		},
		focusDown: function() {
			var cFI = this.currentSelectedRowIndex();
			if (this.view().isVertical && cFI < this._cells.length) {
				cFI += 1;
				return this.focusRowAtIndex(cFI, false);
			}
			return this._super();
		},
		focusLeft: function() {
			var cFI = this.currentSelectedRowIndex();

			if (!this.view().isVertical && cFI > 0) {
				cFI -= 1;
				return this.focusRowAtIndex(cFI, false);
			}
			return this._super();
		}
	});
	Bind.classes.BDTableViewController = BDTableViewController;
	$B.TableViewController = {
		create: function( attr ) {
			return new BDTableViewController( attr );
		}
	};

})($B);

/** BDImageView **/

(function($B) {

	'use strict';
	
	kB.ImageViewBlankImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
	
	/**
	 * BDImageView
	 * @constructor
	 * @extends BDView
	 */
	var BDImageView = Bind.classes.BDView.extend({
		displayName: "BDImageView",
		init: function( prop ) {
			if (!this.BDType) this.BDType = "BDImageView";
			if (!prop) prop = {};
			this.autoLoad = true;
			this.url = "";
			this.sizeToFit = true;
			this.scalingType = kB.ViewScalingTypeFull;
			this.doubleTapToFill = false;
			this.useImageElement = true;
			this.enableRetinaDisplay = false;
			this.positionVector = kB.ViewVectorCenter;
			this.scaleUp = false;
			this.retinaMedia = false;
			this._sizeDetectCount = 0;
			this._width = null;
			this._height = null;
			this.defaultUrl = null;
			this.useTransition = false;
			this.onError = function() {};
			
			this._super( prop );

			if (prop.id == undefined) {
				var rand = Math.floor(Math.random()*100000);
				prop.id = "BDImage_"+rand;
			}
			
			for (var i in prop) this[i] = prop[i];

			if (this.BDType == "BDImageView") {
				
				this.isLoaded = false;
				this.imageElem = null;
				this.imageView = null;
						
				if (!this.useImageElement && $B.browser.blackberry) {
					this.useImageElement = true;
					this.scalingType = kB.ViewScalingTypeFit;
				}
	
				if (this.sizeToFit == false) this.scalingType = kB.ViewScalingTypeNone;
				
				this.layer.className = "BDImageView BDImageViewNoImage";
				//this.layer = new Elem("div", this.id, "");
				
				if (this.customClass != null) {
					$B.addClass( this.layer, this.customClass );
				}
	
	
				if (this.doubleTapToFill) {
					var self = this;
					this.layer.addEventListener("dblclick", function() {
						self.scalingType = (self.scalingType == kB.ViewScalingTypeFit) ? kB.ViewScalingTypeFull : kB.ViewScalingTypeFit;
						self.layoutImageInView(1);
					}, false);
				}
			}
			
			$B.registerView( this );
			
			this._creationTime = NOW();
			
			
			this.layer.object = this;
			this.layer.view = this;
			this.layer.controller = this;

			if (this.autoLoad) {
				this.load();
			}

			this._viewDidInit();
			
			return this;
		},
		reload: function() {
			if (this.url != "") this.load(this.url);
		},
		currentURL: function() {
			return this.url;
		},
		load: function( url ) {
			if (url != undefined) {
				if (typeof url == "object" && url.url !== undefined) {
					url = url.url;
				}
				if (url == this.url && this.isLoaded == true){
					return;
				}
				this.url = url;
				this._loadRequestTime = NOW();
			}
			
			if (this.url == null || this.url == "") {
				if (this.defaultUrl != null) return this.load(this.defaultUrl);
				this.addClass("BDImageViewNoImage");
				return;
			}
			
			if ($B.ContentManager != undefined && typeof this.url == "string" && this.url.indexOf(":") > 0 && this.url.indexOf("http") != 0) {
				this.url = $B.ContentManager.transformURL( this.url );
			}

			if (this.url.indexOf("@2x") > 0) {
				this.retinaMedia = true;
			} else {
				this.retinaMedia = false;
			}
			
			if (this.useTransition) {
				$B.removeClass(this.layer, 'ImageLoaded');
			}
// 			if (this.imageElem != null) {
// 				var imgForGC = this.imageElem;
// 				this.shouldFireLoadEvents = false;
// 				var self = this;
// 				var _cleanup = function() {
// 					if (self.useImageElement && imgForGC.parentNode && imgForGC.parentNode.removeChild ) {
// 						imgForGC.parentNode.removeChild( imgForGC );
// 					}
// 					imgForGC.src = kB.ImageViewBlankImage;
// 					setTimeout(function() {
// 						imgForGC = null;
// 						delete imgForGC;
// 						//console.log("cleaning up");
// 					}, 30000);
// 				};
// 				if (this.useTransition == true) {
// 					this.animate( 'opacity', 0, { duration: 100 }, function() {
// 						_cleanup();
// 					});
// 				} else {
// 					_cleanup();
// 				}
// 			}
			
			if (this.imageElem == null) {
				this.imageElem = new Elem("img", this.id+"_imgElem", "BDImageViewElement");
				this.imageElem.style.position = "absolute";
				this.imageElem.view = this;
				this.imageElem.controller = this;
			}
			
			if (!this.useImageElement) {
				if (this.imageView != null) {
					this.imageView.parentNode.removeChild( this.imageView );
					this.imageView = null;
				}
				this.imageView = new Elem("div", this.id+"_imgElem", "BDImageViewElement");
				this.layer.appendChild( this.imageView );
				this.imageView.view = this;
				this.imageView.controller = this;
			}
			
			
			var self = this;

			this.imageElem.addEventListener('load', function loadListener() {
				self.imageElem.removeEventListener( 'load', loadListener, false);
				self.didFinishLoading.apply( self, arguments );
			}, false);
			this.imageElem.addEventListener('error', function errorListener() {
				self.imageElem.removeEventListener('error', errorListener, false);
				self.didFailWithError.apply( self, arguments );
			}, false);
			this.imageElem.addEventListener('abort', function abortListener() {
				self.imageElem.removeEventListener('error', abortListener, false);
				self.didFailWithAbort.apply( self, arguments );
			}, false);

			if (this.url != undefined && this.url != null) {
				$B.dispatchEvent(this.id+":willStartLoading", this.url);
				$B.addClass(this.layer, "BDImageView_IsLoading");
				this.imageElem.src = null;
				this.imageElem.style.visibility = "hidden";
				setTimeout( function() {
					self.shouldFireLoadEvents = true;
					self.imageElem.src = self.url;
				}, 20);
			}

		},
		layoutImageInView: function( animate ) {
			if (animate == undefined) animate = false;
			if (this.__imageSizeAttempt == undefined) this.__imageSizeAttempt = 0;
			// Restore default image element styles
			this.imageElem.style.width  = "";
			this.imageElem.style.height = "";
			this.imageElem.style.left   = "";
			this.imageElem.style.top    = "";
			
			// cache default sizes
			var ew = this.clientWidth(),
				eh = this.clientHeight(),
				iw = this.imageElem.width,
				ih = this.imageElem.height;

			var self = this;
				
			if (this.__imageSizeAttempt < 5 && (ew == 0 || eh == 0 || iw == 0 || ih == 0)) {
				this.__imageSizeAttempt++;
				setTimeout(function() {
					self.layoutImageInView();
				}, 100);
				return;
			}
			
			// Check for high res screen and do some things
			if (this.retinaMedia) {
				var w = this.imageElem.width / 2;
				var h = this.imageElem.height / 2;
				this.imageElem.width = w;
				this.imageElem.height = h;
				iw = w;
				ih = h;
			}
				
			// reset local variables
			var width = iw,
				height = ih,
				top = 0,
				left = 0,
				viewAspect = (ew / eh),
				photoAspect = (iw / ih);
			
			if (this.scalingType == kB.ViewScalingTypeFull) {
			
				if (photoAspect > viewAspect) { // landscape
					width  = (eh * photoAspect);
					height = eh + 1;
					if (width > ew) {
						left += Math.round((ew - width)/2);
					}
				} 
				else { // portrait and square
					width = ew + 1;
					height = (width / photoAspect);
					if (height > eh) {
						top += Math.round((eh - height)/2);
					}
				
				}
						
			} else if (this.scalingType == kB.ViewScalingTypeFit) {
				if (this._width != null) {
					width = this._width;
					this.imageElem.width = width;
				}
				
				if (this._height != null) {
					height = this._height;
					this.imageElem.height = height;
				}
				
				if ( ew == 0 || eh == 0 || width == 0 || height == 0 ) {
					setTimeout(function() {
						self.layoutImageInView();
					}, 200);
				}
				
				if ( width > ew || height > eh ) {
					var oW = width - ew;
					var oH = height - eh;
					var overflowDirection = (oW > oH) ? 0 : 1;
					if (overflowDirection == 1) {
						// portrait fit
						height = eh;
						width  = eh * photoAspect;
					} else {
						// landscape fit
						width = ew;
						height = ew / photoAspect;
					}
					oW = width - ew;
					oH = height - eh;
					if (oW > 0 || oH > 0) {
						overflowDirection = (oW > oH) ? 0 : 1;
						if (overflowDirection == 1) {
							// portrait fit
							height = eh;
							width  = eh * photoAspect;
						} else {
							// landscape fit
							width = ew;
							height = ew / photoAspect;
						}					
					}
				}
				
			}
			
			// If we're not supposed to scale UP and the image is
			// smaller than the imageView, simply center the image.
			if (!this.scaleUp && (iw < ew || ih < eh)) {
				if (this.positionVector == kB.ViewVectorBottom) {
					left = Math.round((ew - iw)/2);
					top  = Math.round((eh - ih));
					width = iw;
					height = ih;
				} 
				else if (this.positionVector == kB.ViewVectorTop) {
					left = Math.round((ew - iw)/2);
					top  = 0;
					width = iw;
					height = ih;
				} else {
					left = Math.round((ew - iw)/2);
					top  = Math.round((eh - ih)/2);
					width = iw;
					height = ih;
				}
			}
			// otherwise:
			// round off the calculations and calculate the position
			else {
				left = Math.round((ew - width)/2);
				top  = Math.round((eh - height)/2);
				width = Math.round( width );
				height = Math.round( height );
			}
			
			// store the calculations in an BDRect
			this._bounds = { origin: { x: left, y: top }, size: { 'width': width, 'height': height } };
			
			if (this.useImageElement) {
				this.imageElem.style.width  = width + "px";
				this.imageElem.style.height = height + "px";
				this.imageElem.style.left   = left + "px";
				this.imageElem.style.top    = top + "px";
			} else {
				this.imageView.style.backgroundImage = "url("+this.url+")";
				this.imageView.style.backgroundRepeat = "no-repeat";
				if (this.scalingType == kB.ViewScalingTypeFull) {
					this.imageView.style.webkitBackgroundSize  = width+"px "+height + "px";
					this.imageView.style.backgroundPosition    = left + "px "+top + "px";
					this.imageView.style.width  = "100%";
					this.imageView.style.height = "100%";
				}
			}

			this.imageElem.style.visibility = "visible";
			$B.addClass(this.layer, "ImageLoaded");

			setTimeout( function() {
				self.imageElem.style.webkitTransform = "scale(1.0)";
			}, 0);
		},
		didFinishLoading: function( evt ) {
			
			if (!this.shouldFireLoadEvents) return;
			if (this.imageElem.src == kB.ImageViewBlankImage) {
				$B.removeClass(this.layer, 'ImageLoaded');
				return false;
			}
			$B.removeClass( this.layer, "BDImageView_IsLoading" );
			$B.removeClass( this.layer, "BDImageViewNoImage" );

			$B.dispatchEvent(this.id+":didFinishLoading", this);
			$B.dispatchEvent("anImageView:didFinishLoading", this);

			if (this.useImageElement) {
				this.layer.appendChild( this.imageElem );
			}
			
			this.layoutImageInView();
			var self = this;		
			if (this.isLoaded) {
				//this.fadeIn();
			}
			this.isLoaded = true;
			
		},
		didFailWithAbort: function( evt ) {
			if (!this.shouldFireLoadEvents) return;
			$B.removeClass(this.layer, "BDImageView_IsLoading");
			$B.removeClass(this.layer, "ImageLoaded");
		},
		didFailWithError: function( evt ) {
			if (!this.shouldFireLoadEvents) return;
			
			//console.log("BDImageView:"+this.id+":failedToLoadAssetAtURL:"+this.url);
			
			//this.load( $B.ContentManager.uiAsset('image_placeholder.png') );
			
			this.onError(evt);
						
			$B.removeClass(this.layer, "BDImageView_IsLoading");
			$B.removeClass(this.layer, "ImageLoaded");
			$B.dispatchEvent(this.id+":didFailWithError", evt);
		}
	});


	
	Bind.classes.BDImageView = BDImageView;
	$B.ImageView = {
		create: function( prop ) {
			return new BDImageView(prop);
		}
	};
	
})($B);
/** BDMovieView **/

(function($B) {

	'use strict';

	kB.ImageViewBlankImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
	
	/**
	 * BDMovieView
	 * @constructor
	 * @extends BDMovieView
	 */
	var BDMovieView = Bind.classes.BDImageView.extend({
		displayName: "BDMovieView",
		init: function( prop ) {
			if (!this.BDType) this.BDType = "BDMovieView";
			this.mediaElem = null;
			this.controls = false;
			this.autoPlay = false;
			this.preload  = true;
			this.loop     = false;
			this._playing = false;
			if (!prop.useTransition) prop.useTransition = true;
			
			this._super(prop);
						
			return this;
		},
		load: function( url, cont ) {
			if (url != undefined) {
				if (typeof url == "object" && url.url !== undefined) {
					url = url.url;
				}
				if (url == this.url && this.isLoaded == true){
					return;
				}
				this.url = url;
				this._loadRequestTime = NOW();
			}
			
			if (this.url == null || this.url == "") {
				if (this.defaultUrl != null) return this.load(this.defaultUrl);
				this.addClass("BDMovieViewNoMedia");
				return;
			}
			
			if ($B.ContentManager != undefined && typeof this.url == "string" && this.url.indexOf(":") > 0 && this.url.indexOf("http") != 0) {
				this.url = $B.ContentManager.transformURL( this.url );
			}
			var self = this;
			if (this.useTransition) {
				$B.removeClass(this.layer, 'MediaLoaded');
			}
			if (this.mediaElem == null) {
				this.mediaElem = new Elem("video", this.id+"_mediaElem", "BDMovieViewElement");
				this.mediaElem.style.position = "absolute";
				this.mediaElem.view = this;
			} else if (this.useTransition && !$B.device.isiOS() && !cont) {
				this._playRequested = this._playing;
				this.animate( 'opacity', 0, {duration: 300}, function() {
					this.pause();
					this.layer.removeChild( this.mediaElem );
					delete this.mediaElem;
					this.mediaElem = null;
					this.load();
					this.animate('opacity', 1.0);
					if (this._playRequested) {
						this.play();
					}
				});
				return;
			} else if (!$B.device.isiOS()) {
				this.layer.removeChild( this.mediaElem );
				delete this.mediaElem;
				this.mediaElem = null;
				this.load(this.url, 1);
				if (this._playRequested) {
					this.play();
				}
				return;
			}
			console.log("movie continuing to load");
			
			if (this.posterImage != null) {
				if (Bind.ContentManager != undefined && typeof this.posterImage == "string" && this.posterImage.indexOf(":") > 0 && this.posterImage.indexOf("http") != 0) {
					this.posterImage = Bind.ContentManager.transformURL( this.posterImage );
				}

				this.mediaElem.poster = this.posterImage;
			}
						
			// apply HTML5 attributes
			if (this.controls) {
				this.mediaElem.setAttribute('controls', 'yes');
			}
			if (this.autoPlay) {
				this.mediaElem.setAttribute('autoplay', 'yes');
			}
			if (this.preload) {
				this.mediaElem.setAttribute('preload', 'yes');
			}
			if (this.loop) {
				this.mediaElem.setAttribute('loop', 'yes');
			}
			
			
			this.mediaElem.addEventListener('play', function( evt ) {
				self._didPlay.apply(self, arguments);
			}, false);
			
			this.mediaElem.addEventListener('progress', function( evt ) {
				self._didUpdateProgress.apply(self, arguments);		
			}, false);
			
			this.mediaElem.addEventListener('pause', function( evt ) {
				self._didPause.apply(self, arguments);		
			}, false);

			this.mediaElem.addEventListener('loadstart', function( evt ) {
				//self.layoutMovieInView.apply( self, arguments );
			}, false );
			this.mediaElem.addEventListener('load', function loadListener() {
				self.mediaElem.removeEventListener('load', loadListener, false);
				self.didFinishLoading.apply( self, arguments );
			}, false);
			this.mediaElem.addEventListener('error', function errorListener() {
				self.mediaElem.removeEventListener('error', errorListener, false);
				self.didFailWithError.apply( self, arguments );
			}, false);
			this.mediaElem.addEventListener('abort', function abortListener() {
				self.mediaElem.removeEventListener('error', abortListener, false);
				self.didFailWithAbort.apply( self, arguments );
			}, false);
			
			this.layer.appendChild( this.mediaElem );
			

			if (this.url != undefined && this.url != null) {
				$B.dispatchEvent(this.id+":willStartLoading", this.url);
				$B.addClass(this.layer, "BDMovieView_IsLoading");
				this.mediaElem.innerHTML = "";
				setTimeout( function() {
					var mime = "video/mp4";
					self.shouldFireLoadEvents = true;
					if (typeof self.url != "string" && self.url.length) {
						self.mediaElem.innerHTML = '';
						for (var i in self.url) {
							if ((self.url[i].match(/ogg/ig)) || (self.url[i].match(/ogv/ig))) {
								mime = "video/ogg";
							} else if ( (self.url[i].match(/webm/ig)) ) {
								mime = "video/webm";
							}
							self.mediaElem.appendChild( new Elem({ tag: "source", src: self.url[i], type: mime }) );
						}
					} else {
						if ((self.url[i].match(/ogg/ig)) || (self.url[i].match(/ogv/ig))) {
							mime = "video/ogg";
						} else if ( (self.url[i].match(/webm/ig)) ) {
							mime = "video/webm";
						}
						self.mediaElem.appendChild( new Elem({ tag: "source", src: self.url[i], type: mime }) );
					}
					
				}, 20);
			}

		},
		didFinishLoading: function( evt ) {
			
			if (!this.shouldFireLoadEvents) return;
			if (this.mediaElem.src == kB.ImageViewBlankImage) {
				$B.removeClass(this.layer, 'MediaLoaded');
				return false;
			}
			$B.removeClass( this.layer, "BDMovieView_IsLoading" );
			$B.removeClass( this.layer, "BDMovieViewNoMedia" );

			$B.dispatchEvent(this.id+":didFinishLoading", this);
			$B.dispatchEvent("aMovieView:didFinishLoading", this);

			// if (this.useImageElement) {
			// 	this.layer.appendChild( this.imageElem );
			// }
			
			//this.layoutImageInView();
			var self = this;		
			if (this.isLoaded) {
				//this.fadeIn();
			}
			this.isLoaded = true;
			
		},
		setSize: function( w, h ) {
			this._super(w,h);
			this.mediaElem.width = w;
			this.mediaElem.height = h;
		},
		play: function() {
			this._playRequested = true;
			this.mediaElem.play();
		},
		pause: function() {
			this.mediaElem.pause();
		},
		currentTime: function() {
			return this.mediaElem.currentTime;
		},
		duration: function() {
			return this.mediaElem.duration;
		},
		volume: function(v) {
			if (v != undefined) {
				this.mediaElem.volume = v;
			}
			return this.mediaElem.volume;
		},
		isPlaying: function() {
			return this._playing;
		},
		didFailWithAbort: function( evt ) {
			if (!this.shouldFireLoadEvents) return;
			$B.removeClass(this.layer, "BDMovieView_IsLoading");
			$B.removeClass(this.layer, "MediaLoaded");
		},
		didFailWithError: function( evt ) {
			if (!this.shouldFireLoadEvents) return;
			
			this.onError(evt);
						
			$B.removeClass(this.layer, "BDMovieView_IsLoading");
			$B.removeClass(this.layer, "ImageLoaded");
			$B.dispatchEvent(this.id+":didFailWithError", evt);
		},
		_didPause: function( evt ) {
			this._playing = false;
		},
		_didPlay: function( evt ) {
			this._playing = true;
		},
		_didUpdateProgress: function( evt ) {
			
		}
	});


	
	Bind.classes.BDMovieView = BDMovieView;
	$B.MovieView = {
		create: function( prop ) {
			return new BDMovieView(prop);
		}
	};
	
})($B);
/** BDTabView **/

(function($B) {

	/**
	 * BDTabView
	 * @constructor
	 * @extends BDView
	 */
	var BDTabView = Bind.classes.BDView.extend({
		displayName: "BDTabView",
		init: function(attr) {
			this._super( attr );
			this.tabs 				= [];
			this.tabsByID 			= [];
			this.currentTabID		= 0;
			this.transition			= "block";
			this.BDType 		= "BDTabView";
			this.nextTabID			= "";
			this.hasTabs			= true;
			this.transitionDuration = 250;
			this.onSwitchTab		= null;
			this.willSwitchTab		= null;
			this.didSwitchTab		= null;
			this.tabLocation		= kB.ViewVectorTop;
			this.localizations = [];
			for ( var i in attr ) this[i] = attr[i];
			$B.registerView(this);
			this.addClass("BDTabView");
		
			this.tabContainer 		= new Elem("div", this.id+"_tabContainer", "BDTabViewTabContainer");
			this.contentContainer 	= new Elem("div", this.id+"_contentContainer", "BDTabViewContentContainer");
			//this.layer = new Elem('div', this.id, "BDTabView");
			
			
			this.layer.controller = this;
			//this.contentContainer.style.clear = "both";
			
			if (this.tabSize == kB.TabViewSizeSmall) {
				$B.addClass( this.layer, "small" );
			}
	 
			if (this.hasTabs == false) this.tabContainer.style.display = "none";
	 
	 		if (this.tabLocation == kB.ViewVectorBottom || this.tabLocation == kB.ViewVectorRight) {
				this.layer.appendChild(this.contentContainer);
				this.layer.appendChild(this.tabContainer);
	 		} else {
		 		this.layer.appendChild(this.tabContainer);
				this.layer.appendChild(this.contentContainer);
	 		}
			
			return this;
		},	
		addTab: function(attr) {
			var newTabIndex = this.tabs.length;
			attr.transition = this.transition;
			attr.customClass = attr.customTabClass;
			attr.transitionDuration = this.transitionDuration / 2;
			
			if (this.tabsByID[attr.id] != undefined) {
				newTabIndex = this.tabsByID[attr.id].tabIndex;
				this.removeTab(attr.id);
			}

			this.tabs[newTabIndex] = new BDTab(attr, this);
			this.tabs[newTabIndex].tabIndex = newTabIndex;
			this.tabsByID[this.tabs[newTabIndex].id] = this.tabs[newTabIndex];
			if (this.transition.toLowerCase() == "jquery") this.tabs[newTabIndex].prepHide();
		},
		removeTab: function(id) {
			this.tabContainer.removeChild(this.tabsByID[id].tab.getElem());
			this.contentContainer.removeChild(this.tabsByID[id].layer );
			var tab = this.tabsByID[id];
			var index = tab.tabIndex;
			
			var nextTabIndex = index;
			if (nextTabIndex < 0) nextTabIndex = 0;
			this.tabs.splice(index, 1);
			delete this.tabsByID[id];
			
			// recalculate Tab Indecies
			for (var i = 0, len = this.tabs.length; i < len; i++) this.tabs[i].tabIndex = i;
	 
			if (nextTabIndex >= this.tabs.length) nextTabIndex = this.tabs.length-1;
			tab.destroy();
	 
			if (this.tabs.length > 0) {
				if (this.currentTabIndex == index) {
					this.switchTabIndex(nextTabIndex);
				} else if (this.currentTabIndex >= this.tabs.length) {
					this.switchTabIndex(this.tabs.length-1);
				}
			}
		
			delete tab;
			delete index;
			delete nextTabIndex;
		},
		setTabContent: function(id, content) {
			if (typeof content == "string")
				this.tabsByID[id].setContent( content );
			else if (typeof content == "object") 
				this.tabsByID[id].setContent( content.innerHTML );
		},
		showIncomingTab: function(nextTabID) {
			this.tabsByID[nextTabID].select();
		},
		switchTab: function(id) {
			if (id != this.currentTabID) {
				try {
					if (this.onSwitchTab != null) this.onSwitchTab(id);
					if (this.willSwitchTab != null) this.willSwitchTab(id);
				} catch (E) {
					console.log("BDTabView:switchTab:"+id+":willSwitchTabError");
					console.log(E);
				}
				
				if (this.currentTab()) {
					this.currentTab().hide();
				} else {
					this.unselectAllTabs();
				}

				this.nextTabID	  = id;
				try {
					this.tabsByID[id].select();
					this.currentTabID = id;
					this.currentTabIndex = this.tabsByID[id].tabIndex;
				} catch (E){
					if (DEBUG_MODE) {
						console.log("switchTabError::"+this.id+" is switching to "+ id);
						console.log(E);
					}
				}
			} else {
				if (this.tabsByID[id].altAction != undefined) this.tabsByID[id].altAction();
			}
			if (this.didSwitchTab != null) this.didSwitchTab(id);

		},
		selectTabAtIndex: function( i ) {
			this.switchTabIndex(i);
		},
		switchTabIndex: function(i) {
			if (i != undefined) {
				if (this.onSwitchTab != null) this.onSwitchTab(this.tabs[i].id);
				this.unselectAllTabs();
				try {
					this.tabs[i].select();
				} catch (E){
					console.log("switchTabError::"+this.id+" is switching to tabIndex: "+ i);
				}
				this.currentTabID = this.tabs[i].id;
				this.currentTabIndex = this.tabs[i].tabIndex;
			} else {
				if (this.tabs[i].altAction != undefined) this.tabs[i].altAction();
			}
		},
		unselectAllTabs: function() {
			for (var i=0; i<this.tabs.length; i++) {
				if (this.tabs[i] == undefined || this.tabs[i].hide == undefined) this.tabs.splice(i, 1);
				this.tabs[i].hide();
			}
			this.currentTabID = "";
		},
		currentTab: function() {
			return this.getCurrentTab();
		},
		getCurrentTab: function(){
			return this.tabsByID[this.currentTabID];
		},
		getTabByID: function(id) {
			return this.tabsByID[id];
		},
		getCurrentTabIndex: function() {
			return this.currentTabIndex;
		},
		getCurrentTabID: function() {
			return this.currentTabID;
		},
		getCurrentTabContentDiv: function() {
			return this.tabsByID[this.currentTabID].getElem();
		}
	});
	 

	/**
	 * BDTab
	 * @constructor
	 * @extends BDView
	 */
	var BDTab = Bind.classes.BDView.extend({
		displayName: "BDTab",
		init: function(attr, container) {
			this._super( attr );
			this.container = container;
			this.localizations = [];
			this.BDType = "BDTab";
			for ( var i in attr ) this[i] = attr[i];
			if (this.removable == undefined) this.removable = false;
			if (this.title != undefined && this.text == undefined) {
				this.text = this.title;
			}
	 
			if (attr.customClass == undefined) attr.customClass = "tab";
			var self = this;
			if (this.removable) {
				this.tab = $B.View.create({	id:"tabFlap_"+this.id, 
											tabID: this.id,
											container:this.container});

				this.tab.setClass(attr.customClass);
				this.tab.append( $B.Button.create({	id:"tabFlapCloseBtn_"+this.id, 
													customClass:'tabCloseBtn',
													text: "x",
													tabID: this.id,
													container:this.container,
													action: function() { self.container.removeTab(self.id); }
													}) );
	 
				this.tab.append( $B.Button.create({	id:"tabFlapBtn_"+this.id, 
													customClass:attr.customClass,
													text: this.text,
													image: this.image,
													title: this.title,
													tabID: this.id,
													container:this.container,
													actionOnMouseDown: true,
													action: function() { self.container.switchTab(self.id); }
													}) );
															
			} else {

				this.tab = $B.Button.create({	id:"tabFlap_"+this.id, 
											customClass:attr.customClass,
											text:  this.text,
											image:  this.image,
											title: this.title,
											tabID: this.id,
											container:this.container,
											actionOnMouseDown: true,
											action: function() {self.container.switchTab(self.id);}
											});
			}
			if (this.action != undefined) {
				this.tab.customAction = this.action;
			}
			this.clear = document.createElement("div");
			this.clear.style.clear = "both";
	 
			this.container.tabContainer.appendChild(this.tab.getElem());

// TODO: Update tabview localizations

// 		 	if (this.localizations != undefined) {
// 				this.localizations['default'] = {title:this.title, content:this.layer};
// 		 		for (var lang in this.localizations) {
// 		 			this.tab.defineLocalization(lang, this.localizations[lang].title);
// 					this.defineLocalization(lang, this.localizations[lang]);
// 		 		}
// 		 	}
			this.container.tabContainer.appendChild(this.tab.getElem());
		
			if (this.content.typeIsEqualTo != undefined){
				this.layer = this.content.getElem();
				this.layer.BDView = this.content;
			} else if (typeof this.content == "object"){
				//this.layer = document.createElement("div");
				this.layer = this.content;
				try {
					this.content.parentNode.removeChild(this.content);
				} catch (E) {}
				$B.addClass(this.layer, "tabContent");
				this.layer.appendChild(this.clear);
			
			} else {
				this.layer = document.createElement("div");
				this.layer.setAttribute("class", "tabContent");
	 
				if (this.content != undefined && typeof this.content == "string" && this.content.substr(0,4) == "url(") var url = this.content.substr(4,this.content.length-5);
				if (url != undefined) {
					this.layer.innerHTML = "Loading Content...";
					$(callbackTab).load(url, function(data){callbackTab.layer.innerHTML = data; });
				} else {
					this.layer.innerHTML = this.content;
				}
				this.layer.setAttribute("id", this.container.id+"_"+this.id+"_contentView");
				this.layer.appendChild(this.clear);
			}

			this.container.contentContainer.appendChild(this.layer);

			var callbackTab = this;
			
			this.layer.controller = this.container;
			this.tab.controller = this.container;
			//this.layer.style.display = "none";
		
		},
		prepHide: function() {
			$B.removeClass(this.tab.getElem(), "active");
			$B.removeClass(this.layer, "active");
			if (this.transition.toLowerCase() == "jquery") {
				$(this.layer).hide();
			} else {
				this.layer.style.display = "block";
			}
		},
		hide: function() {
			$B.removeClass(this.tab.getElem(), "activeTab");
			$B.removeClass(this.layer, "activeTab");
			
			if (this.layer.BDView){
				this.layer.BDView.hide();
			} else {
				this._super();
			}
		},
		show: function() {
			$B.addClass(this.tab.getElem(), "activeTab");
			$B.addClass(this.layer, "activeTab");
			if (this.layer.BDView){
				this.layer.BDView.show();
			} else {
				this._super();
			}
		},
		select: function() {
			this.show();
			if (this.tab.customAction != undefined) this.tab.customAction();
		},
		setTitle: function(title) {
			this.tab.setText(title);
		},
		destroy: function() {
			if (this.layer.identify != undefined) $B.destroyView(this.layer.id);
		}
	});

	Bind.classes.BDTabView = BDTabView;
	Bind.classes.BDTab		= BDTab;
	
	$B.TabView = {
		create: function( attr ) {
			return new BDTabView( attr );
		}
	};
	$B.Tab 	  = {
		create: function( attr, container ) {
			return new BDTab( attr, container );
		}
	};
	
})($B);
/** BDWindow **/

(function($B) {

	'use strict';

	kB.WindowMaskDefault 		= 0;
	kB.WindowMaskFullScreen 	= 1;

	kB.WindowTransitionTypeDefault		= '';
	kB.WindowTransitionTypeNone			= '';
	kB.WindowTransitionTypeFade			= 'BDWindowAnimationFade';
	kB.WindowTransitionTypeZoomFade		= 'BDWindowAnimationZoomFade';
	kB.WindowTransitionTypePop			= 'BDWindowAnimationPop';
	kB.WindowTransitionTypePushBottom	= 'BDWindowAnimationPushBottom';
	kB.WindowTransitionTypeCustom		= '';

	kB.WindowLevelBackground			= 0;
	kB.WindowLevelNormal				= 1;
	kB.WindowLevelPanel					= 2;
	kB.WindowLevelDialog				= 3;
	kB.WindowLevelControl				= 4;
	kB.WindowLevelCustom				= 5;

	/**
	 * BDWindow
	 * @constructor
	 * @extends BDView
	 */
	var BDWindow = Bind.classes.BDView.extend({
		displayName: "BDWindow",
		create: function(attr) {
			return new BDWindow(attr);
		},
		init: function( attr ) {
			// Init as BDView first then override
			this._super( attr );
			// Apply defaults
			this.id 						= $B.randomStringWithLength(8);
			this.isPanel 					= false;
			this.hasBottomBar 				= false;
			this.hasTitleBar  				= true;
			this.hasToolbar	  				= false;
			this.resizable 					= false;
			this.dragAnywhere 				= false;
			this.resizeFromCenter 			= false;
			this.enableCSSTransitions 		= false;
			this.useCSSTransforms			= false;
			this.autoShow 					= false;
			this.modal 						= false;
			this.containerHeight 			= -1;
			this.setsContainerHeight		= false;
			this.visible 					= true;
			this._dragXOffset 				= 0;
			this._dragYOffset 				= 0;
			this._isDragging  				= false;
			this._isCentered				= false;
			this.title 						= "";
			this.BDType 				= "BDWindow";
			this.BDType						= "BDWindow";
			this.bottomBarSitsOnTopOfContentView = false;
			this._blackdrop 				= null;
			this.position					= null;
			this.draggable					= true;
			this.dismissOnBackgroundClick   = false;
			this.retain						= false;
			this.windowMask					= kB.WindowMaskDefault;
			this.fullScreen					= false;
			this.transition 				= kB.WindowTransitionTypeDefault;
			this.windowLevel 				= kB.WindowLevelNormal;
			this._isVisible					= false;
			this.attachTo					= null;

			// Override defaults with user defined attributes
			for (var i in attr) this[i] = attr[i];
			
			if (this.fullScreen == true) {
				this.windowMask = kB.WindowMaskFullScreen;
			}
			this._dragXOffset = 0;
			this._dragYOffset = 0;
			//this.layer = new Elem("div", this.id, "BDWindow");
			$B.removeClass(this.layer, "BDView");
			$B.addClass(this.layer, "BDWindow");

			if (this.isPanel) {
				$B.addClass(this.layer, "BDPanel");
			}
			
			$B.registerView(this);

			this._titleBar  = new Bind.classes.BDView({id: this.id+"_titleBar", customClass:"BDWindowTitleBar"});
			this._titleLabel = new Bind.classes.BDLabel({ id: this.id+"_titleLabel", customClass: "BDWindowTitleBarLabel", text: this.title });
			this._titleBar.append( this._titleLabel );
			this._closeBtn  = new Bind.classes.BDButton({ id: this.id+"_closeBtn", customClass:"BDWindowCloseBtn", parent: this, action: function() {this.parent.orderOut();}, text: "<span>x</span>"});
			this._closeBtn.removeClass("BDButton");
			this._container = new Bind.classes.BDView({ id: this.id+"_container", customClass:"BDWindowContainer" });
			if ( this.modal == true ) {
				this._blackdrop = new Elem("div", this.id+"_blackdrop", "BDWindowModalBlackdrop");
				this._blackdrop.control = this;
			} else {
				this.modal = false;
			}

			var self = this;
			if (this.draggable == true) {
				if (this.dragAnywhere == true) {
					this._container.getElem().addEventListener("mousedown", function(evt) {
						self.mousedown.apply( self, arguments );
					}, true);
					this._container.getElem().addEventListener("touchstart", function(evt) {
						self.touchStart.apply( self, arguments );
					}, true);
				} else {
					this._titleBar.getElem().addEventListener("mousedown", function(evt) {
						self.mousedown.apply( self, arguments );
					}, false);
					this._titleBar.getElem().addEventListener("touchstart", function(evt) {
						self.touchStart.apply( self, arguments );
					}, false);
				}
			}
			
			if (this.windowLevel > kB.WindowLevelBackground && $B.device.isPointerDriven()) {
				this.layer.addEventListener("mousedown", function(evt) {
					$B.makeKeyWindow( self );
				 }, true);	
			}

			this._titleBar.append( this._closeBtn );
			if (this.hasTitleBar) {
				this.layer.appendChild( this._titleBar.getElem() );
				this.addClass("HasTitleBar");
			}
			this.layer.appendChild( this._container.getElem() );


			if ( this.h != undefined ) {
				this.layer.style.height = this.h+'px';
			}
			if ( this.w != undefined ) {
				this.layer.style.width = this.w+'px';
			}

			if ( this.rect != undefined ) {
				this.w = this.rect.size.width;
				this.h = this.rect.size.height;
				this.setFrame( this.rect );
			}
			
			if (this.layoutRectType == kB.ViewRectTypeAbsolute) {
				this.layer.style.position = "absolute";
				
			}

			if ( this.position != null ) {
				this.setPosition( this.position );
			}
			
			if ( this.windowMask == kB.WindowMaskFullScreen ) {
				// this.w = window.innerWidth;
				// this.h = window.innerHeight;
				// this.width( this.w );
				// this.height( this.h );
				this.layer.style.position = "absolute";
				this.layer.style.top = 0;
				this.layer.style.right = 0;
				this.layer.style.bottom = 0;
				this.layer.style.left = 0;
				this.layer.style.boxSizing = "border-box";
				this.layer.style.position = "fixed";
				// this.left(0);
				// this.top(0);
				$B.addClass(this.layer, "BDFullScreenWindowMask");
				// $B.attachEventHook("BDDevice:windowDidResize", function( newSize ) {
				// 	self.setSize( newSize.width, newSize.height );
				// });
			}

			//this._container.height(this.h-28)+'px';
			if ( this.hasBottomBar == true && this.setsContainerHeight) {
				this._bottomBar = new Bind.classes.BDView({ id: this.id+"_bottomBar", customClass: "BDWindowBottomBar"  });
				this.layer.appendChild( this._bottomBar.getElem() );
				this._container.getElem().style.height = (this.h-66)+'px';
			}


			if ( this.resizable == true ) {
				this._resizer = new Bind.classes.BDButton({ id: this.id+"_resizer", customClass: "BDWindowResizer" });
				this._resizer.style.margin = 0;
				this._resizer.addEventListener( 'mousedown', function(evt) {
					var offsetX = evt.offsetX;
					var offsetY = evt.offsetY;
					var startX  = evt.clientX;
					var startY  = evt.clientY;
					var startPosX = self.position.x;
					var startPosY = self.position.y;

					$B.dispatchEvent(self.BDType+":"+self.id+":willResize", self);			

					$B.addClass(self.getElem(), "resizing");
					self.resizeMoveFunction = function(evt) {
						//self._isDragging = true;
						var w = evt.clientX-self._elem.offsetLeft + (self._resizer.control.width() - offsetX);
						var h = evt.clientY-self._elem.offsetTop  + (self._resizer.control.height() - offsetY);
						if (self.useCSSTransforms == true) {
							w = evt.clientX - self.position.x + self._dragXOffset;
							h = evt.clientY - self.position.y + self._dragYOffset;
						}
						if (self.attachTo != null) {
							w -= self.attachTo.getLeftOffset();
							h -= self.attachTo.getTopOffset();
						}
						self.setSize( w, h );

						if (self.resizeFromCenter) {
							var newX = startPosX - (evt.clientX - startX - offsetX)/2;
							var newY = startPosY - (evt.clientY - startY - offsetY)/2;
							self.setPosition(newX, newY);
						}
						
						$B.dispatchEvent(self.BDType+":"+self.id+":liveResize", self);

					};
					window.addEventListener('mousemove', self.resizeMoveFunction, false);
				
					window.addEventListener('mouseup', function mouseUpListener(evt) {
						$B.removeClass(self.getElem(), "resizing");	
						//$B.dispatchEvent(self.BDType+":"+self.id+":endResize");
						$B.dispatchEvent(self.BDType+":"+self.id+":didResize", self);

						window.removeEventListener('mousemove', self.resizeMoveFunction, false);
						window.removeEventListener('mouseup', mouseUpListener, false);
						$B.dispatchEvent(self.id+"_drop", self);
					}, false);
				}, true );
				this.layer.appendChild( this._resizer );			
			}

			if (this.customClass != undefined) {
				$B.addClass(this.layer, this.customClass);
			}

			this.layer.control = this;
			this.layer.view = this;
			if (this.autoShow == true) this.makeKeyAndOrderFront();


			if (this.content != undefined) {
				if (this.content.identifyType != undefined) {
					delete this.layer;
					this.layer = this.content.getElem();
				} else if (typeof this.content == "object") {
					delete this.layer;
					this.layer = this.content;
					try {
						this.content.parentNode.removeChild(this.content);
					} catch (E) { }
				} else {
					this.layer.innerHTML = this.content;
				}

				if (this.content.innerHTML != undefined) {
					this._defaultContent = this.content.innerHTML;
				} else {
					this._defaultContent = this.content;
				}

			}
			if (this.visible == false) {
				this.getElem().style.display = "none";
			}

			if ( this.enableTouchScrolling != undefined && this.enableTouchScrolling == true ) this.attachTouchScrolling();

			for (var lang in this.localizations) {
				this.defineLocalization(lang, this.localizations[lang]);
			}
			this.layer.control = this;
			this.layer.controller = this;

			if (this.isPanel == true || this.windowLevel == kB.WindowLevelPanel) {
				this.setWindowLevel( $B.panelWindowLevel() );
			}
			if (this.windowLevel == kB.WindowLevelDialog) {
				this.setWindowLevel( $B.dialogWindowLevel() );
			}
				
			if (this.modal == true && this.dismissOnBackgroundClick) {
				this._blackdrop.addEventListener(kB.InteractionEnded, function() {
					self.orderOut();
				}, false);
				//return this._blackdrop;
			}
			return this;
		},
		// init = function( attr ) {
		// 	return this.superInit( attr );
		// },
		identifyType: function(attr) {
			return this.BDType;
		},
		setTitle: function( str ) {
			this.title = str;
			if (this._titleLabel) {
				this._titleLabel.setText( this.title );
			}
		},
		setPosition: function( x, y ) {
			var w = this.w,
				h = this.h;
				
			if (x == 'center') {
				this.left( "50%" );
				this.top( "50%" );
				this._isCentered = true;
				this.getElem().style.marginLeft = -1*(w/2) + "px";
				this.getElem().style.marginTop  = -1*(h/2) + "px";
				return;
			} else if (x == "aboveCenter") {
				if (this.attachTo != null) {
					this.setPosition( (this.attachTo.w-w)/2, ((this.attachTo.h-h)/2 - window.innerHeight*0.1) );
					return;
				} else {
					this.setPosition( (window.innerWidth-w)/2, ((window.innerHeight-h)/2 - window.innerHeight*0.1) );
					return;
				}
			} else if (x == 'center top') {
				if (this.attachTo != null) {
					this.setPosition( (this.attachTo.w-this.w)/2, 0 );
					return;
				} else {
					this.setPosition( (window.innerWidth-this.w)/2, 0 );
					return;
				}
			}

			if (typeof x == "object") {
				y = x.y;
				x = x.x;
			}

			if (this._isCentered) {
				this.getElem().style.marginLeft = "";
				this.getElem().style.marginTop = "";
				this._isCentered = false;
			}

			x -= this._dragXOffset;
			y -= this._dragYOffset;
			this.position = { 'x': x, 'y': y };
			
			var pos = { 'x': x, 'y': y };
			$B.dispatchEvent("BDWindow:"+this.id+":didMove", pos);
			if (this.useCSSTransforms == true) {
				this.layer.style.webkitTransform = "translate3d("+x+"px,"+y+"px,0)";
			} else {
				this.layer.style.top = y+"px";
				this.layer.style.left = x+"px";			
			}
		},
		open: function(show) {
			if (show == undefined) show = true;
			if (show) {
				this.getElem().style.opacity = "";
				this.getElem().style.display = "";
			}

			if (this._isVisible == true) return;

			try {
				this._viewWillAppear();	
			} catch (E) {
				console.log("ERROR:BDWindow:"+this.id+":viewWillAppear");
				console.log(E);
			}
			

			if (this.attachTo != null) {
				if (this.modal == true) {
					this.attachTo.append( this._blackdrop );
				} else {
					this.attachTo.append( this.getElem() );
				}
			} else {
				if (this.modal == true) {
					$B.domInject( this._blackdrop );
					$B.domInject( this.getElem() );
				} else {
					$B.domInject( this.getElem() );
				}
			}
			this.updateContainerHeight();

			//this.makeKeyAndOrderFront(true);

			var self = this;
			if (!show) return;
			
			if (this.enableCSSTransitions == true) {
				setTimeout( function() {
					$B.addClass(self.getElem(), 'open '+this.transition);
				}, 10);

				if (this.modal == true) {
					setTimeout( function() {
						$B.addClass(self._blackdrop, 'open '+this.transition);
					}, 10);
				}
				this.getElem().addEventListener( kB.CSSTransitionEnd, function transitionEndListener(evt) {
					self.getElem().removeEventListener( kB.CSSTransitionEnd, transitionEndListener, false );
					setTimeout( function() {
						self._viewDidAppear();
					}, 20);
				}, false);

			} else {
				if (this._blackdrop != null) {
					$B.addClass(this._blackdrop, 'open '+this.transition);
				}
				$B.addClass(this.getElem(), 'open '+this.transition);

				setTimeout( function() {
					self._viewDidAppear();
				}, 20);
			}
			this._isVisible = true;
		},
		close: function(cb) {
			//$B.dispatchEvent("BDWindow_"+this.id+"_Close", this);
			$B.dispatchEvent("BDWindow:"+this.id+":willClose", this);
			
			try {
				this.viewWillDisappear();
			} catch (E) {
				console.log("ERROR:BDWindow:"+this.id+":viewWillDisappear");
				console.log(E);
			}

			var self = this;

			if (this.enableCSSTransitions == true) {

				if (this.modal == true) {
					$B.removeClass(this._blackdrop, "open");
					$B.removeClass(this.getElem(), "open");
					$B.removeClass(this._blackdrop, this.transition);
					$B.removeClass(this.getElem(), this.transition);
					this._blackdrop.addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
						self._blackdrop.removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
						var v = evt.target.control;
						v.target.control._blackdrop.removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);

						$B.dispatchEvent("BDWindow:"+v.id+":didClose", this);
						if (cb != undefined) cb();
						v.destroy();
					}, false);
					this.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
						self.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
						var v = evt.target.control;
						v.target.control.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
						
						$B.dispatchEvent("BDWindow:"+v.id+":didClose", this);
						v._isVisible = false;
						if (cb != undefined) cb();
						v.viewDidDisappear();
						v.destroy();
					}, false);

				} else {
				
					$B.removeClass(this.getElem(), "open");
					$B.removeClass(this.getElem(), this.transition);
					this.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
						self._blackdrop.removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
						var v = evt.target.control;
						v.target.control.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
						$B.dispatchEvent("BDWindow:"+v.id+":didClose", this);
						if (cb != undefined) cb();
						v._isVisible = false;
						v.destroy();

					}, false);
				}
			} else {
				//$B.dispatchEvent("BDWindow_"+this.id+"_Destroy");
				$B.dispatchEvent("BDWindow:"+this.id+":didClose", this);
				$B.removeClass(this.getElem(), "open");
				$B.removeClass(this.getElem(), this.transition);

				this.fadeOut(150, function() {
					this._isVisible = false;
					this.viewDidDisappear();
					this.destroy();
					if (cb != undefined) cb();
				});
			}

		},
		destroy: function() {
			try {
				if (this.attachTo != null) {
					var removeFrom = this.attachTo.getElem();
					if (this.modal == true && this._blackdrop != null) {
						removeFrom.removeChild( this._blackdrop );
					} else {
						removeFrom.removeChild( this.getElem() );
					}
				} else {
					if (this.modal == true && this._blackdrop != undefined && this._blackdrop != null) {
						document.body.removeChild( this._blackdrop );
					} else {
						document.body.removeChild( this.getElem() );
					}
				}
		
				if (this.retain == true) return false;
				
				$B.dispatchEvent("BDWindow:"+this.id+":willDestroy");
				this._container.destroy();
				this._closeBtn.destroy();
			} catch (E) {
				if (this.getElem() != null && this.getElem().parentNode != null) {
					this.getElem().parentNode.removeChild( this.getElem() );
				}
			}
			this._super();
			if (this.retain == true) return false;
			$B.destroyView(this);

		},
		_viewWillAppear: function() {
			if (this.transition == kB.WindowTransitionTypePushBottom) {
				this.top('110%');
			}

			this.viewWillAppear();	
		},
		_viewDidAppear: function() {
			if (this.transition == kB.WindowTransitionTypePushBottom) {
				if ( this.position != null ) {
					this.setPosition( this.position );
				}
			}
			this._isVisible = true;
			this.viewDidAppear();	
		},
		isVisible: function() {
			return this._isVisible;	
		},
		showHidden: function() {
			this.open(false);
		},
		makeKeyAndOrderFront: function(shouldNotOpen)
		{
			//console.log(this.id+ " makeKeyAndOrderFront");
			if (!shouldNotOpen) this.open();
			$B.makeKeyWindow(this);
			
		},
		orderFront: function() {
			$B.makeKeyWindow(this);	
		},
		setWindowLevelType: function( s ) {
			this.windowLevel = s;	
		},
		setWindowLevel : function(i)
		{
			if (i != undefined) {
				this.getElem().style.zIndex = i;
				if (this._blackdrop != null) this._blackdrop.style.zIndex = i;
			} else {
				console.log(this.id+ " received undefined windowLevel");
			}
		},
		takeKeyState: function()
		{
			this.addClass('BDKeyWindow');
		},
		releaseKeyState: function()
		{
			this.removeClass('BDKeyWindow');
		},
		orderOut: function(cb)
		{
			$B.orderWindowOut( this );
			this.close(cb);
		},
		mousedown: function(evt) {
			var self = this;
			window.addEventListener("mouseup", function mouseUpListener(evt) {
				window.removeEventListener('mouseup', mouseUpListener, false);
				self.mouseup.apply(self, arguments);
			}, false);

			this.draggingTimeout = setTimeout( function() { $B.addClass(self.getElem(), "dragging"); }, 150);
			try {
				$B._draggingObject = this;
				this._isDragging  = true;
				if (this.attachTo != null) {
					//console.log(evt.currentTarget.id);
					this._dragXOffset = evt.offsetX + this.getLeftOffset();
					this._dragYOffset = evt.offsetY + this.getTopOffset();						
				} else {
					if (evt.currentTarget.id == this.id) {
						this._dragXOffset = evt.offsetX;
						this._dragYOffset = evt.offsetY;
					} else {
						this._dragXOffset = evt.offsetX - evt.currentTarget.offsetLeft;
						this._dragYOffset = evt.offsetY - evt.currentTarget.offsetTop;					
					}
				}
				window.addEventListener("mousemove", function(evt) {
					evt.preventDefault();
					self.mousemove.apply(self, arguments);
				}, false);
			} catch (E) {
				console.log(E.message);
			}

		},
		mouseup: function(evt) {
			//try {
				clearTimeout( this.draggingTimeout );
				$B.removeClass(this.getElem(), "dragging");
				this._isDragging  = false;
				$B.dispatchEvent(this.id+"_move", evt);
				this._dragXOffset = 0;
				this._dragYOffset = 0;
				window.removeEventListener("mousemove", this.mousemove, false);
				$B.dispatchEvent(this.id+"_drop", this);
			//} catch (E) {
			
			//}
		},
		mousemove: function(evt) {
			evt.preventDefault();
			if ( this._isDragging == false ) {
				window.removeEventListener( "mousemove", arguments.callee, false);
				return false;
			}
			this.setPosition( { x: evt.clientX, y: evt.clientY} );

		},
		touchStart: function(evt) {
			//for (var i in evt.targetTouches[0]) console.log(i+": "+evt.targetTouches[0][i]);
			try {
				$B._draggingObject = evt.target.parentNode.control;
				$B._draggingObject._isDragging  = true;
				$B._draggingObject._dragXOffset = evt.touches[0].pageX;
				$B._draggingObject._dragYOffset = evt.touches[0].pageY;
				$B._draggingObject._startX = evt.touches[0].pageX - $B._draggingObject.getElem().offsetLeft;
				$B._draggingObject._startY = evt.touches[0].pageY - $B._draggingObject.getElem().offsetTop;
				
				window.addEventListener("touchmove", $B._draggingObject.touchMove, false);
			} catch (E) {
				
			}

		},
		touchEnd: function(evt) {
			try {
				$B._draggingObject._isDragging  = false;
				window.removeEventListener("touchmove", $B._draggingObject.touchMove, false);
			} catch (E) {
			
			}
		},
		touchMove: function(evt) {
			evt.preventDefault();


			try {
				pos = { x: evt.targetTouches[0].pageX, y: evt.targetTouches[0].pageY };
				//$B._draggingObject.getElem().style.webkitTransform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
				$B.dispatchEvent(this.id+"_move", pos);
				$B._draggingObject.getElem().style.left = pos.x-$B._draggingObject._startX + 'px';
				$B._draggingObject.getElem().style.top  = pos.y-$B._draggingObject._startY + 'px';
			} catch (E) {
				console.log(E.message);
			}
		},
		titleBar: function() {
			return this._titleBar;
		},
		bottomBar: function() {
			return this._bottomBar;
		},
		append: function( o ) {
			if ( o.control != undefined) o = o.control;
			if ( o.control != undefined) o = o.control;

			if ( o.identifyType != undefined && (o.identifyType() == "BDHUDView" || o.identifyType() == "BDWindow") ) {
				if ( o.modal != undefined && o.modal == true ) {
					this.layer.appendChild( o._blackdrop );
				} else {
					this.layer.appendChild( o.getElem() );
				}
				this._subObjects.push( o );
				
			} else {
				this._container.append( o );
			}
			return o;
		},
		appendBeforeContainer: function( o ) 
		{
			if ( o.control != undefined) o = o.control;
			if ( o.control != undefined) o = o.control;
			
			this.layer.insertBefore( o.getElem(), this._container.getElem() );
			
			this._subObjects.push( o );

		},
		appendToBottomBar: function( o ) {
			this._bottomBar.append( o );
		},
		getLeftOffset: function() {
			if (this.attachTo != null) {
				return this.attachTo.getLeftOffset();
			}
			var cE = this.getElem();
			var l  = 0;
			if (this.useCSSTransforms == true) {
				l += this.position.x;
			}
			do {
				l += cE.offsetLeft;
				cE = cE.offsetParent;
			} while( cE != null && cE.tagName.toLowerCase() != "body");
			return l;
		},
		getTopOffset: function() {
			if (this.attachTo != null) {
				return this.attachTo.getTopOffset();
			}
			var cE = this.getElem();
			var t  = 0;
			do {
				t += cE.offsetTop;
				cE = cE.offsetParent;
			} while( cE != null && cE.tagName.toLowerCase() != "body");
			return t;
		},
		setSize: function( w, h ) {
			if (typeof w == "object") {
				this.setSize( w.width, w.height );
				return;
			}
			if ( h != undefined && typeof h == "number" ) {
				this.layer.style.height = h+'px';
				this.h = h;
			}
			if ( w != undefined && typeof w == "number" ) {
				this.layer.style.width  = w+'px';
				this.w = w;
			}
			if ( this.containerHeight == -1 ) {
				this.updateContainerHeight();
			}
			$B.dispatchEvent(this.BDType+":"+this.id+":didResize", {width:w, height:h});
		},
		updateContainerHeight: function()
		{
			if (!this.setsContainerHeight) return;
			var containerHeight = this.h;

			if ( this.hasToolbar == true ) {
				containerHeight -= this._toolbar.height();
			}
			if ( this.hasTitleBar == true ) {
				containerHeight -= this._titleBar.height();
			}
			if ( this.hasBottomBar == true && this.bottomBarSitsOnTopOfContentView == false ) {
				containerHeight -= this._bottomBar.height();
			}
			this._container.height(containerHeight);	
		},
		getContainerHeight: function()
		{
			return this._container.height();
		}		
	});

	
	Bind.classes.BDWindow = BDWindow;
	$B.Window = {
		create: function( attr ) {
			return new BDWindow( attr );
		}
	};
	
})($B);
	

/** BDDialog **/

(function($B) {

	'use strict';

$B._dialogs = [];

	/**
	 * BDDialog
	 * @constructor
	 * @extends BDWindow
	 */
var BDDialog = Bind.classes.BDWindow.extend({
	displayName: "BDDialog",
	init: function( attr ) {
		this.buttons					= [kB.DialogCloseButton];
		attr.hasBottomBar 				= false;
		attr.hasToolbar	  				= false;
		attr.resizable	 				= false;
		attr.dragAnywhere 				= false;
		attr.resizeFromCenter 			= false;
		attr.autoShow 					= true;
		this.title 						= "";
		this.headline					= "";
		this.message					= "";
		this.BDType 					= "BDDialog";
		this.bottomBarSitsOnTopOfContentView = false;
		this._blackdrop 				= null;
		this.attachToWindow				= null;
		this.onShow						= null;
		this.icon						= null;
		this.customClass				= null;
		attr.w							= 480;
		attr.h							= 220;
		attr.windowLevel				= kB.WindowLevelDialog;
		attr.position 					= "center";

		if (attr.modal == undefined) attr.modal 						= true;

		this._super( attr );
		//for (var i in attr) this[i] = attr[i];


		this.BDType = "BDDialog";

		this._buttonContainer  	= new Bind.classes.BDView({ id: this.id+"_buttonContainer", customClass: "BDDialogButtonContainer", registerWithUIServer: true });

		this.append( this._buttonContainer );
		this.addClass("BDDialog");

		var self = this;
		this._buttons = [];
		for ( var i = 0; i < this.buttons.length; i++ ) {
			if (this.buttons[i] == kB.DialogCloseButton) {
				this.buttons[i] = { id: "closeBtn",  text: { en: "Close", fr: "Fermer", pt: "Fechar", es: "Cerrar" }, 	    action: function(){ self.dismiss(); }, defaultButton: this.buttons[i].defaultButton };
			} else if (this.buttons[i] == kB.DialogCancelButton) {
				this.buttons[i] = { id: "cancelBtn", text: { en: "Cancel", fr: "Annuler", pt: "Cancelar", es: "Cancelar" }, action: function(){ self.dismiss(); }, defaultButton: this.buttons[i].defaultButton };
			} else if (this.buttons[i] == kB.DialogDoneButton) {
				this.buttons[i] = { id: "doneBtn", text: { en: "Done", fr: "Fait", es: "Hecho" }, action: function(){ self.dismiss(); }, defaultButton: this.buttons[i].defaultButton };
			}
			this._buttons[i] = this._buttonContainer.append( $B.Button.create(this.buttons[i]) );
		}
		if (this.buttons.length == 1) {
			this._buttons[0].addClass("Default");
		}
		
		this._iconView 	 	= this.append( $B.ImageView.create({ id: this.id+"_icon", customClass: "BDDialogIcon", url: this.icon, autoLoad: false }) );
		this._headlineLabel = $B.Label.create({ id: this.id+"_headlineLabel", customClass: "BDDialogHeadline", text: this.headline });
		this._messageLabel 	= $B.Label.create({ id: this.id+"_messageLabel", customClass: "BDDialogMessage", text: this.message });
		this.append( this._headlineLabel );
		this.append( this._messageLabel );
		
		if (this.icon != null) {
			this._iconView.load();
		}

		if (this.autoShow == true) {
			this.displayDialog();
		}
		
		return this;
	},
	displayDialog: function(d, cb) {
		if (d == undefined) d = 150;
		var self = this;
		var c = cb;
		this.makeKeyAndOrderFront();
	},
	dismiss: function(d, cb) {
		this.orderOut();
	},
	makeKeyAndOrderFront: function() {
		$B._dialogs.push(this);
		this._super();
	},
	orderOut: function() {
		$B._dialogs.pop();
		this._super();
	}
});
	Bind.classes.BDDialog = BDDialog;
	$B.Dialog = {
		create: function( attr )	 {
			return new BDDialog(attr);
		}
	};

})($B);

/** BDNavigationController **/

(function($B) {

	'use strict';
	
	/**
	 * BDNavigationController
	 * @constructor
	 */
var BDNavigationController = Bind.classes.BDView.extend({
	init: function( prop ) {
		this.subviews = [];
		this.currentIndex = 0;
		this.offset = 0;
		this.viewTransition = kB.ViewTransitionPushLeft;
		this.stackViews = false;
		this.enableCSSTransitions = true;
		this.useCSSTransforms = false;//$B.device.supportsHardwareAcceleration();
		this._shouldPopViewController = false;
		this._shouldPopToRootViewController = false;
		this.redrawOnOrientationChange = true;
		this.BDType = "BDNavigationController";
		this.supportsTouchPaging = false;
		this.breadcrumView = null;
		this.hasNavigationBar = false;
		this.navigationBar = null;

		this._super(prop);
		var i;
		for ( i in prop ) this[i] = prop[i];
		
		if (this.landscapeWidth == undefined) this.landscapeWidth = this.width;
		
		this.layer.setAttribute("id", this.id);
		$B.addClass( this.layer, "BDNavigationController" );
		//$B.registerView(this);
		if (this.customClass != undefined) this.addClass(this.customClass);

		var self = this;
		
		if (this.hasNavigationBar) {
			this.navigationBar = $B.View.create({ id: this.id+"_navBar", customClass: "BDNavigationBar" });
			this.navigationBar.title 	  = $B.Label.create({ id: this.id + "_title", customClass: "BDNavigationItem Title" });
			this.navigationBar.backButton = $B.Button.create({ id: this.id + "_backBtn", customClass: "BDNavigationItem Back", text: { en: "Back", fr: "Retour" }, preventDoubleClick: false, action: function() { self.popViewController(); } });
			this.navigationBar.append( this.navigationBar.title );
			this.navigationBar.append( this.navigationBar.backButton );
			this.navigationBar.backButton.hide();
			this.layer.appendChild( this.navigationBar.getElem() );
		}
		
		this.slider = new Bind.classes.BDView({id:this.id+"_Slider", customClass:"BDNavigationController_Slider"});
		this.subviewsByID = [];
		for ( i = 0; i < this.subviews.length; i++ ){
			this.subviews[i].BDNavigationControllerSubviewIndex = i;
			this.subviews[i].getElem().style.width = this.width+"px";
			this.slider.append(this.subviews[i]);
		};
		if ( this.paneWidthOverrides != undefined ) {
			for (i in this.paneWidthOverrides) {
				this.subviews[i].getElem().style.width = this.paneWidthOverrides[i]+"px";
			}
		}
		if ( this.supportsTouchPaging == true ) {
			this.slider.getElem().addEventListener('touchstart', function( evt ) {
				//evt.preventDefault();
				self._touchesBegan.apply(self, arguments);
			}, false);
		}
		if (this.redrawOnOrientationChange == true) {
			$B.attachEventHook("BDDevice:didRotateToInterfaceOrientation", function( orientation ) {
				self.redrawSlider();
			});
		}

		this.slider.getElem().style.position = "absolute";
		this.slider.getElem().style.width = ((this.width*this.subviews.length)+this.subviews.length)+"px";

		if (this.hasNavigationBar) {
			this.layerContainer = $B.View.create({ id: this.id+ "_SliderContainer", customClass: "BDNavigationController_SliderContainer" });
			this.layerContainer.removeClass("BDView");
			this.layerContainer.append( this.slider );
			this.layer.appendChild(this.layerContainer.getElem());
		} else {
			this.layer.appendChild(this.slider.getElem());
		}	
		
		if (this.defaultSubviewIndex != undefined) this.goToSubviewIndex(this.defaultSubviewIndex);
		this.layer.view = this;
		this.layer.controller = this;
	},
	create: function(attr) {
		return new BDNavigationController(attr);
	},
	setOffset: function( offset ) {
		this.slider.layer.style.webkitTransform = "translateX("+offset+"px)";
	},
	_pageWidth: function() {
		return $B.device.orientationIsLandscape() ? this.landscapeWidth : this.width;
	},
	_pageHeight: function() {
		return this.height;	
	},
	generateNavigationBarWithTitle: function( title, backText ) {
		var bar_id = "BDNavigationBar_"+$B.randomStringWithLength(6);
		var titleBar  	= $B.View.create({  id: bar_id, customClass: "BDNavigationBar"});
		titleBar.titleLabel	= $B.Label.create({ id: bar_id+"_titleLabel", 
											customClass: "BDNavigationTitleLabel", 
											text: title});

		titleBar.append( titleBar.titleLabel );

		if (backText != undefined){
			titleBar.backButton = $B.Button.create({ 	id: bar_id+"_backBtn", 
														text: backText, 
														customClass: "BDBarButtonBack", 
														useThreeSliceLayout: true, 
														navigationController: this,
														action: function() { 
															this.navigationController.popViewController(); 
														} 
													});
			titleBar.append( titleBar.backButton );
		}
		
		return titleBar;
	},
	goToSubview: function(id) {
		this.currentIndex = this.subviewsByID[id].BDNavigationControllerIndex;
		if (DEBUG_MODE) console.log(this.currentIndex);
	},
	goToSubviewIndex: function(index, cb) {
		if (index == undefined) index = this.defaultSubviewIndex;
		if (this.onSubviewChange != undefined) this.onSubviewChange(index);
		
		$B.dispatchEvent("BDNavigationController:"+this.id+":willChangeToSubviewWithIndex", index );
		
		if (this.subviews[ this.currentIndex ]) this.subviews[ this.currentIndex ].viewWillDisappear();
		if (this.subviews[ index ]) this.subviews[ index ].viewWillAppear();
		
		this.previousIndex = this.currentIndex;
		this.currentIndex = index;

		this.offset = ((this.viewTransition == kB.ViewTransitionPushTop) ? this._pageHeight():this._pageWidth() )*this.currentIndex;
		
		var self = this;
		if (this.useCSSTransforms == true) {
			self.slider.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
				self.slider.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
				self._didFinishTransition.call(self, cb);
			}, false);
			
			this._setSliderOffset(this.offset);
		} else {
			//if (window.console) console.log("BDAnimation: animating "+((this.viewTransition == kB.ViewTransitionPushTop) ? 'top':'left')+" of slider from: "+this.slider.left()+" to: "+(-1*this.offset));
			$B.Animation.animate({ id: this.id+"_animation", target: this.slider, attribute: ((this.viewTransition == kB.ViewTransitionPushTop) ? 'top':'left'), from: this.slider.left(), to: -1*this.offset, duration:250, callback: function() {
				self._didFinishTransition.call(self, cb);
			}
			});
		}
		
		if (this.navigationBar != null) {
			if (this.subviews[ this.currentIndex ] != undefined && this.subviews[ this.currentIndex ].title != undefined && this.subviews[ this.currentIndex ].title != null) {
// 				this.navigationBar.title.fadeOut(80, function() {
// 					self.navigationBar.title.setText( self.subviews[ self.currentIndex ].title );
// 					self.navigationBar.title.fadeIn(120);
// 				});
				this.navigationBar.title.setText( this.subviews[ index ].title );
				
				if (this.navigationBar.rightBtn != undefined) {
					this.navigationBar.rightBtn.fadeOut(120);

				}
				if (this.subviews[ index ].rightBarButtonItem != undefined) {
					this.navigationBar.rightBtn = this.subviews[ index ].rightBarButtonItem;
					this.navigationBar.rightBtn.addClass("BDNavigationItem");
					this.navigationBar.rightBtn.addClass("Right");
					this.navigationBar.append( this.navigationBar.rightBtn );
					this.navigationBar.rightBtn.hide();
					this.navigationBar.rightBtn.fadeIn(120);
				}

			}
			if (this.currentIndex < 1) {
				this.navigationBar.backButton.fadeOut();
			} else {
				this.navigationBar.backButton.fadeIn();
			}
		}
		
		$B.dispatchNotification(this.id+":didChangeSubviews");
	},
	_setSliderOffset: function(offset) {
		this.offset = offset;
		this.slider.transform( "translate3d("+((this.viewTransition == kB.ViewTransitionPushTop) ? ("0, "+(-1*this.offset)+"px, 0") : ((-1*this.offset)+"px, 0, 0"))+")");	
	},
	redrawSlider: function() {
		var newViewWidth = $B.device.orientationIsLandscape() ? this.landscapeWidth : this.width;
		this.slider.width( this.subviews.length * newViewWidth );
		for (var i = 0, len=this.subviews.length; i < len; i++ ) {
			this.subviews[i].width( newViewWidth );
		}
		this.goToSubviewIndex( this.currentIndex );
	},
	next: function(cb) {
		if (this.currentIndex < this.subviews.length-1) this.goToSubviewIndex(this.currentIndex+1, cb);
		else this.goToSubviewIndex(this.subviews.length-1, cb);

	},
	back: function(cb) {
		if (this.currentIndex > 0) this.goToSubviewIndex(this.currentIndex-1, cb);
		else this.goToSubviewIndex(0, cb);
	},
	pushViewController: function ( view ) {
		if (view.view && typeof view.view == "function") {
			viewController = view;
			viewController.viewWillAppear();
			view = viewController.view();
		}
		this._shouldPopViewController = false;
		view.BDNavigationControllerSubviewIndex = this.subviews.length;
		this.subviews.push( view );

		// Stack views into distance along Z axis
		if (this.viewTransition == kB.ViewTransitionPushStack) {
			
			this.slider.append( this.subviews[view.BDNavigationControllerSubviewIndex] );
			view.getElem().style.webkitTransform = "translateX("+this.width+"px)";
			this.doPushAnimation( view );
		}
		// Push new view in from bottom
		else if (this.viewTransition == kB.ViewTransitionPushTop) {
			this.slider.height( this.subviews.length * this.height );
			this.slider.append(this.subviews[view.BDNavigationControllerSubviewIndex]);
			this.next();
		}
		// Use Page turn transition to display new view
		else if (this.viewTransition == kB.ViewTransitionPageTurn) {
			this.slider.append(this.subviews[view.BDNavigationControllerSubviewIndex]);
			this.doPushAnimation( view );
		}
		// Use default transition of push Left
		// most similar to iOS navigation controller
		else {
			view.width( this.width );
			view.getElem().style['float'] = "left";
			view.getElem().style.clear = "none";
			view.getElem().style.position = "relative";
			var self = this;
			this.slider.width( this.subviews.length * this.width );
			this.slider.append(this.subviews[view.BDNavigationControllerSubviewIndex]);
			setTimeout( function() {
				self.next();
			}, 5);
		}
	},
	popViewController: function(cb) {
		var vi = this.currentIndex;
		
		if (this.viewTransition == kB.ViewTransitionPushStack 
			|| this.viewTransition == kB.ViewTransitionPageTurn) {
			this.doPopAnimation();
		} 
		else {
			this._shouldPopViewController = true;
			var self = this;
			this.back(function() {
				if (self._shouldPopViewController && self.subviews.length>1) {
					var vc = self.subviews.pop();
					var newFrontView = self.subviews[self.subviews.length - 1];
					if (newFrontView.viewDidAppear) newFrontView.viewDidAppear();
					if (vc.viewDidDisappear) vc.viewDidDisappear();

					if (vc.retain == true) {
						vc.detach();
					} else {
						vc.destroy();
					}
					//delete vc;
					self._shouldPopViewController = false;
					if (cb != undefined) cb();
				}			
			});
		}
	},
	popToRootViewController: function() {
		if (this.subviews.length < 2) return;
		this._shouldPopToRootViewController = true;
		var self = this;
		
		if (this.viewTransition == kB.ViewTransitionPushStack
			|| this.viewTransition == kB.ViewTransitionPageTurn) {
			if (this._shouldPopToRootViewController == true && this.subviews.length>1) {
				while (this.subviews.length > 1) {
					this.doPopAnimation();
				}
			}
		} else {
			$B.attachEventHook("BDNavigationController:"+this.id+":didChangeToSubviewWithIndex", function( index ) {
				if (self._shouldPopToRootViewController == true && self.subviews.length>1) {
					while (self.subviews.length > 1) {
						var vc = self.subviews.pop();
						vc.destroy();
						//delete vc;
					}
					self._shouldPopToRootViewController = false;
				}
			});
			this.goToSubviewIndex(0);
		}
	},
	doPushAnimation: function( view ) {
		var i, self = this;
		if (this.subviews[ this.subviews.length-2 ]) {
			this.subviews[ this.subviews.length-2 ].viewWillDisappear();	
		}
		view.viewWillAppear();

		this.previousIndex = this.currentIndex;
		this.currentIndex = view.BDNavigationControllerSubviewIndex;

		// ViewTransitionPageTurn
		if (this.viewTransition == kB.ViewTransitionPageTurn) {
			for (i = 0; i < this.subviews.length-1; i++) {
				this.subviews[i].removeClass("BDNavigationControllerCurrentPage");
				this.subviews[i].addClass("BDNavigationControllerPastPage");
			}
			view.removeClass("BDNavigationControllerNextPage");
			view.addClass("BDNavigationControllerCurrentPage");
			view.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener() {
				view.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
				view.viewDidAppear();
				$B.dispatchNotification("BDNavigationController:"+self.id+":didChangeToSubviewWithIndex", self.subviews.length-1);
			}, false);
		}
		// Currently only for ViewTransitionPushStack
		else {
			for (i = 0; i < this.subviews.length-1; i++) {
				var z = (this.subviews.length - i) * this.depthSpacing;
				var svs = this.subviews[i].getElem().style;
					svs.webkitTransform = "translate3d(0,0,-"+z+"px)";
			}
			setTimeout( function() {
				view.getElem().style.webkitTransform = "translate3d(0,0,0)";
				$B.dispatchNotification("BDNavigationController:"+self.id+":didChangeToSubviewWithIndex", self.subviews.length-1);
			}, 250);	
		}
	},
	doPopAnimation: function( view ) {
		if (this.subviews.length < 2) return;
		var outgoing = this.subviews.pop();
		var self = this;
		outgoing.viewWillDisappear();
		this.subviews[this.subviews.length-1].viewWillAppear();
		this.previousIndex = this.currentIndex;
		this.currentIndex = this.subviews.length-1;
		// ViewTransitionPageTurn
		if (this.viewTransition == kB.ViewTransitionPageTurn) {
			outgoing.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
				outgoing.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
				outgoing.viewDidDisappear();
				outgoing.destroy();
				self.subviews[self.subviews.length-1].viewDidAppear();

				$B.dispatchNotification("BDNavigationController:"+self.id+":didChangeToSubviewWithIndex", self.subviews.length-1);

			}, false);
			outgoing.removeClass("BDNavigationControllerCurrentPage");

			this.subviews[this.subviews.length-1].removeClass("BDNavigationControllerPastPage");
			this.subviews[this.subviews.length-1].addClass("BDNavigationControllerCurrentPage");

		}
		// currently only used for ViewTransitionPushStack
		else {
			outgoing.getElem().style.webkitTransform = "translateX("+this.width+"px)";
			outgoing.getElem().addEventListener(kB.CSSTransitionEnd, function transitionEndListener( evt ) {
				outgoing.getElem().removeEventListener(kB.CSSTransitionEnd, transitionEndListener, false);
				outgoing.destroy();
				
				$B.dispatchNotification("BDNavigationController:"+self.id+":didChangeToSubviewWithIndex", self.subviews.length-1);

			}, false);
			
			for (var i = 0; i < this.subviews.length; ++i) {
				var z = (this.subviews.length - i - 1) * this.depthSpacing;
				var svs = this.subviews[i].getElem().style;
					svs.webkitTransform = "translate3d(0,0,-"+z+"px)";
			}
		}
	},
	clearAllViewControllers: function() {
		this._setSliderOffset(0);
		for ( var i = 0, len = this.subviews.length; i < len; i++ ) {
			this.subviews[i].hide();
			this.subviews[i].destroy();
		}
		delete this.subviews;
		this.subviews = [];
		this.currentIndex = 0;
	},
	_didFinishTransition: function( cb ) {
		this.subviews[this.currentIndex].viewDidAppear();
		$B.dispatchNotification("BDNavigationController:"+this.id+":didChangeToSubviewWithIndex", this.currentIndex);
		if (cb != undefined) cb();
	},
	currentViewController: function() {
		return this.subviews[this.currentIndex];
	}
});

	BDNavigationController.displayName = "BDNavigationController";
	Bind.classes.BDNavigationController = BDNavigationController;
	$B.NavigationController = BDNavigationController.prototype;

})($B);

/** BDSpinner **/

(function($B) {

	/**
	 * BDSpinner
	 * @constructor
	 * @extends BDView
	 */
	// !BDSpinner
	var BDSpinner = function BDSpinner( params ) {
		this.customClass = null;
		this.id = "aSpinner";
		this._interval = null;
		this.interval = 83;
		this.stepIndex = 0;
		this.autoStart = false;
		this._isAnimating = false;
		this.hideWhenStopped = true;
		this.size = "large";
		this._size = 24;
		for (var i in params) this[i] = params[i];
		if (this.size == "large") {
			this._size = 48;
		} else if (this.size == "small") {
			this._size = 24;
		}
	
		this.layer = new Elem("div", this.id, "BDSpinner "+this.size);
		
		this.layer.controller = this;

		if (this.customClass != null) $B.addClass( this.layer, this.customClass );
		this.layer.style.backgroundPosition = "0 0";
		
		if (this.autoStart == true) this.start();
		$B.registerView( this );
		return this;
	};
	BDSpinner.prototype = new Bind.classes.BDView;
	BDSpinner.prototype.create = function( params ) {
		return new BDSpinner( params );
	};
	BDSpinner.prototype.start = function() {
		var self = this;
		if (!this._isAnimating) {
			this._isAnimating = true;
			this._interval = setInterval( function() {self.step.apply(self, arguments);}, self.interval );
		}
	};
	BDSpinner.prototype.stop = function() {
		clearInterval(this._interval);
		this._isAnimating = false;
		if (this.hideWhenStopped) this.hide();
	};
	BDSpinner.prototype.step = function() {
		this.stepIndex = (this.stepIndex+1)%12;
		this.layer.style.backgroundPosition = "0 -"+(this.stepIndex*this._size).toFixed(0)+"px";
	};

	Bind.classes.BDSpinner = BDSpinner;
	$B.Spinner = BDSpinner.prototype;
	
})($B);
/** BDTextField **/

(function($B) {

	'use strict';
	
	/**
	 * BDTextField
	 * @constructor
	 * @extends BDControl
	 */
	// !BDTextField
	var BDTextField = Bind.classes.BDControl.extend({
		displayName: "BDTextField",
		init: function( attr ) {
			attr.BDType 			= "BDTextField";
			attr.usesCustomActionHandling = true;
			this.usesCustomActionHandling = true;
			
			this.placeholder 			= null;
			this.value 					= "";
			this.title 					= null;
			this.customClass 			= null;
			this.secure 				= false;
			this.type 					= "text";
			this.actionOnEnter			= true;
			this.onSearch				= null;
			this.onKeyUp				= null;
			this.action 				= null;
			this.name					= null;
			this.placeholderLocalizations = {};
			
			this._super( attr );
			
			for (var i in attr) this[i] = attr[i];
			if (this.name == null) this.name = this.id;
						
			this.layer.setAttribute("id", this.id+"_container");
			this.layer.id = this.id+"_container";

			this.addClass("BDTextFieldContainer");
			
			if (this.customClass != null) {
				$B.addClass( this.layer, this.customClass );
			}
			if (this.title != null) {
				if (typeof this.title == "object") {
					this.localizations = this.title;
					this.title = this.localizations[$B.currentLanguage()];
					if (this.title == undefined) this.title = "";
				}

				this._label = new Elem({ tag:"label", "for": this.id });
				this._label.innerHTML = this.title;
				this.layer.appendChild( this._label );
			}

			
			this._input = new Elem({ tag: "input", type: (this.secure) ? "password" : "text", name: this.name, id: this.id, "class": "BDTextField", value: this.value });
			if (this.type == "search") {
				this._input.type = "search";
			}

			this._input.object = this;

			this.append( this._input );

			if (this.placeholder == null) this.placeholder = "";
			this.setPlaceholder(this.placeholder);


			var self = this;

			if (this.actionOnEnter && this.action != null) {
				this.layer.addEventListener('keyup', function( e ) {
					var evt = (e) ? e: (window.event) ? window.event: null;
					if (evt) {
						var key = (evt.charCode) ? evt.charCode:
						((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
						if (key == 13) self.click();
					}
				}, false);
			}
			if (this.onKeyUp != null) {
				this.layer.addEventListener('keyup', function( e ) {
					var evt = (e) ? e: (window.event) ? window.event: null;
					if (evt) {
						var key = (evt.charCode) ? evt.charCode:
						((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
						if (key == 13) self.click();
					}
					setTimeout( function() {
						self.onKeyUp.call( self, self.getValue(), key );
					}, 10);
				}, false);
			}

			if (this.value == null || this.value == undefined) this.value = "";
			
			
			if (this.onChange != undefined) {
				this._input.addEventListener('change', function( evt ) {
					self.onChange.apply( self, arguments );
				}, false);
			}
			if (this.onSearch != null) {
				this._input.addEventListener('search', function( evt ) {
					self.onSearch.apply( self, arguments );
				}, false);
			}
			if (this.onFocus != undefined) {
				this._input.addEventListener('focus', function( evt ) {
					self.onFocus.apply( self, arguments );
				}, false);
			}
			if (this.onBlur != undefined) {
				this._input.addEventListener('blur', function( evt ) {
					self.onBlur.apply( self, arguments );
				}, false);
			}

						
			this.layer.object = this;
			this.layer.controller = this;
			
			this._viewDidInit();
			
			return this;
		},
		setAction: function( a ) {
			if (this.action == null) {
				var self = this;
				this.layer.addEventListener('keyup', function( e ) {
					var evt = (e) ? e: (window.event) ? window.event: null;
					if (evt) {
						var key = (evt.charCode) ? evt.charCode:
						((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
						if (key == 13) self.click();
					}
				}, false);
			}	
			this._super(a);
		},
		getValue: function() {
			return this._input.value.trim();
		},
		setValue: function( v, l ) {
			if (l && typeof v == "object" ) {
				if (v[l] == undefined) {
					for (var i in v) {
						v[l] = v[i];
						break;
					}
				}
				v = v[l];
			}
			if (typeof v == "string" && v.substr(0,9) == "string://") {
				this._valuePropertyString = v;
				v = $B.localizedValueForProperty( this._valuePropertyString.substr(9) );
			}
			this._input.value = v;
		},
		setPlaceholder: function( v ) {
			if (typeof this.placeholder == "object") {
				this.placeholderLocalizations = this.placeholder;
				this.placeholder = this.placeholderLocalizations[$B.currentLanguage()];
				if (this.placeholderLocalizations[$B.currentLanguage()] == undefined) {
					for (var _s in this.placeholderLocalizations) {
						var dS = this.placeholderLocalizations[_s];
						break;
					}
					// set first defined as default suffix
					this.placeholderLocalizations[$B.currentLanguage()] = dS;
					this.placeholder = this.placeholderLocalizations[$B.currentLanguage()];
				}
			}
			if (typeof this.placeholder == "string" && this.placeholder.substr(0,9) == "string://") {
				this._placeholderPropertyString = this.placeholder;
				this.placeholder = $B.localizedValueForProperty( this._placeholderPropertyString.substr(9) );
			}
			if (this.placeholder != undefined) {
				this._input.placeholder = this.placeholder;
			}
		},
		switchLanguage: function( lang ) {
			if (this._title) {
				if (this.localizations[lang] != undefined) {
					this.title = this.localizations[lang];
					this._label.innerHTML = this.title;
				}
			}
			if (this._valuePropertyString) {
				this.setValue(this._valuePropertyString);
			}
			if (this._placeholderPropertyString) {
				this.setPlaceholder( this._placeholderPropertyString );
			}
		}
	});
	
	Bind.classes.BDTextField = BDTextField;
	$B.TextField = {
		create: function( attr ) {
			return new BDTextField( attr );
		}
	};
	
})($B);
/** BDTextArea **/

(function($B) {

	/**
	 * BDTextArea
	 * @constructor
	 * @extends BDControl
	 */
	// !BDTextArea
	var BDTextArea = function BDTextArea( attr ) {
		this.BDType 			= "BDTextArea";
		this.placeholder 			= null;
		this.value 					= "";
		this.title 					= null;
		this.customClass 			= null;
		this.value 					= "";
		this.registerWithUIServer	= true;
		this.returnHTML				= true;
		this.name					= null;
		this.onKeyUp				= null;
		this.wordWrap				= true;
		
		for (var i in attr) this[i] = attr[i];
		if (this.name == null) this.name = this.id;

		
		if (this.placeholder == null) this.placeholder = "";
		this.setPlaceholder(this.placeholder);

		
		this.layer = new Elem("div", this.id, "BDTextAreaContainer");
		if (this.customClass != null) {
			$B.addClass( this.layer, this.customClass );
		}
		if (this.title != null) {
			if (typeof this.title == "object") {
				this.localizations = this.title;
				this.title = this.localizations[$B.currentLanguage()];
			}

			this._label = new Elem({ tag:"label", "for": this.id });
			this._label.innerHTML = this.title;
			this.layer.appendChild( this._label );
		}
		if (this.value == null || this.value == undefined) this.value = "";

		this._input = new Elem({ tag: "textarea", name: this.name, id: this.id, "class": "BDTextArea", placeholder: this.placeholder });
		this.setValue( this.value );
		this._input.object = this;
		this._input.controller = this;

		if (this.wordWrap == false) {
			this._input.setAttribute("wrap", "off");
		}

		this.layer.appendChild( this._input );

		var self = this;
		
		if (this.onChange != undefined) {
			this._input.addEventListener('change', function( evt ) {
				self.onChange.apply( self, arguments );
			}, false);
		}
		if (this.onFocus != undefined) {
			this._input.addEventListener('focus', function( evt ) {
				self.onFocus.apply( self, arguments );
			}, false);
		}
		if (this.onBlur != undefined) {
			this._input.addEventListener('blur', function( evt ) {
				self.onBlur.apply( self, arguments );
			}, false);
		}
		if (this.onKeyUp != null) {
			this._input.addEventListener('keyup', function( e ) {
				var evt = (e) ? e: (window.event) ? window.event: null;
				if (evt) {
					var key = (evt.charCode) ? evt.charCode:
					((evt.keyCode) ? evt.keyCode: ((evt.which) ? evt.which: 0));
					if (key == 13) self.click();
				}
				setTimeout( function() {
					self.onKeyUp.call( self, self.getValue(), key );
				}, 10);
			}, false);
		}
		
		if (this.registerWithUIServer) $B.registerView( this );
		
		if ( $B.currentViewToAttachSubviews() != null ) {
			$B.currentViewToAttachSubviews().append( this );
		}
		
		this.layer.object = this;
		this.layer.controller = this;
		return this;
	};
	BDTextArea.prototype = new Bind.classes.BDView;
	BDTextArea.prototype.contructor = BDTextArea;
	BDTextArea.prototype.create = function( attr ) {
		return new BDTextArea( attr );
	};
	BDTextArea.prototype.getValue = function() {
		var h = this._input.value;
		if (this.returnHTML) {
			h = h.replace(/\n/g, "<br/>");
		} else {
			h = h.trim();
		}
		return h;
	};
	BDTextArea.prototype.setPlaceholder = function(v) {
		if (typeof this.placeholder == "object") {
			this.placeholderLocalizations = this.placeholder;
			this.placeholder = this.placeholderLocalizations[$B.currentLanguage()];
			if (this.placeholderLocalizations[$B.currentLanguage()] == undefined) {
				for (var _s in this.placeholderLocalizations) {
					var dS = this.placeholderLocalizations[_s];
					break;
				}
				// set first defined as default suffix
				this.placeholderLocalizations[$B.currentLanguage()] = dS;
				this.placeholder = this.placeholderLocalizations[$B.currentLanguage()];
			}
		}

		if (typeof this.placeholder == "string" && this.placeholder.substr(0,9) == "string://") {
			this._placeholderPropertyString = this.placeholder;
			this.placeholder = $B.localizedValueForProperty( this._placeholderPropertyString.substr(9) );
		}

		if (this.placeholder != undefined)
			this.getElem().placeholder = this.placeholder;	
	};
	BDTextArea.prototype.setValue = function( v, l ) {
		if (v == undefined) v = "";
		if (l && typeof v == "object") {
			if (v[l] == undefined) {
				for (var i in v) {
					v[l] = v[i];
					break;
				}
			}
			v = v[l];
		}
		
		if (typeof v == "string" && v.substr(0,9) == "string://") {
			this._valuePropertyString = v;
			v = $B.localizedValueForProperty( this._valuePropertyString.substr(9) );
		}
		
		if (this.returnHTML && typeof v == "string") {
			v = v.replace(/\<br\/\>/g, "\n");
		}
		this._input.value = v;
	};
	
	Bind.classes.BDTextArea = BDTextArea;
	$B.TextArea = BDTextArea.prototype;
	
})($B);
/** BDPopupSelect **/

(function($B) {

	/**
	 * a popup select
	 * @constructor
	 * @extends BDControl
	 */
	var BDPopupSelect = Bind.classes.BDControl.extend({
		displayName: "BDPopupSelect",
		init: function(attr) {
			this.localizations = [];
			this.options = null;
			this.BDType = "BDPopupSelect";
			this.name				= null;
			for (var i in attr) this[i] = attr[i];
			if (this.name == null) this.name = this.id;
			this._options = [];
			
			this.layer = new Elem("select");
			this._super( attr );
	 		
			if (this.id != undefined) {
				this.layer.setAttribute('id', this.id);
				this.layer.setAttribute("name", this.name);
			}
			if (this.text != undefined) this.layer.value = this.text;
	 
			if (this.action != undefined) {
				
				if (typeof this.action == "function") {
					this.layer.addEventListener("change", this.action, false);
				} else {
					this.layer.setAttribute("action", this.action);
					this.layer.setAttribute("onchange", this.action);	
				}
			}
		
			var self = this;
	
			if (this.onChange != undefined) {
				this.layer.addEventListener('change', function( evt ) {
					self.onChange.apply( self, arguments );
				}, false);
			}
	
			if (this.onFocus != undefined) {
				this.layer.addEventListener('focus', function( evt ) {
					self.onFocus.apply( self, arguments );
				}, false);
			}
			if (this.onBlur != undefined) {
				this.layer.addEventListener('blur', function( evt ) {
					self.onBlur.apply( self, arguments );
				}, false);
			}
	
			if (this.options != null) {
				this.setOptions( this.options );
			}
			if (this.registerWithUIServer == undefined || this.registerWithUIServer == true) $B.registerControl(this);
			if (this.title != undefined) {
				if (typeof this.title == "object") {
					this.localizations = this.title;
					this.title = this.localizations[$B.currentLanguage()];
				}
	
				this._label = new Elem("label");
				this._label.innerHTML = this.title;
				this._label.setAttribute("for", this.layer.id);
				this._container = new Elem("div", this.id+"_container");
				this._container.appendChild(this._label);
				this._container.appendChild(this.layer);
			}
		
			if (this.customClass != undefined) {
				try {
					this._container.setClass("BDPopupSelect "+this.customClass);
				} catch (E) {
					this.layer.setClass("BDPopupSelect "+this.customClass);
				}
			} else {
				try {
					this._container.setClass("BDPopupSelect");
				} catch (E) {
					this.layer.setClass("BDPopupSelect");
				}
			}
			if ( this.visible != undefined && this.visible == false ) this.hide();
			
			if ( this._container != undefined ){
				this._container.widget = this;
				return this._container;
			}
			this.layer.view = this;
			this.layer.controller = this;
			return this;
		},
		create: function(attr) {
			return new BDPopupSelect(attr);
		},
		getValue: function() {
			return this.layer.options[this.layer.selectedIndex].value;
		},
		setOptions: function( options ) {
			this.layer.innerHTML = "";
			this.options = options;
			for (var o = 0, oLen = this.options.length; o < oLen; o++) {
				if (this.options[o].label) {
					if (this.options[o].options.length == 0) continue;
					var optgroup = new Elem("optgroup");
					if (typeof this.options[o].label == "object") {
						this.options[o].label.localizations = this.options[o].label;
						this.options[o].label = this.options[o].label.localizations[$B.currentLanguage()];
					}
					optgroup.label = this.options[o].label;
					for (var i = 0, iLen = this.options[o].options.length; i < iLen; i++) {
						var opt = new Elem("option");
			
						if (typeof this.options[o].options[i].text == "object") {
							this.options[o].options[i].localizations = this.options[o].options[i].text;
							this.options[o].options[i].text = this.options[o].options[i].localizations[$B.currentLanguage()];
						}
		
						opt.innerHTML = this.options[o].options[i].text;
						opt.setAttribute('value', this.options[o].options[i].value);
						if (this.options[o].options[i].selected != undefined) opt.setAttribute("selected", "true");
	
						optgroup.appendChild( opt );
					}
					this.layer.appendChild( optgroup );
				} else {
				
					this._options[o] = new Elem("option");
					if (typeof this.options[o].text == "object") {
						this.options[o].localizations = this.options[o].text;
						this.options[o].text = this.options[o].localizations[$B.currentLanguage()];
					}
		
					this._options[o].innerHTML = this.options[o].text;
					this._options[o].setAttribute("value", this.options[o].value);
					if (this.options[o].selected != undefined) this._options[o].setAttribute("selected", "true");
					if (this.options[o].icon != undefined) {
						$B.addClass(this._options[o], "hasIcon");
						this._options[o].style.backgroundImage = "url('"+this.options[o].icon + "')";
					}
					this.layer.appendChild(this._options[o]);
				}
			}
		},
		setSelectedOptionWithValue: function( value ) {
			var _i = 0;
			for (var i = 0, len = this.options.length; i < len; i++) {
				if (this.options[i].value == value) {
					_i = i; break;
				}
			}
			this.setSelectedIndex( _i );
		},
		setSelectedIndex: function( index ) {
			this.layer.selectedIndex = index;
		}
	});
	Bind.classes.BDPopupSelect = BDPopupSelect;
	$B.PopupSelect = BDPopupSelect.prototype;
	
})($B);
/** BDCheckbox **/

(function($B) {

	'use strict';
	
	/**
	 * BDCheckbox
	 * @constructor
	 * @extends BDControl
	 */	
	// !BDCheckbox
	var BDCheckbox = function BDCheckbox( attr ) {
		this.BDType 			= "BDCheckbox";
		this.placeholder 			= null;
		this.value 					= "";
		this.title 					= null;
		this.customClass 			= null;
		this.registerWithUIServer 	= true;
		this.name					= null;
		this.checked				= false;
		this._hiddenInput			= null;
		this._label					= null;
		this.appearance				= kB.ControlAppearanceSystem;
		this.onChange				= function() {};
		
		for (var i in attr) this[i] = attr[i];
		if (this.name == null) this.name = this.id;
		
		
		this.layer = new Elem("div", this.id, "BDCheckboxContainer");
		this.layer.setAttribute('name', this.name);
		if (this.customClass != null) {
			$B.addClass( this.layer, this.customClass );
		}
		if (this.title != null) {
			if (typeof this.title == "object") {
				this.localizations = this.title;
				this.title = this.localizations[$B.currentLanguage()];
			}

			this._label = new Elem({ tag:"label", "for": this.name });
			this._label.innerHTML = this.title;
			this.layer.appendChild( this._label );
		}
		this._input = new Elem({ tag: "input", type: "checkbox", name: this.name, id: this.id, "class": "BDCheckbox" });
		if (this.value == null || this.value == undefined) {
			this.value = "";
			this.setAttribute('value', false);
		}
		if (this.checked) {
			//this._input.setAttribute("checked", "checked");
			this._input.checked = true;
			this._input.setAttribute('value', true);
		}
		this._input.object = this;
		
		if (this._label != null) {
			this._label.appendChild( this._input );
		} else {
			this.layer.appendChild( this._input );	
		}
		
		
		var self = this;
		this._input.addEventListener('change', function( evt ) {
			self.checked = evt.target.checked;
			if (self.checked) {
				if (self.value == "") {
					self._input.setAttribute('value', "on");
				}
				//self._input.setAttribute('checked', 'checked');
			} else {
				if (self.value == "") {
					self._input.setAttribute('value', "off");
				}
				//self._input.removeAttribute('checked');
			}
			if (self._hiddenInput != null) {
				self._hiddenInput.value = (self.checked) ? "on" : "off";
			}
			self.onChange.apply( self, arguments );
		}, false);

		if (this.onFocus != undefined) {
			this._input.addEventListener('focus', function( evt ) {
				self.onFocus.apply( self, arguments );
			}, false);
		}
		if (this.onBlur != undefined) {
			this._input.addEventListener('blur', function( evt ) {
				self.onBlur.apply( self, arguments );
			}, false);
		}

		
		if (this.registerWithUIServer) $B.registerView( this );
		
		this.layer.object = this;
		this.layer.controller = this;
		
		
		return this;
	};
	BDCheckbox.prototype = new Bind.classes.BDView;
	BDCheckbox.prototype.contructor = BDCheckbox;
	BDCheckbox.prototype.create = function( attr ) {
		return new BDCheckbox( attr );
	};
	BDCheckbox.prototype.createHiddenInput = function() {
 		this._hiddenInput = new Elem({ tag: "input", name:this.name, type: "hidden" });
 		this._hiddenInput.value = (this.checked) ? "on" : "off";
 		this._input.setAttribute("name", "_"+this.name);
 		this._label.setAttribute("name", "_"+this.name);
 		this.layer.appendChild( this._hiddenInput );
	};	
	BDCheckbox.prototype.getValue = function() {
		return this._input.checked;
	};
	BDCheckbox.prototype.setValue = function( v ) {
		this._input.value = v;
	};
	BDCheckbox.prototype.switchLanguage = function( lang ) {
		if (this._title) {
			if (this.localizations[lang]) {
				this.title = this.localizations[lang];
				this._label.innerHTML = this.title;
			}
		}
	};
	Bind.classes.BDCheckbox = BDCheckbox;
	$B.Checkbox = BDCheckbox.prototype;
	
})($B);
/** BDSegmentedControl **/

(function($B) {

	/**
	 * Segmented Control
	 * @constructor
	 * @extends BDView
	 */
var BDSegmentedControl = Bind.classes.BDControl.extend({
	init: function(attr) {
		this._super( attr );
		this.BDType = "BDSegmentedControl";
		this.options	= [];
		this.onChange	= function() {};
		this.action		= null;
		this.buttons	= [];
		this.groupSeed	= $B.randomStringWithLength(6);
		this.value		= null;
		
		for (var i in attr) this[i] = attr[i];
	
		this.removeClass("BDView");
		this.addClass("BDSegmentedControl");
		
		this._label = this.append( $B.Label.create({ id: this.id+"_titleLabel", text: this.title }) );
		
		this.setOptions( this.options );
		
		return this;
	},
	handleClick: function( obj ) {
		obj.select();
		this.value = obj.value;
		this.onChange( this.value );
	},
	setValue: function( value ) {
		for (var i = 0, len = this.options.length; i < len; i++) {
			if (this.options[i].value != null && this.options[i].value == value) {
				this.buttons[i].select();
			};
		}
		this.value = value;
		return this.value;
	},
	getValue: function() {
		return this.value;
	},
	setOptions: function( opts ) {
		this.options = opts;
		if (this.buttons.length > 0) {
			for (var i = 0, len = this.buttons.length; i<len; i++) {
				this.buttons[i].destroy();
			}
		}
		for ( i = 0, len = this.options.length; i < len; i++ ) {
			if (this.options[i].value == undefined) this.options[i].value = null;
			this.buttons[i] = this.append( $B.Button.create({ 	id: this.id+"_"+this.groupSeed+"_"+i, 
																objectGroup: "BDSegmentedControl-"+this.groupSeed, 
																type: kB.ButtonTypeRadio, 
																value: this.options[i].value,
																text: this.options[i].text, 
																icon: this.options[i].icon,
																colorForColorWell: this.options[i].colorForColorWell,
																actionOnMouseDown: true,
																parent: this,
																action: function() { 
																	this.parent.handleClick( this );
																}
															}) );
			if (this.value == this.options[i].value) this.buttons[i].select();
		}
	}
});

	Bind.classes.BDSegmentedControl = BDSegmentedControl;
	$B.SegmentedControl = {
		create: function( attr ) {
			return new BDSegmentedControl( attr );
		}
	};

})($B);
/** BDForm **/

(function($B) {

	'use strict';

	/**
	 * [BDForm description]
	 * @constructor
	 * @param {[type]} attr [description]
	 */
var BDForm = Bind.classes.BDView.extend({
	displayName: "BDForm",
	init: function( attr ) {

		this.BDType 	= "BDForm";
		this.method  		= "POST";
		this.action  		= "javascript:void(0);";
		this.encoding		= "multipart/form-data";
		this.enctype		= this.encoding;
		this.id				= "aBDForm";
		this.title			= null;
		this.customClass	= null;
		this.onSubmit		= function() {return true;};
		this.onSuccess		= null;
		this.onError		= null;
		this.params			= [];
		this.spinnerSize	= "large";
		this.seed			= $B.randomStringWithLength(6);
		
		for (var i in attr) this[i] = attr[i];
		
		this._uploadFrameTargetName = this.id+'_uploader_'+this.seed;
		
		this.layer = new Elem({ tag:"form", id: this.id, name: this.id, target: this._uploadFrameTargetName, action: this.action, method: "POST", enctype: this.enctype, encoding: this.enctype });
		
		this._super( attr );
		
		var self = this;
				
		$B.addClass( this.layer, "BDForm" );
		
		if (this.customClass != null) {
			$B.addClass( this.layer, this.customClass );
		}
		if (this.title != null) {
			if (typeof this.title == "object") {
				this.localizations = this.title;
				this.title = this.localizations[$B.currentLanguage()];

				if (this.localizations[$B.currentLanguage()] == undefined) {
					for (var _s in this.localizations) {
						var dS = this.localizations[_s];
						break;
					}
					// set first defined as default suffix
					this.localizations[$B.currentLanguage()] = dS;
					this.title = this.localizations[$B.currentLanguage()];
				}
			}


			this._legend = new Elem({ tag: "legend" });
			this._legend.innerHTML = this.title;
			this.layer.appendChild( this._legend );
		}
		
		for (var i in this.params) {
			this.layer.appendChild( new Elem({ tag: "input", type: "hidden", name: i, value: this.params[i] }) );
		}
	
		this._uploadFrame = new Elem({ tag: "iframe", id: this._uploadFrameTargetName, name: this._uploadFrameTargetName, width: 0, height:0, border:0, style: "width:0; height:0; border:0; position: absolute; top:-9000px; left:-9000px;" });
		document.body.appendChild( this._uploadFrame );
		
		$B.registerView( this );

		this.layer.controller = this;
		this.layer.view = this;

		return this;
	},
	setTitle: function( t ) {
		this.title = t;
		if (typeof this.title == "object") {
			this.localizations = this.title;
			this.title = this.localizations[$B.currentLanguage()];
			
			if (this.title == undefined) {
				for (var _s in this.localizations) {
					var dS = this.localizations[_s];
					break;
				}
				// set first defined as default suffix
				this.localizations[$B.currentLanguage()] = dS;
				this.title = this.localizations[$B.currentLanguage()];
			}
		}
		this._legend.innerHTML = this.title;
	},
	submit: function( cb ) {
		var self = this;
		if (!this.onSubmit()) return false;
		this._cb = cb;
		
		this._uploadFrame.addEventListener( 'load', function loadListener( evt ) {
			self._uploadFrame.removeEventListener('load', loadListener, false);
			window['_uploader_'+this.seed] = self;
			var c = "javascript: ";
			c += "window.parent._uploader_"+this.seed+".responseHTML = document.body.innerHTML;window.parent._uploader_"+this.seed+".responseText = document.body.innerText; void(0);";
			self._uploadFrame.src = c;

			self.didFinishLoading.apply( self, arguments );
		}, false );

		this.spinner = $B.Spinner.create({ id: this.id+"_spinner", customClass: "BDFormSubmitSpinner", autoStart: false, size: this.spinnerSize });
		this.layer.appendChild( this.spinner.getElem() );
		this.spinner.start();
		this.layer.submit();
		return true;
	},
	append: function( obj ) {
		if ( obj.BDType == "BDCheckbox" && this.enctype == "multipart/form-data" ) {
			obj.createHiddenInput();
		}
		var self = this;
		if ( obj.typeIsEqualTo && obj.typeIsEqualTo("BDTextField") ) {
			obj.setAction(function() {
				self.submit();
			});
		}
		return this._super( obj );
	},
	didFinishLoading: function( evt ) {
		this.spinner.stop();
		this.spinner.destroy();
		if (this._cb != undefined) this._cb( this.responseHTML, this.responseText );
		if (this.onSuccess != null) this.onSuccess( this.responseHTML, this.responseText );
	}
});

	
	Bind.classes.BDForm = BDForm;
	$B.Form = {
		create: function( attr ) {
			return new BDForm( attr );
		}
	};

})($B);
/** BDHibernate **/

(function($B) {

	'use strict';

	/**
	 * [BDHibernate description]
	 * @constructor
	 * @param {[type]} attr [description]
	 */
	var BDHibernate = function BDHibernate( attr ) {
		if (attr != undefined) {
			this.databaseName = "$B - Hibernate DataStore";
			this.databaseVersion = 1.0;
			this.databaseDescription = "Created by "+this.constructor.name+" on "+ $B.todaysDate();
			this.databaseMaxSize = 20000;
			this.version = 1.0;
			this._dataStore = null;
			this._queue = null;
			this.storageEngine = 'sqlite';
			
			return this.init( attr );
		}
	};
	BDHibernate.prototype = {
		constructor: BDHibernate,
		create: function( attr ) {
			return new BDHibernate( attr );
		},
		init: function( attr ) {
		
			for (var i in attr) this[i] = attr[i];
			var self = this;
			if (this.storageEngine == 'sqlite') {
				try {
					if (window.openDatabase) {
						this._dataStore = openDatabase(this.databaseName, this.databaseVersion, this.databaseDescription, this.databaseMaxSize);
						this.executeSql("SELECT * FROM BDHibernateInfo", [], 
							function(tx, result) {
								// success
							},
							// error
							function( tx, error ) {
								self.runSetup();
							}
						);
					} else {
						console.log("BDHibernate is not supported in this browser.");
						return false;
					}
				} catch (E) {
					console.log("BDHibernate is not supported in this browser.");
					return false;
				}
				this.executeSQL = this.executeSql;
			}
		},
		runSetup: function() {
			this.executeMultipleStatements( [ 	[ "CREATE TABLE `BDHibernateInfo` ( key TEXT, value TEXT )", [] ],
												[ "INSERT INTO `BDHibernateInfo` (`key`, `value`) BDALUES (?, ?)", [ 'version', this.version ] ],
												[ "INSERT INTO `BDHibernateInfo` (`key`, `value`) BDALUES (?, ?)", [ 'dateCreated', $B.todaysDate() ] ],
												[ "CREATE TABLE `BDHibernateKeyValueData` ( key TEXT, value TEXT )", [] ]
											], function() {
												console.log("BDHibernate: setup complete");
											});
// 			var self = this;
// 			this.executeSql( 	"CREATE TABLE `BDHibernateInfo` ( key TEXT, value TEXT )", 
// 								[],
// 								function() {
// 									console.log("Inserting first row");
// 									this.executeSql("INSERT INTO `BDHibernateInfo` (`key`, `value`) BDALUES (?, ?)", [ 'version', self.version ], function() {
// 										this.executeSql("INSERT INTO `BDHibernateInfo` (`key`, `value`) BDALUES (?, ?)", [ 'dateCreated', $B.todaysDate() ], function() {
// 											console.log( "SETUP COMPLETE");
// 										});
// 									}, function( tx, error) {
// 										console.log(error);
// 									});
// 								}
// 							);
		},
		executeMultipleStatements: function( statements, cb ) {
			if (this._queue == null) {
				this._queue = statements;
			} else {
				for (var i = 0, len = statements.length; i < len; i++) {
					this._queue.push( statements[i] );
				}
			}
			if (this._queue.length > 0) {
				this._currentStatementQueueIndex = 0;
				this._multipleStatementHelper( this._queue[0], cb );
			}
		},
		_multipleStatementHelper: function( statement, cb ) {
			this.executeSql( statement[0], statement[1], function() {
				
				this._currentStatementQueueIndex++;
				if (this._queue[this._currentStatementQueueIndex] == undefined) {
					if (cb) {
						cb.apply( this, arguments );
					}
					return;
				};
				
				this._multipleStatementHelper( this._queue[this._currentStatementQueueIndex], cb );
				
				return true;

			}, function(tx, error) {
				console.log(error);
			});
		},
		executeSql: function( sql, vars, cb, onerror ) {
			var tx,
				self = this;
				
			if (vars == undefined) vars = [];
			// Create the sransaction
			this._dataStore.transaction( function( tx ) {
				// execute statement
				tx.executeSql( sql, vars, 
					// onsuccess
					function( tx, result ) {
						if (cb != undefined) {
							cb.apply( self, arguments );
						}
					}, 
					// onerror
					function( tx, error) {
						if (onerror != undefined) {
							onerror.apply( self, arguments );
						}
					}
				); // end execute statement
			}); // end transaction
		},
		setValueForKey: function( value, key ) {
			if (this.storageEngine == "sqlite") {
				
			} else if (this.storageEngine == "applicationCache") {
				
			} else { // default to cookies
				var date = new Date();
				date.setTime(date.getTime()+(120*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
				if (value == null) {
					expires = "; expires=" + new Date(0).toUTCString();
				}
				
				document.cookie = key+"="+value+expires+"; path=/";
			}
		},
		valueForKey: function( key ) {

			var i, k, v, cookies, lookup;

			if (this.storageEngine == "sqlite") {
				this.executeSql( "SELECT * FROM `BDHibernateKeyValueData` WHERE key=?", [key], function( tx, result ) {
					
				});	
			} else if ( this.storageEngine == "applicationCache") {
				
			} else { // default to cookies
				lookup = key + "=";
				cookies = document.cookie.split(";");
				
				for ( var i = 0, len = cookies.length; i < len; i++ ) {
					k = cookies[i].substr(0, cookies[i].indexOf('='));
					v = cookies[i].substr(cookies[i].indexOf('=')+1);
					k = k.replace(/^\s+|\s+$/g,""); // cleanup key name
					if (k == key) return unescape(v);
				}
				return null;
			}
			
		},
		setObjectForKey: function( object, key ) {
			
		},
		imgToString: function( img ) {
			if ( typeof img != "string" ) {
				var startTime = NOW();
				var canvas = new Elem({ tag: "canvas", width: img.width, height: img.height });
				canvas.getContext("2d").drawImage( img, 0, 0 );
				console.log("BDHibernate:imgToString: operation completed in "+(NOW() - startTime)+" ms");
				return canvas.toDataURL();
			} else {
				return false;
			}
		}
	};

	Bind.classes.BDHibernate = BDHibernate;
	$B.Hibernate = BDHibernate.prototype;

})($B);
/** BDComboBox **/

(function() {
// BDComboBox
var BDComboBox = Bind.classes.BDView({
	displayName: "BDComboBox",
	init: function(attr) {
		for (var i in attr) this[i] = attr[i];
		$B.registerWidget(this);
		this.container = new Elem("span", this.id, "BDAutoCompleteField");
		this.currentValue = {};
		if (this.completions != undefined && this.completions[0] != undefined) {
			if (typeof this.completions[0] == "string") {
				for (i = 0, len=this.completions.length; i<len; i++) {
					this.completions[i] = { text: this.completions[i] };
				}
			}
		}

		var self = this;

		this.addBtn    = $B.Button.create({ id: this.id+"_addBtn", customClass: "BDAutoCompleteFieldAddBtn", title: "+", action: this.action, parent: this });
		this.textField = $B.TextField.create({ id: this.id+"_textField", onblur: function() { this.parent.handleFieldBlur(); }, onFocusDown: function() { self.acListView.takeFocus(); }, customClass: "BDAutoCompleteFieldText", action: "", parent: this });
		this.textField.setAttribute('type', "search");
		this.acView    = $B.View.create({ id: this.id+"_results", visible: false, customClass: "BDAutoCompleteFieldResults", parent: this });
		this.acListView = 	$B.TableViewController.create({	id: this.id+"_acCV",
									parent: this,
									widget: { parent: this },
									onFocusDown: function() {
										this._focusIndex++;
										if ( this._focusIndex < 0 ) this._focusIndex = 0;
										if ( this._focusIndex >= this._items.length ) {
											this._focusIndex = this._items.length-1;
										}
										for (var i = 0, len=this._items.length; i < len; i++ )
											this._items[i].releaseFocus();
											
										this._items[this._focusIndex].softFocus();
									},
									onFocusUp: function() {
										this._focusIndex--;
										if ( this._focusIndex < 0 ) {
											$B.popFocus();
											this._items[0].releaseFocus();
										} else {
											for (var i = 0, len=this._items.length; i < len; i++ )
												this._items[i].releaseFocus();
											
											this._items[this._focusIndex].softFocus();

										}
										
									},
									action: function(){
										this._items[this._focusIndex].click();
										this.parent.addBtn.action();
										this.parent.acView.hide();
									}
								});
		
		this.acListView.cellForRowAtIndex = function( index ) {
			var d = this.dataObjectAtIndex( index );
			var cell = $B.Button.create({ id: this.id+"_result_"+$B.randomStringWithLength(6), customClass: "BDTableViewCell", text: d.text });
			return cell.getElem();
		};
		this.acListView.setDataSource( this.completions );
		if (this.customClass != undefined) {

			$B.addClass(this.container, this.customClass);
		
		}

		this.container.appendChild( this.addBtn );
		this.container.appendChild( this.textField );
		document.body.appendChild( this.acView.getElem() );
		this.textField.addEventListener('keyup', function(evt) {
			evt.object = self;
			if (evt.keyCode == 13) self.addBtn.action();
			
			self.ac(evt);
		}, false );
		self = this;
		this.container.widget = this;
		return this.container;
	},
	ac: function (evt) {
		var widget = evt.obj;
		if (evt.keyCode == 47 || evt.keyCode == 38 || evt.keyCode == 39 || evt.keyCode == 40 || evt.keyCode == 13) return false;
		if (evt.keyCode == 27) {
			this.acView.hide();
			return false;
		}
		var value = evt.target.value;
		this._matches = [];
		value = value.toLowerCase().trim();
		this.acListView.control._focusIndex = -1;
		if (value == "") this.textField.value = "";

		var BDACWidget = widget;
		this.acListView.control.empty();
		this.acView.show();
		for ( var i = 0; i < this.completions.length; i++ ) {
		
			var loc = this.completions[i].text.toLowerCase().indexOf(value);
			if (loc > -1) {
				this._matches.push( this.completions[i] );
				var html = this.completions[i].text.substr(0, loc)+"<strong>";
				html    += this.completions[i].text.substr(loc, value.length)+"</strong>";
				html    += this.completions[i].text.substr(loc+value.length, this.completions[i].text.length);
				var str = this.completions[i].text;
				this.acListView.control.addItem( $B.Button.create({ id: "result", customClass: "acResult", parent: this, value: str, valueObj: this.completions[i], textField: this.textField.widget, listView:this.acListView.control, 
						action:function() {
							if (this.identify == undefined) {
								if (this.parent.parent != undefined) {
									text = this.parent.parent.textField;
									text.value = this.value;
									this.parent.parent.currentValue = this.valueObj;
								}
							} else {
								text = this.textField.getElem();
								text.value = this.value;
								this.parent.parent.currentValue = this.valueObj;
							}
						}, title: html }) );
			}
		}
		this.acView.append(this.acListView);

		this.acView.getElem().style.position = "absolute";
		this.acView.getElem().style.zIndex = 100;
		this.acView.show();
		this.acView.getElem().style.left = this.getLeft()+'px';
		this.acView.getElem().style.top  = this.getTop() - this.container.parentElement.parentElement.scrollTop + this.textField.offsetHeight +'px';
		this.acView.getElem().style.width = this.textField.offsetWidth+'px';
	},
	clear: function() {
		this.textField.value = "";
		this.acListView.control._focusIndex = -1;
		this.currentValue = {text:"", value: ""};
	},
	identify: function() {
		return "BDAutoCompleteField:"+this.id;
	},
	identifyType: function() {
		return "BDAutoCompleteField";
	},
	identifyTMBaseClass: function() {
		return "BDControl";
	},
	getElem: function() {
		return this.container;
	},
	handleFieldBlur: function() {
		var self = this;
		setTimeout(function() {
			self.acView.hide();
		}, 500);
	},
	selectACValue: function(i) {
		this.textField.setText(this.completions[i]);
		this.acListView.control._focusIndex = -1;
		this.acView.hide();
	},
	getValue: function() {
		return this.textField.getValue();
	},
	getValueAsObject: function() {
		return this.currentValue;
	},
	destroy: function() {
		this.acView.destroy();
		this.textField.destroy();
		this.addBtn.destroy();
		delete this.container;
		$B.destroyWidget(this);
	}
});

Bind.classes.BDComboBox = BDComboBox;
$B.ComboBox = {
	create: function( attr ) {
		return new BDComboBox( attr );
	}
};

})($B);
/** BDPulldownMenu **/

(function($B) {
	/**
	 * BDPulldownMenu
	 * @constructor
	 * @extends BDView
	 */	

	kB.MenuTypePulldown = 0;
	kB.MenuTypePopup    = 1;

	

var BDPulldownMenu = Bind.classes.BDView.extend({
	displayName: "BDPulldownMenu",
	init: function( attr ) {
		this._super( attr );
		this.menuAnchor = kB.ViewVectorTopLeft;
		this.supportImages = false;
		this.icon = null;
		this.popupArrowImage = $B.kitResource("icon_pullDownArrowWhite.png");
		this.menuType = kB.MenuTypePulldown;
		this.rowHeight = 30;
		this.onChange = null;
		
		for (var i in attr) this[i] = attr[i];
		
		if (this.supportImages && this.icon == null) this.icon = $B.kitResource("spacer.png");
		
		if (this.menuDisplay == "over") this.popupArrowImage = $B.kitResource("icon_popupSelectArrowWhite.png");

		this.BDType = "BDPulldownMenu";
		this.wantsMouseUpAction = false;
		this._menuIsShowing = false;
		this.selectedIndex = 0;
		if (this.text  == undefined) this.text  = "";
		this.removeClass("BDView");
		this.addClass("BDPulldownMenu");
		//this._container = $B.View.create({ id: this.id+"_container", customClass: "BDPulldownMenu" });

		if (this.customClass != undefined) this.addClass(this.customClass);

		this._button = $B.Button.create({ 	id:this.id+"_button", 
											customClass: "BDPulldownMenuButton", 
											text: this.text, 
											preventActionPropagation: true, 
											parent: this, 
											wantsMouseUpAction: false, 
											actionOnMouseDown: true, 
											icon: this.icon,
											action: function(evt) {
												this.parent.showMenu();	
											}
										});
		//this._arrow	 = $B.ImageView.create({ id: this.id+"_arrow", url: this.popupArrowImage , customClass: "BDPulldownMenuArrow" });
		this._menuView = $B.View.create({ id: this.id+"_optionsView", visible: false, customClass: "BDPulldownMenuOptionsView", parent: this });
		this._menuView.setStyle("position", "absolute");
		$B.registerPulldownMenu( this );
		
		this._tableView = $B.TableViewController.create({ id: this.id+"_tableView", parent: this, scrollable:false, rowHeight: this.rowHeight });
		this._menuView.append( this._tableView );
		this._tableView.cellForRowAtIndex = function( index ) {
			var d = this.dataObjectAtIndex( index );
			var cell = $B.Button.create({ id: this.id+"_option_"+$B.randomStringWithLength(6), icon: d.icon, parent: this, 'index': index, customClass: "BDTableViewCell", text: d.text });
			//cell.height( this.rowHeight );
			return cell.getElem();
		};
		this._tableView.setDataSource( this.options );

		this.append( this._menuView );
		

		if (this.options != undefined) {
			this.loadOptions( this.options );
		}		
		
		this.append( this._button );
		this.layer.control = this;
		this.layer.controller = this;
		return this;

	},
	setOptions: function( options ) {
		this.loadOptions(options);
	},
	loadOptions: function( options ) {
		this.options = options;
		this._tableView.setDataSource( this.options );
		this._tableView.reloadData();
		
		if (this.menuType == kB.MenuTypePopup) {
			try {
				this.setText( this.options[0].text );
			} catch (E) {}
		}
	},
	close: function() {
		return this.hideMenu();
	},
	showMenu: function(duration) {
		if (this._menuIsShowing) return true;
		$B.closeAllPulldownMenus();
		if (duration == undefined) duration = 50;
		var self = this;

		var optsRect = this.frame();
		
		if (this.menuType == kB.MenuTypePulldown) {

			optsRect.origin.y = this._button.frame().origin.y + this._button.frame().size.height;
		}
		else if (this.menuType == kB.MenuTypePopup) {

			optsRect.origin.y = this._button.frame().origin.y + this._button.frame().size.height;

			if (this._tableView._cells[0] && this._tableView._cells[0].view && this._tableView._cells[0].view.height) {

				optsRect.origin.y -= (this._tableView._cells[0].view.height()*this.selectedIndex);

			}
		}

		if (this.parentBDView() != null) {
			var pv = this.parentBDView();
			optsRect = pv.convertRectToView( optsRect, pv );
		}

		this._menuView.setFrame( optsRect );

		if (this.menuAnchor == kB.ViewVectorTopRight) {
			this._menuView.left( 'auto' );
			//this._menuView.right( ($B.device.screenWidth() - this._button.frame().size.width - this._button.frame().origin.x) + "px" );
			this._menuView.right(0);
		}

		//this._menuView.height( this.options.length * this.rowHeight );
		this._menuView.height( 'auto' );

		this._menuView.hide();
		
		if (this.menuType == kB.MenuTypePulldown) {
			this._tableView.deselectAllRows();
		}
		this._menuView.fadeIn( duration, function() {
			self.menuDidAppear();
			self._menuIsShowing = true;
			$B._currentPulldownMenu = self;
		});
		this.wantsMouseUpAction = false;

		this.mouseUpTimeout = setTimeout(function() {
			self.wantsMouseUpAction = true;
			window.addEventListener(kB.InteractionEnded, function interactionEndedListener(evt) {
				window.removeEventListener(kB.InteractionEnded, interactionEndedListener, false);
				self.hideMenu();
				if (!self) return;
				var menuItem = evt.target.controller;
				self.handleSelection.call( self, menuItem.index );
			}, false);
		}, 250);
		//this._tableView.view().updateSliderMinSize();
		window.addEventListener(kB.InteractionMoved, this.handleInteractionMoved, false);

	},
	hideMenu: function(duration) {
		if (duration == undefined) duration = 150;
		var self = this;

		this._menuView.fadeOut(duration, function() {
			self.menuDidDisappear();
			self._menuIsShowing = false;
		});		

		$B._currentPulldownMenu = null;
	},
	setText: function( t ) {
		this._button.setText(t);
	},
	menuDidAppear: function() {
		
	},
	menuDidDisappear: function() {
		
	},
	handleInteractionMoved: function( evt ){
		// in this context, this refers to window
		// if (evt.target.controller.parent && evt.target.controller.parent.parent ) {
		// 	var menuObj = evt.target.controller.parent.parent;
		// 	$B._currentPulldownMenu = menuObj;
		// }

		var btn = evt.target.controller;
		while ( btn != null ) {
			if (btn.typeIsEqualTo("BDButton")) break;
			if (!btn.parentBDView) break;
			btn = btn.parentBDView();
		}

		if ($B._currentPulldownMenu == null) return;

		$B._currentPulldownMenu.wantsMouseUpAction = true;
		$B._currentPulldownMenu._tableView.deselectAllRows();

		if (btn == undefined || btn.addClass == undefined) return;
		
		btn.addClass('selected');	
	},
	handleMouseUp: function(evt) {
		clearTimeout(this.mouseUpTimeout);
		window.removeEventListener(kB.InteractionMoved, this.handleInteractionMoved, false);
		this.hideMenu();
	},
	handleSelection: function( index ) {
		var self = this;
		setTimeout( function() {
			if (self.onChange != null && index != undefined) {
				self.onChange.call(self, index, self.options[ index ]);
			}
			self.selectedIndex = index;
			if (self.menuType == kB.MenuTypePopup) {
				try {
					self.setText( self.options[index].text );
				} catch (E) {}
			}

		}, 200);
	},
	destroy: function() {
		$B.destroyPulldownMenu(this);
	}
});

	Bind.classes.BDPulldownMenu = BDPulldownMenu;
	$B.PulldownMenu = {
		create: function( attr ) {
			return new BDPulldownMenu( attr );
		}
	};
	
})($B);
/** BDProgressIndicator **/

(function($B) {
	/**
	 * BDProgressIndicator
	 * @constructor
	 * @extends BDView
	 */	

	kB.ProgressIndicatorTypeDefault = 0;
	kB.ProgressIndicatorTypeBar     = 0;
	kB.ProgressIndicatorTypeCircle  = 1;

	

var BDProgressIndicator = Bind.classes.BDView.extend({
	displayName: "BDProgressIndicator",
	init: function( attr ) {
		var self = this;
		this.type = 0;
		this.indeterminent = false;
		this.animationSize = 30;
		this.autoStart = true;

		this._super( attr );

		this.BDType = "BDProgressIndicator";
		

		this.removeClass("BDView");
		this.addClass("BDProgressIndicator");
		
		this._fillContainer = this.append( $B.View.create({ id: this.id+"_fillContainer", customClass: "BDProgressIndicatorFillContainer" }) );
		this._fillContainer.removeClass( "BDView" );

		this._indeterminentLayer = this._fillContainer.append( $B.View.create({ id: this.id + "_indeterminentLayer", customClass: "BDProgressIndicatorIndeterminentFill" }) );
		this._indeterminentLayer.removeClass( "BDView" );
		this._indeterminentLayer.setStyle("position", "absolute");

		this._fill = this._fillContainer.append( $B.View.create({ id: this.id+"_fill", customClass: "BDProgressIndicatorFill" }) );
		//this._fill.hide();
		this._fill.removeClass( "BDView" );
		this._fill.setStyle("position", "absolute");
		this._fillContainer.setStyle("position", "relative");



		if (!this.isIndeterminent()){
			this.setProgress(0);
		}

	},
	setProgress: function( p ) {
		if (p > 1) {
			p = 1;
		} else if (p < 0) {
			p = 0;
		}
		if (this.isIndeterminent()) {
			this.setIndeterminent( false );
		}
		this._fill.width((p*100)+"%");
	},
	setIndeterminent: function( bool ){
		if (this.indeterminent == bool) return;
		this.indeterminent = bool;
		if (this.indeterminent) {
			this._makeIndeterminent();
		} else {
			this._makeDeterminent();
		}
	},
	isIndeterminent: function() {
		return this.indeterminent;
	},
	_makeIndeterminent: function() {
		this.stopAnimation();
		this._indeterminentLayer.width( "100%" );
		this._indeterminentLayer.fadeIn(150);
		this._fill.fadeOut( 150 );

		if (this.autoStart) {
			this.startAnimation();
		}
	},
	_makeDeterminent: function() {
		this.stopAnimation();
		this._indeterminentLayer.fadeOut(150);
		this._fill.fadeIn( 150 );
	},
	startAnimation: function() {
		//this._indeterminentLayer.left(-2*this.animationSize);
		this._position = -2 * this.animationSize;
		this.performActionOnInterval( function() {
			this._position = this.animationSize * -2 + ((this._position + 1) % this.animationSize);
			this._indeterminentLayer.setStyle('backgroundPosition', this._position + "px 0");
		}, 33.33, "_indeterminentAnimation");
	},
	stopAnimation: function() {
		this.cancelIntervalActionWithId("_indeterminentAnimation");
	}
});
	Bind.classes.BDProgressIndicator = BDProgressIndicator;
	$B.ProgressIndicator = {
		create: function( attr ) {
			return new BDProgressIndicator( attr );
		}
	};
})($B);
/** BDUserInterface **/

(function() {
	
	var BDUserInterface = BDObject.extend({
		init: function( attr ) {
		
		},
		initWithDef: function( _interface ) {
		
		},
		defFromView: function( _v ) {
			var _interface = $B.UserInterface.create();
			
		}
	});
	
	BDUserInterface.displayName = "BDUserInterface";
	
	Bind.classes.BDUserInterface = BDUserInterface;
	$B.UserInterface = {
		create: function( a ) {
			return new BDUserInterface( a );
		}
	};	
});
console.log('BindJS completed initialization in '+ (new Date().getTime() - __BDStartTime) + 'ms');
