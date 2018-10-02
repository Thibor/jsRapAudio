window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

(function($){
$.fn.jsRapAudio = function(options){
		
return this.each(function() {
	this.opt = $.extend({
		autoplay:false,
		controls:true,
		loop:false,
		capHeight:4,
		capSpeed:0.6,
		meterCount:40,
		meterGap:2,
		frequency:0.7,
		capColor:'#fff',
		src:'',
		onEnded:null,
		onLoadedmetadata:null,
		onVolumechange:null
	},options);
	let base = this;
	let AF = 0;
	$(this).addClass('rapAudio');
	this.divCanvas = $('<div>').appendTo(this);
	this.divCaption = $('<div>').addClass('divCaption').appendTo(this.divCanvas);
	this.canvas = $('<canvas>').appendTo(this.divCanvas)[0];
	this.audio = $('<audio>').attr('src',this.opt.src).appendTo(this)[0];
	this.divControls = $('<div>').addClass('divControls').appendTo(this);
	this.divPP = $('<div>').addClass('divPP').html('&#9658;').appendTo(this.divControls);
	this.divCurTime = $('<div>').addClass('divCurTime').appendTo(this.divControls);
	this.divProOut = $('<div>').addClass('divProOut').appendTo(this.divControls);
	this.divProIn = $('<div>').addClass('divProIn').appendTo(this.divProOut);
	this.divTotTime = $('<div>').addClass('divTotTime').appendTo(this.divControls);
	if(this.opt.controls)
		$(this.divControls).show();
	if(this.opt.loop)
		$(this.audio).attr('loop','');
	
	this.audio.onended = function(){
		if(base.opt.onEnded)
			base.opt.onEnded.call(base);
	}
	
	this.audio.onloadedmetadata = function(){
		$(base.divCurTime).text(SecToTim(0));
		$(base.divTotTime).text(SecToTim(base.audio.duration));
		if(base.opt.onLoadedmetadata)
			base.opt.onLoadedmetadata.call(base);
	}
	
	this.audio.onpause = function(){
		base.divPP.html('&#9658;');
	}
	
	this.audio.onplay = function(){
		base.divPP.html('&#10074;&#10074;');
	}
	
	this.audio.ontimeupdate = function(){
		$(base.divCurTime).text(SecToTim(base.audio.currentTime));
		$(base.divProIn).width((base.audio.currentTime / base.audio.duration ) * 100 + '%');
	}
	
	this.audio.onvolumechange = function(){
		if(base.opt.onVolumechange)
			base.opt.onVolumechange.call(base);
	}
	
	$(this.divPP).bind({
		click : function(e){
			if(base.audio.paused)
				base.audio.play();
			else
				base.audio.pause();
		}
	});
	
	$(this.divProOut).bind({
		click : function(e){
			let p = (e.clientX - $(base.divProOut)[0].getBoundingClientRect().left) / $(base.divProOut).width();
			base.audio.currentTime = base.audio.duration * p;
		}
	});
	
	let cwidth = $(this).width();
	let cheight = $(this).height();
	if(this.opt.controls)
		cheight -= 32;
	$(this.divCanvas).bind({
			click : function(e){
				$(base.canvas).toggle();
				$(base.divCaption).toggle();
				if($(base.canvas).is(':visible'))
					AF = requestAnimationFrame(renderFrame);
				else
					cancelAnimationFrame(AF);
			}
	}).height(cheight);	
	
	var canvas = this.canvas;
	var AC = new AudioContext();
	var analyser = AC.createAnalyser();
	var audioSrc = AC.createMediaElementSource(this.audio);
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	var capHeight = this.opt.capHeight;
	var meterGap = this.opt.meterGap;
	var capSpeed = this.opt.capSpeed;
	var capStyle = this.opt.capColor;
	var meterNum = this.opt.meterCount;
	var capMax = cheight - capHeight;
	var capYPositionArray = new Array(meterNum);
	var meterWidth = Math.floor(cwidth / meterNum) - meterGap;
	if(meterWidth < 1)meterWidth = 1;
	var meterSpace = meterWidth + meterGap;
	var meterStart = (cwidth - meterSpace * meterNum) >> 1;
	if(meterStart < 0)meterStart = 0;
	var array = new Uint8Array(analyser.frequencyBinCount);
	var step = Math.floor((array.length * this.opt.frequency)/ meterNum); 
	canvas.width = cwidth;
	canvas.height = cheight;
	audioSrc.connect(analyser);
	analyser.connect(AC.destination);
	let ctx = canvas.getContext('2d');
	gradient = ctx.createLinearGradient(0,0,0,cheight);
	gradient.addColorStop(1,'#040');
	gradient.addColorStop(0.5,'#880');
	gradient.addColorStop(0,'#f00');
		
	function renderFrame(){
		analyser.getByteFrequencyData(array);
		ctx.clearRect(0,0,cwidth,cheight);
		for (var i = 0;i < meterNum; i++){
			var x = meterStart + i * meterSpace;
			var y = cheight - (cheight * array[i * step]) / 0xff;
			if(y > capYPositionArray[i])
				capYPositionArray[i] += capSpeed;	
			else
				capYPositionArray[i] = y;
			if(capYPositionArray[i] > capMax)
				capYPositionArray[i] = capMax;
			ctx.fillStyle = capStyle;
			ctx.fillRect(x,capYPositionArray[i],meterWidth,capHeight);
			ctx.fillStyle = gradient;
			ctx.fillRect(x,y + capHeight,meterWidth,cheight);
		}
		AF = requestAnimationFrame(renderFrame);
	}
	
	function SecToTim(secs){
		var hoursDiv = secs / 3600, hours = Math.floor( hoursDiv ), minutesDiv = secs % 3600 / 60, minutes = Math.floor( minutesDiv ), seconds = Math.ceil( secs % 3600 % 60 );
		if( seconds > 59 ) { seconds = 0; minutes = Math.ceil( minutesDiv ); }
		if( minutes > 59 ) { minutes = 0; hours = Math.ceil( hoursDiv ); }
		return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' ) + ( minutes.toString().length < 2 ? '0'+minutes : minutes ) + ':' + ( seconds.toString().length < 2 ? '0' + seconds : seconds );
	};
		
	AF = requestAnimationFrame(renderFrame);
	if(this.opt.autoplay)
		this.audio.play();
})

}})(jQuery);