var WorkTVC = null,
	DetailVC	   = null;
var Work = $V.classes.VViewController.extend({
	displayName: "Work",
	viewWillInit: function(prop) {
		prop.margins = { top: 0, left: 0, right: 0, bottom: 0 };
	},
	viewDidLoad: function(aView) {
		var self = this;
		
		this.detailViewShelf = aView.append( $V.View.alloc({ customClass: "Shelf" }) );
		this.detailViewContainer = aView.append( $V.View.alloc({ customClass: "DetailViewContainer" }) );

		this.thumbnailView = new WorkTVC({ id: "WorkThumbs", parentVC: this });
		
		aView.append( this.thumbnailView );
		
		$V.getUrl("content/workGallery.json", function(d) {
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
		this.view().opacity(0);
		var self = this;

		
		var _scaleType = kV.ViewScalingTypeFull;
		if (this.data.scalingType != null) {
			_scaleType = this.data.scalingType;
		}
		

		this.titleLabel = aView.append( $V.Label.alloc({ customClass: "TitleLabel", text: this.data.title, action: function(){self.handleAction()} }) );
		
		if (this.data.action) {
			this.titleLabel.addClass("hasAction");
		}
		
		this.spillContainer = aView.append( $V.View.alloc({ id: "MediaSpillContainer", customClass: "MediaSpillContainer" }) );
		
		if (this.type == "movie") {
			this.mediaView = this.spillContainer.append( $V.MovieView.alloc({ customClass: "MediaView", url: this.data.media }) );
		} else {
			this.mediaView = this.spillContainer.append( $V.ImageView.alloc({ customClass: "MediaView", scalingType: kV.ViewScalingTypeFit, url: this.data.media, positionVector: kV.ViewVectorBottom }) );
		}
		
		this.descriptionSV = aView.append( $V.ScrollView.alloc({ allowWheelScroll:true, customClass: "DescriptionScrollView" }) );
		this.descriptionView = this.descriptionSV.append( $V.Label.alloc({ customClass: "DescriptionView", text: this.data.description }) );
			
		this.view().fadeIn(300);
	},
	dismiss: function() {
		var self = this;
		this.view().fadeOut(500, function() {
			self.destroy();
		})
	},
	handleAction: function() {
		if (this.data.action) {
			if (typeof this.data.action == "string" && this.data.action.indexOf("http") == 0) {
				window.open(this.data.action, "Nate Schulz");
			}
		}
	}
});

WorkTVC = $V.classes.VTableViewController.extend({
	displayName: "WorkGalleryTVC",
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

$V.setIncludeObject(Work);