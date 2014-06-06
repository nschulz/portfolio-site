var Mailroom = $V.classes.VViewController.extend({
	displayName: "Mailroom",
	viewWillInit: function(prop) {
	},
	viewDidLoad: function(aView) {
		var self = this;
		var preload = new Image();
		preload.src = "media/Envelope400short.gif";
		this.view().beginSubviews();
			this.container = $V.View.alloc({ id: "FormContainer", customClass: "contentPlate Mailroom" }).beginSubviews();
				this.form = $V.Form.alloc({ id:"contactForm", customClass: "FormView" }).beginSubviews();
					$V.TextField.alloc({ id: "nameInput",  customClass: "name",    title: "Your Name" });
					$V.TextField.alloc({ id: "emailInput", customClass: "email",   title: "Your E-mail" });
					$V.TextArea.alloc({  id: "msgInput",   customClass: "message", title: "Message" });
		
					$V.Button.alloc({ id: "clearBtn", text: "Clear", action: function(){self.clear();}  });
					$V.Button.alloc({ id: "sendBtn",  text: "Send",  action: function(){self.submit();}, customClass: "floatRight", defaultButton: true });
				$V.endView();
			$V.endView();
		$V.endView();
	},
	showSuccessView: function() {
		var self = this;
		this.form.fadeOut( 250, function() {
			self.container.html("<img class='envelope' src='/media/Envelope400short.gif' alt='sent'/>");
		});
	},
	clear: function() {
		this.form.getElem().reset();
	},
	submit: function() {
		var self  = this;
		var name  = V('nameInput').getValue(),
			email = V('emailInput').getValue(),
			msg   = V('msgInput').getValue();
		if (name == "" || email == "" || msg == "") {
			alert("Please fill out the form before sending your message.");
			return;
		}
		$V.ajax({ 	type: "post",
					url: "/action/sendMail.php",
					data: "name="+name+"&email="+email+"&message="+msg,
					onComplete: function() {
						self.showSuccessView();
					}
				});
	}
});

$V.setIncludeObject(Mailroom);