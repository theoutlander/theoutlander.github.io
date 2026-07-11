/* Shared iOS silent-switch unlock.
   Every game here plays sound via raw WebAudio (oscillators/noise buffers, no <audio> tag).
   iOS categorizes that as "ambient" audio, which respects the hardware mute switch — flip it
   and all WebAudio output goes silent even though the AudioContext reports "running".
   Playing one real (near-silent) <audio> element on the same first gesture that unlocks the
   AudioContext shifts the page's whole audio session into "playback" category, which iOS lets
   ignore the mute switch. Call MayaIOSAudioUnlock.unlock() as the first line of each game's
   AudioContext-creation function — safe to call repeatedly, only plays once per page. */
(function () {
	'use strict';
	var unlocked = false;
	window.MayaIOSAudioUnlock = {
		unlock: function () {
			if (unlocked) return;
			unlocked = true;
			try {
				var el = document.createElement('audio');
				el.setAttribute('playsinline', '');
				el.volume = 0.01;
				el.src =
					'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==';
				el.play().catch(function () {});
			} catch (e) {}
		},
	};
})();
