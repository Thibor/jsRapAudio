window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

(function ($) {
	$.fn.jsRapAudio = function (options) {

		return this.each(function () {
			this.opt = $.extend({
				autoplay: false,
				controls: true,
				loop: false,
				capHeight: 4,
				capSpeed: 0.6,
				meterCount: 40,
				meterGap: 2,
				frequency: 0.7,
				volume:0.5,
				capColor: '#fff',
				src: '',
				onEnded: null,
				onLoadedmetadata: null,
				onVolumechange: null
			}, options);
			let base = this;
			let AF = 0;
			this.volume = 0;
			$(this).empty().addClass('rapAudio');
			this.divCanvas = $('<div>').appendTo(this);
			this.divCaption = $('<div>').addClass('divCaption').appendTo(this.divCanvas);
			this.canvas = $('<canvas>').appendTo(this.divCanvas)[0];
			this.audio = $('<audio>').attr('src', this.opt.src).appendTo(this)[0];
			this.divControls = $('<div>').addClass('divControls').appendTo(this);
			this.divPP = $('<div>').addClass('divPP').html('&#9658;').appendTo(this.divControls);
			this.divVolumeOut = $('<div>').addClass('divVolumeOut').appendTo(this.divControls);
			this.divVolumeIn = $('<div>').addClass('divVolumeIn').appendTo(this.divVolumeOut);
			this.divCurTime = $('<div>').addClass('divCurTime').appendTo(this.divControls);
			this.divProOut = $('<div>').addClass('divProOut').appendTo(this.divControls);
			this.divProIn = $('<div>').addClass('divProIn').appendTo(this.divProOut);
			this.divTotTime = $('<div>').addClass('divTotTime').appendTo(this.divControls);
			if (this.opt.controls)
				$(this.divControls).show();
			if (this.opt.loop)
				$(this.audio).attr('loop', '');

			this.audio.onended = function () {
				if (base.opt.onEnded)
					base.opt.onEnded.call(base);
			}

			this.audio.onloadedmetadata = function () {
				$(base.divCurTime).text(SecToTim(0));
				$(base.divTotTime).text(SecToTim(base.audio.duration));
				if (base.opt.onLoadedmetadata)
					base.opt.onLoadedmetadata.call(base);
			}

			this.audio.onpause = function () {
				base.divPP.html('&#9658;');
			}

			this.audio.onplay = function () {
				base.divPP.html('&#10074;&#10074;');
			}

			this.audio.ontimeupdate = function () {
				$(base.divCurTime).text(SecToTim(base.audio.currentTime));
				$(base.divProIn).width((base.audio.currentTime / base.audio.duration) * 100 + '%');
			}

			$(this.divPP).bind({
				click: function (e) {
					if (base.audio.paused) {
						audioContext.resume();
						base.audio.play();
					} else
						base.audio.pause();
				}
			});

			$(this.divVolumeOut).bind({
				click: function (e) {
					base.UpdateVolume(e);
				},
				mousemove: function (e) {
					if (e.buttons == 1)
						base.UpdateVolume(e)
				}
			});

			$(this.divProOut).bind({
				click: function (e) {
					let p = (e.clientX - $(base.divProOut)[0].getBoundingClientRect().left) / $(base.divProOut).width();
					base.audio.currentTime = base.audio.duration * p;
				}
			});

			let baseWidth = $(this).width();
			let baseHeight = $(this).height();
			if (this.opt.controls)
				baseHeight -= 32;
			$(this.divCanvas).bind({
				click: function (e) {
					$(base.canvas).toggle();
					$(base.divCaption).toggle();
					if ($(base.canvas).is(':visible'))
						AF = requestAnimationFrame(RenderFrame);
					else
						cancelAnimationFrame(AF);
				}
			}).height(baseHeight);

			let canvas = this.canvas;
			let audioContext = new AudioContext();
			var analyser = audioContext.createAnalyser();
			var audioSrc = audioContext.createMediaElementSource(this.audio);
			var capHeight = this.opt.capHeight;
			var meterGap = this.opt.meterGap;
			var capSpeed = this.opt.capSpeed;
			var capStyle = this.opt.capColor;
			var meterNum = this.opt.meterCount;
			var capMax = baseHeight - capHeight;
			var capYPositionArray = new Array(meterNum);
			var meterWidth = Math.floor(baseWidth / meterNum) - meterGap;
			if (meterWidth < 1) meterWidth = 1;
			var meterSpace = meterWidth + meterGap;
			var meterStart = (baseWidth - meterSpace * meterNum) >> 1;
			if (meterStart < 0) meterStart = 0;
			var frequencyData = new Uint8Array(analyser.frequencyBinCount);
			var step = Math.floor((frequencyData.length * this.opt.frequency) / meterNum);
			canvas.width = baseWidth;
			canvas.height = baseHeight;
			audioSrc.connect(analyser);
			analyser.connect(audioContext.destination);
			let ctx = canvas.getContext('2d');
			gradient = ctx.createLinearGradient(0, 0, 0, baseHeight);
			gradient.addColorStop(1, '#040');
			gradient.addColorStop(0.5, '#880');
			gradient.addColorStop(0, '#f00');

			function RenderFrame() {
				let volume = 0;
				analyser.getByteFrequencyData(frequencyData);
				ctx.clearRect(0, 0, baseWidth, baseHeight);
				for (var i = 0; i < meterNum; i++) {
					let f = frequencyData[i * step];
					let x = meterStart + i * meterSpace;
					let y = baseHeight - (baseHeight * f) / 0xff;
					volume += f;
					if (y > capYPositionArray[i])
						capYPositionArray[i] += capSpeed;
					else
						capYPositionArray[i] = y;
					if (capYPositionArray[i] > capMax)
						capYPositionArray[i] = capMax;
					ctx.fillStyle = capStyle;
					ctx.fillRect(x, capYPositionArray[i], meterWidth, capHeight);
					ctx.fillStyle = gradient;
					ctx.fillRect(x, y + capHeight, meterWidth, baseHeight);
				}
				base.volume = (volume * 1.0) / meterNum;
				AF = requestAnimationFrame(RenderFrame);
			}

			function SecToTim(secs) {
				var hoursDiv = secs / 3600, hours = Math.floor(hoursDiv), minutesDiv = secs % 3600 / 60, minutes = Math.floor(minutesDiv), seconds = Math.ceil(secs % 3600 % 60);
				if (seconds > 59) { seconds = 0; minutes = Math.ceil(minutesDiv); }
				if (minutes > 59) { minutes = 0; hours = Math.ceil(hoursDiv); }
				return (hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0' + hours + ':' : hours + ':') + (minutes.toString().length < 2 ? '0' + minutes : minutes) + ':' + (seconds.toString().length < 2 ? '0' + seconds : seconds);
			};

			this.UpdateVolume = function (e) {
				let p = (e.clientX - this.divVolumeOut[0].getBoundingClientRect().left) / this.divVolumeOut.width();
				this.SetVolume(p);
			}

			this.SetVolume = function (p) {
				if (p < 0)
					p = 0;
				if (p > 1)
					p = 1;
				this.audio.volume = p;
				this.divVolumeIn.width(p * 100 + '%');
				if (this.opt.onVolumechange)
					this.opt.onVolumechange.call(this, p);
			}

			AF = requestAnimationFrame(RenderFrame);
			this.SetVolume(this.opt.volume);
			if (this.opt.autoplay)
				this.audio.play();
		})

	}
})(jQuery);