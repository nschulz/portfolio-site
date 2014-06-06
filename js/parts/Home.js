var NavigationBox = $V.getIncludeObject("NavigationBox"),
	Experience  = null,
	Guide		= null,
	Photography = null,
	Biography 	= null,
	Work		= null,
	Mailroom	= null;

var Home = $V.classes.VViewController.extend({
	displayName: "Home",
	viewWillInit: function(prop) {
		prop.margins = { top: 0, left: 0, right: 0, bottom: 0 };
	},
	viewDidLoad: function(aView) {
		
		NavigationBox	= $V.getIncludeObject("NavigationBox");
		Experience 		= $V.getIncludeObject("Experience");
		Guide			= $V.getIncludeObject("Guide");
		Photography		= $V.getIncludeObject("Photography");
		Biography		= $V.getIncludeObject("Biography");
		Mailroom		= $V.getIncludeObject("Mailroomz");
		Work			= $V.getIncludeObject("Work");
		
		this.isShowingWelcomeScreen = true;
		
		this.backgroundView = $V.View.alloc({ 	id: "BackgroundContainer" });
		this.backgroundView.setContent("<div id='BackgroundView'></div>");
		this.view().append( this.backgroundView );
		
		this.footerView = this.view().append( $V.Label.alloc({ id: "Footer", text: "&copy;2012-2013 Nathan Schulz | All Rights Reserved" }) );
	
		/* Nav Container */	
		
		this.navContainer = $V.ViewController.alloc({ id:"NavContainer", customClass: "NavContainer" });
		this.navContainer.view().hide();
		this.navContainer.view().height(2);
		this.navContainer.view().marginTop(0);

		/* Nav Box */
				
		this.nav = new NavigationBox();
		this.nav.view().setMargins(0,0,0,0);
		
		var self = this;

		this.navContainer.view().append( this.nav );
		this.view().append( this.navContainer );

		this.navContainer.view().fadeIn(250, function() {
			self.navContainer.view().animate('height', 182, {duration:1000}, function() {
				// console.log(this);
				setTimeout(function() {
					self.navContainer.view().height('auto');
				},20);
			});
			self.navContainer.view().animate('marginTop', -91, {duration:1000});
		});
		
		this.logoView = $V.ImageView.alloc({ id: "logoIV", url: "media/NSLogoDark.png", margins: { top: 10, right: 20, left: 'auto', bottom: 'auto' } });
		this.logoView.setSize( 250, 40 );
		this.logoView.hide();
		this.navContainer.view().append( this.logoView );
		this.logoView.fadeIn(2000);
		
		this.guideController = new Guide();
	},
	showDetailView: function(v) {
		var self = this;
		var navView = this.navContainer.view();
		var _b = $V.device.screenHeight() - (navView.top()+navView.height());
		var _r = $V.device.screenWidth() - (navView.left()+navView.width());
		navView.top(navView.top());
		navView.left('auto');
		navView.right(_r);
		navView.bottom(_b);
		navView.marginTop(0);
		navView.marginLeft(0);

		if ($V.device.isiPad() && self.isShowingWelcomeScreen) {
			this.navContainer.view().append( this.guideController );
			this.guideController.play('hawker');
			this.isShowingWelcomeScreen = false;
		}

		setTimeout(function() {
			self.backgroundView.animate('right', 300, {duration: 500});
			navView.animate('top', 0, {duration: 500});
			navView.animate('bottom', 0, {duration: 500});
			navView.animate('right', 0, {duration: 500}, function() {
				
				if (self.isShowingWelcomeScreen) {
					self.navContainer.view().addClass("running");
				}
				
				if (!$V.device.isiPad() && self.isShowingWelcomeScreen) {
					self.navContainer.view().append( self.guideController );
					self.guideController.play('hawker');
					self.isShowingWelcomeScreen = false;
				}

			});
		},25);
		
		if (this.detailViewWindow) {
			this.detailViewWindow.orderOut();
		}
		
		var section = new ($V.getIncludeObject(v))();
		this.detailViewWindow = $V.Window.alloc({ 	title: v, margins: { left: 0, top: 0, right: 300, bottom: 0 },
													id: v+"_Window",
													hasTitleBar: false,
													transition: kV.WindowTransitionTypeZoomFade,
													draggable: false });
		
		this.detailViewWindow.append( section );
		this.detailViewWindow.makeKeyAndOrderFront();
	}
});

$V.setIncludeObject(Home);