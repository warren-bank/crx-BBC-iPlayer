### [BBC iPlayer](https://github.com/warren-bank/crx-BBC-iPlayer/tree/webmonkey-userscript/es5)

[Userscript](https://github.com/warren-bank/crx-BBC-iPlayer/raw/webmonkey-userscript/es5/webmonkey-userscript/BBC-iPlayer.user.js) for [www.bbc.co.uk/iplayer](https://www.bbc.co.uk/iplayer) to run in both:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* on a page for a video:
  - replace the page's content with a list of all available media formats
  - for each available media format, display:
    * a brief summary of its attributes
    * _Start Media_ button to transfer the chosen media to an external player
    * _Show Details_ button to expand a block of hidden text that contains all available technical details about the media format
    * a grouping of icons to transfer the chosen media to various tools on the [Webcast-Reloaded](https://github.com/warren-bank/crx-webcast-reloaded) external [website](https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html)
      - mainly for use with:
        * _Google Chromecast_
        * [_ExoAirPlayer_](https://github.com/warren-bank/Android-ExoPlayer-AirPlay-Receiver)
        * [_HLS-Proxy_](https://github.com/warren-bank/HLS-Proxy)

#### Notes:

* to access the data API endoint and video stream hosts:
  - a geo-fence requires that requests originate from an IP within the UK
  - login is _not_ required
  - _Referer_ request header is _not_ required

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
