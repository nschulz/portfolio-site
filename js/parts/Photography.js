var PhotographyTVC = null,
	DetailVC	   = null;
var Photography = $V.classes.VViewController.extend({
	displayName: "Photography",
	viewWillInit: function(prop) {
		prop.margins = { top: 0, left: 0, right: 0, bottom: 0 };
	},
	viewDidLoad: function(aView) {
		var self = this;
		
		this.detailViewContainer = aView.append( $V.View.alloc({ customClass: "DetailViewContainer" }) );

		this.thumbnailView = new PhotographyTVC({ id: "PhotographyThumbs", parentVC: this });
		
		aView.append( this.thumbnailView );
		
		$V.getUrl("content/photographyGallery.json", function(d) {
			try {
				var gData = $V.JSON.decode( d );
				self.loadGalleryData( gData );
			} catch (E) {
				console.log("Unable to decode gallery data");
			}
		});
		
	},
	loadGalleryData: function( d ) {
		this._dataSet = $V.Array.arrayWithArray(d);
		this.thumbnailView.setDataSource( this._dataSet );
		this.thumbnailView.reloadData();
		this.thumbnailView.selectRowAtIndex(0);
	},
	showDetailsForItemAtIndex: function( i ) {
		if (this.detailView) this.detailView.dismiss();
		
		this.detailView = this.detailViewContainer.append( new DetailVC({ data: this._dataSet.objectAtIndex(i), index: i }) );
	}
});

DetailVC = $V.classes.VViewController.extend({
	viewWillInit: function( attr ) {
		attr.customClass = "DetailView";	
	},
	viewDidLoad: function( aView ) {
		this.type = this.data.mediaType;
		this.view().hide();
		
		this.beginSubviews();
			this.titleLabel = $V.Label.alloc({ customClass: "TitleLabel", text: this.data.title });
			
			if (this.type == "Movie") {
				this.mediaView = $V.MovieView.alloc({ customClass: "MediaView", url: this.data.media });
			} else {
				this.mediaView = $V.ImageView.alloc({ customClass: "MediaView", url: this.data.media });
			}
			
			this.descriptionView = $V.Label.alloc({ customClass: "DescriptionView", text: this.data.description });
		$V.endView();
		
		this.view().fadeIn(300);
	},
	dismiss: function() {
		var self = this;
		this.view().fadeOut(500, function() {
			self.destroy();
		})
	}
});

PhotographyTVC = $V.classes.VTableViewController.extend({
	displayName: "PhotographyGalleryTVC",
	viewWillInit: function( attr ) {
		attr.isVertical = false;
		attr.allowWheelScroll = true;	
	},
	viewDidLoad: function( aView ) {
		
		//this.view().setDataSource();
	},
	cellForRowAtIndex: function( index ) {
		var c = $V.View.alloc({ customClass: "VTableViewCell" });
		c.iv = $V.ImageView.alloc({ url: this.dataObjectAtIndex( index ).thumb });
		c.append( c.iv );
		return c.getElem();
	},
	didSelectRowAtIndex: function( index ) {
		this.parentVC.showDetailsForItemAtIndex(index);
	}
});

$V.setIncludeObject(Photography);