var Experience = $V.classes.VViewController.extend({
	displayName: "Experience",
	viewWillInit: function(prop) {
		prop.margins = { top: 40, left: 0, right: 0, bottom: 40 };
		prop.allowWheelScroll = true;
		prop.id = "ExperienceContent";
		this._view = $V.ScrollView.alloc(prop);
	},
	viewDidLoad: function(aView) {
		this.view().setContentFromUrl("content/experience.html");
	}
});

$V.setIncludeObject(Experience);