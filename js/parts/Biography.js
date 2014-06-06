var Biography = $V.classes.VViewController.extend({
	displayName: "Biography",
	viewWillInit: function(prop) {
		prop.margins = { top: 0, left: 0, right: 0, bottom: 0 };
	},
	viewDidLoad: function(aView) {
		var self = this;
		
		this.containerView = this.view().append( $V.View.alloc({ customClass: "contentPlate" }) );
		
		this.asideView = this.containerView.append( $V.View.alloc({ id: "BioAside", customClass: "aside" }) );
		this.photoView = this.asideView.append( $V.ImageView.alloc({ id: "BioPhoto", url: "media/bioPhoto@2x.jpg" }) );
		
		this.linksView = this.asideView.append( $V.View.alloc({ customClass: "links" }) );
		
		this.linksView.append( $V.Button.alloc({ id: "LinkedInBtn", text: "LinkedIn", action: function() {self.openLink('http://www.linkedin.com/in/nschulz');} }) );
		this.linksView.append( $V.Button.alloc({ id: "TwitterBtn", text: "Twitter", action: function() {self.openLink('https://twitter.com/nschulz');} }) );
		this.linksView.append( $V.Button.alloc({ id: "GoogleBtn", text: "Google+", action: function() {self.openLink('https://plus.google.com/+NateSchulz');} }) );
		this.linksView.append( $V.Button.alloc({ id: "FacebookBtn", text: "Facebook", action: function() {self.openLink('https://facebook.com/nschulz');} }) );
			
		
		this.contentView = this.containerView.append( $V.View.alloc({ id: "BioBlurb" }) );
		this.contentView.setContentFromUrl("content/biography.html");
		
	},
	openLink: function ( aUrl ) {
		window.open( aUrl, "Nate Schulz" );
	}
});

$V.setIncludeObject(Biography);