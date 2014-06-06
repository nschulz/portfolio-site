var Guide = $V.classes.VViewController.extend({
	displayName: "Guide",
	viewWillInit: function(prop) {
		prop.margins = { top: 'auto', left: 'auto', right: 0, bottom: -50 };
	},
	viewDidLoad: function(aView) {
		var self = this;
		this.player = $V.MovieView.alloc({ id: "GuidePlayer", autoPlay: false, controls: false, url: ["http://assets.nateschulz.com/guide/hawker.mp4", "http://assets.nateschulz.com/guide/hawker.ogg", "http://assets.nateschulz.com/guide/hawker.webm"] });
//		this.player.setStyle('position', 'absolute');
		this.player.setSize( 360, 540 );
		this.player.setAction( function() {
			if (self.currentVideo == "welcome") {
				self.play("hawker");
			} else {
				self.play("welcome");	
			}
		});
		
		this.view().setSize( 360, 540 );
		this.view().append( this.player );
	},
	play: function( video ) {
		switch (video) {
			case "welcome":
				this.player.load( ["http://assets.nateschulz.com/guide/welcome.mp4", "http://assets.nateschulz.com/guide/welcome.ogg", "http://assets.nateschulz.com/guide/welcome.webm"] );
			break;
			case "hawker":
				this.player.load( ["http://assets.nateschulz.com/guide/hawker.mp4", "http://assets.nateschulz.com/guide/hawker.ogg", "http://assets.nateschulz.com/guide/hawker.webm"] );
			break;
			default:
		}
		this.currentVideo = video;
		this.player.play();
	},
	pause: function() {
		this.player.pause();
	}
});

$V.setIncludeObject(Guide);