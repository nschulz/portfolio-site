$V.include(
[	
	"js/parts/Home.js",
	"js/parts/Biography.js",
	"js/parts/NavigationBox.js",
	"js/parts/Guide.js",
	"js/parts/Photography.js",
	"js/parts/Experience.js",
	"js/parts/Work.js",
	"js/parts/Mailroom.js",
],
function run() {
	var Home = null;
	
	$V.preventTouchScrolling();
	$V.preventNativeMouseWheel();
	
	var AppDelegate = VObject.extend({
		displayName: "AppDelegate",
		init: function() {
			this.mainWindow = $V.Window.alloc({ title: "NateSchulz", 
												customClass: "VAppWindow",
												fullScreen: true, 
												hasTitleBar:false, 
												windowLevel: kV.WindowLevelBackground });
			if ($V.device.isiPad()) {
				this.mainWindow.addClass("iPad");
			}
			Home = $V.getIncludeObject("Home");
			this.Home = new Home();
			this.mainWindow.append( this.Home );
			this.mainWindow.makeKeyAndOrderFront();
			
			clearTimeout(WATCHDOG);
			
		}
	});
	$V.setIncludeObject(AppDelegate);
	
});