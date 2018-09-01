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
	var base = this;
	$(this).addClass('rapAudio');
	this.canvas = $('<canvas>').appendTo(this)[0];
	this.audio = $('<audio>').appendTo(this)[0];
	if(this.opt.src)
		$(this.audio).attr('src',this.opt.src);
	if(this.opt.controls)
		$(this.audio).attr('controls','');
	if(this.opt.loop)
		$(this.audio).attr('loop','');
	
	this.audio.onended = function(){
		if(base.opt.onEnded)
			base.opt.onEnded.call(base);
	}
	
	this.audio.onloadedmetadata = function(){
		if(base.opt.onLoadedmetadata)
			base.opt.onLoadedmetadata.call(base);
	}
	
	this.audio.onvolumechange = function(){
		if(base.opt.onVolumechange)
			base.opt.onVolumechange.call(base);
	}
	
	this.Init = function(){
		var h = $(this).height() - $(this.audio).height();
		$(this.canvas).height(h);
		var canvas = this.canvas;
		canvas.width = $(this.canvas).width();
		canvas.height = $(this.canvas).height();
		var ctx = new AudioContext();
		var analyser = ctx.createAnalyser();
		var audioSrc = ctx.createMediaElementSource(this.audio);
		audioSrc.connect(analyser);
		analyser.connect(ctx.destination);
		var frequencyData = new Uint8Array(analyser.frequencyBinCount);
		var cwidth = canvas.width;
		var cheight = canvas.height;
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
		var array = new Uint8Array(analyser.frequencyBinCount);
		var step = Math.floor((array.length * this.opt.frequency)/ meterNum); 
		if(meterStart < 0)meterStart = 0;
		ctx = canvas.getContext('2d');
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
			requestAnimationFrame(renderFrame);
		}
		renderFrame();
	};

	this.Init();
	if(this.opt.autoplay)
		this.audio.play();
})

}})(jQuery);