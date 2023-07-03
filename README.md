# jsRapAudio

<div align="center" style="padding-top: 50px">
    <br>
    <br>
    <b><i>JQuery audio player plugin </i></b>
    <br>
    <br>
    <img src="https://img.shields.io/github/downloads/Thibor/jsRapAudio/total?color=critical&style=for-the-badge">
    <img src="https://img.shields.io/github/license/Thibor/jsRapAudio?color=blue&style=for-the-badge">
    <img src="https://img.shields.io/github/v/release/Thibor/jsRapAudio?color=blue&label=Latest%20release&style=for-the-badge">
    <img src="https://img.shields.io/github/last-commit/Thibor/jsRapAudio/?color=critical&style=for-the-badge">
	<img src="https://img.shields.io/github/commits-since/Thibor/jsRapAudio/latest?style=for-the-badge">
</div>

Try it out <a href="https://thibor.github.io/jsRapAudio/">here</a>.

More information about this can be found in this blog <a href="https://www.jqueryscript.net/other/Music-Player-Audio-Visualizer-jsRapAudio.html">article</a>.

### Settings

Option | Type | Default | Description
------ | ---- | ------- | -----------
autoplay | bool | false | Play after start
loop | bool | fale | Play in loop
volume | integer | 1.0 | Audio volume (range 0.0 .. 1.0)

### Events

Event | Params | Description
------ | ---- | -------
onLoadedmetadata | none | Fired when an audio file is loaded
onVolumechange | none | Fired when volume is changed
