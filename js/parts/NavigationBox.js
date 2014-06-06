var NavigationBox = $V.classes.VTableViewController.extend({
	viewWillInit: function( attr ) {
		attr.scrollable = false;
	},
	viewDidLoad: function(aView) {
		this.view().addClass("Navigation");
		this.setDataSource([	
			{text: "About Me", href: "Biography"},
			{text: "Experience", href: "Experience"},
			{text: "Past Work", href: "Work"},
			{text: "Hire Me", href: "Mailroom"}
		]);
		this.reloadData();
	},
	cellForRowAtIndex: function(i) {
		var d = this.dataObjectAtIndex(i);
		var v = $V.View.alloc({ customClass:"VTableViewCell" }).beginSubviews();
					$V.Button.alloc({ text: d.text });
				$V.endView();
		return v.getElem();
	},
	didSelectRowAtIndex: function(i) {
		SharedApp.Home.showDetailView( this.dataObjectAtIndex(i).href );
	}
});
NavigationBox.displayName = "NavigationBox";
$V.setIncludeObject(NavigationBox);