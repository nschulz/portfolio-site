var kLegacySiteURL = "http://legacy.nateschulz.com";
var WATCHDOG = setTimeout(function() {
	window.location = kLegacySiteURL;
}, 10000);

if ($V.device.isIE() && !$V.device.isIE9()) {
	window.location = kLegacySiteURL;
}

if ($V.device.isiOS() && !$V.device.isiPad()) {
	window.location = kLegacySiteURL;
}

$V.include(
["js/appDelegate.js"],
function main() {
	var AppDelegate = null;
	if ($V.getIncludeObject("AppDelegate")) {
		AppDelegate = $V.getIncludeObject("AppDelegate");
		window.SharedApp = new AppDelegate();	
	} else {
		$V.attachEventHook("$V:didSetIncludeObject", function(o, h) {
			if (o.name == "AppDelegate") {
				$V.removeEventHook(h);
				AppDelegate = $V.getIncludeObject("AppDelegate");
				window.SharedApp = new AppDelegate();
			}
		});
	}
});