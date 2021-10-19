// ==UserScript==
// @name         BBC iPlayer
// @description  Play media in external player.
// @version      1.0.1
// @match        *://bbc.co.uk/iplayer/*
// @match        *://*.bbc.co.uk/iplayer/*
// @icon         https://iplayer-web.files.bbci.co.uk/page-builder/44.2.1/img/icons/favicon.ico
// @run-at       document_end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-BBC-iPlayer/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-BBC-iPlayer/issues
// @downloadURL  https://github.com/warren-bank/crx-BBC-iPlayer/raw/webmonkey-userscript/es5/webmonkey-userscript/BBC-iPlayer.user.js
// @updateURL    https://github.com/warren-bank/crx-BBC-iPlayer/raw/webmonkey-userscript/es5/webmonkey-userscript/BBC-iPlayer.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var user_options = {
  "webmonkey": {
    "post_intent_redirect_to_url":  null
  },
  "greasemonkey": {
    "redirect_to_webcast_reloaded": true,
    "force_http":                   true,
    "force_https":                  false
  }
}

var strings = {
  "buttons": {
    "start_media":                 "Start Media",
    "show_details":                "Show Details"
  }
}

var constants = {
  "dom_classes": {
    "div_media_summary":           "media_summary",
    "div_webcast_icons":           "icons-container",
    "div_media_buttons":           "media_buttons",
    "btn_start_media":             "start_media",
    "btn_show_details":            "show_details",
    "div_media_details":           "media_details"
  },
  "img_urls": {
    "base_webcast_reloaded_icons": "https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/"
  },
  "jsonp_callback":                "JS_callbacks0",
  "transfer_format": {
    "hls":                         "application/x-mpegurl",
    "dash":                        "application/dash+xml",
    "mp4":                         "video/mp4"
  }
}

// ----------------------------------------------------------------------------- helpers

var make_element = function(elementName, html) {
  var el = unsafeWindow.document.createElement(elementName)

  if (html)
    el.innerHTML = html

  return el
}

// ----------------------------------------------------------------------------- URL links to tools on Webcast Reloaded website

var get_webcast_reloaded_url = function(video_url, vtt_url, referer_url, force_http, force_https) {
  force_http  = (typeof force_http  === 'boolean') ? force_http  : user_options.greasemonkey.force_http
  force_https = (typeof force_https === 'boolean') ? force_https : user_options.greasemonkey.force_https

  var encoded_video_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

  encoded_video_url     = encodeURIComponent(encodeURIComponent(btoa(video_url)))
  encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
  referer_url           = referer_url ? referer_url : unsafeWindow.location.href
  encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

  webcast_reloaded_base = {
    "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
    "http":  "http://webcast-reloaded.surge.sh/index.html"
  }

  webcast_reloaded_base = (force_http)
                            ? webcast_reloaded_base.http
                            : (force_https)
                               ? webcast_reloaded_base.https
                               : (video_url.toLowerCase().indexOf('http:') === 0)
                                  ? webcast_reloaded_base.http
                                  : webcast_reloaded_base.https

  webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_video_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
  return webcast_reloaded_url
}

// -----------------------------------------------------------------------------

var get_webcast_reloaded_url_chromecast_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ null, /* force_https= */ null).replace('/index.html', '/chromecast_sender.html')
}

var get_webcast_reloaded_url_airplay_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/airplay_sender.es5.html')
}

var get_webcast_reloaded_url_proxy = function(hls_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(hls_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/proxy.html')
}

var make_webcast_reloaded_div = function(video_url, vtt_url, referer_url) {
  var webcast_reloaded_urls = {
//  "index":             get_webcast_reloaded_url(                  video_url, vtt_url, referer_url),
    "chromecast_sender": get_webcast_reloaded_url_chromecast_sender(video_url, vtt_url, referer_url),
    "airplay_sender":    get_webcast_reloaded_url_airplay_sender(   video_url, vtt_url, referer_url),
    "proxy":             get_webcast_reloaded_url_proxy(            video_url, vtt_url, referer_url)
  }

  var div = make_element('div')

  var html = [
    '<a target="_blank" class="chromecast" href="' + webcast_reloaded_urls.chromecast_sender + '" title="Chromecast Sender"><img src="'       + constants.img_urls.base_webcast_reloaded_icons + 'chromecast.png"></a>',
    '<a target="_blank" class="airplay" href="'    + webcast_reloaded_urls.airplay_sender    + '" title="ExoAirPlayer Sender"><img src="'     + constants.img_urls.base_webcast_reloaded_icons + 'airplay.png"></a>',
    '<a target="_blank" class="proxy" href="'      + webcast_reloaded_urls.proxy             + '" title="HLS-Proxy Configuration"><img src="' + constants.img_urls.base_webcast_reloaded_icons + 'proxy.png"></a>',
    '<a target="_blank" class="video-link" href="' + video_url                               + '" title="direct link to video"><img src="'    + constants.img_urls.base_webcast_reloaded_icons + 'video_link.png"></a>'
  ]

  div.setAttribute('class', constants.dom_classes.div_webcast_icons)
  div.innerHTML = html.join("\n")

  return div
}

var insert_webcast_reloaded_div = function(block_element, video_url, vtt_url, referer_url) {
  var webcast_reloaded_div = make_webcast_reloaded_div(video_url, vtt_url, referer_url)

  if (block_element.childNodes.length)
    block_element.insertBefore(webcast_reloaded_div, block_element.childNodes[0])
  else
    block_element.appendChild(webcast_reloaded_div)
}

// ----------------------------------------------------------------------------- URL redirect

var redirect_to_url = function(url) {
  if (!url) return

  if (typeof GM_loadUrl === 'function') {
    if (typeof GM_resolveUrl === 'function')
      url = GM_resolveUrl(url, unsafeWindow.location.href) || url

    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)
  }
  else {
    try {
      unsafeWindow.top.location = url
    }
    catch(e) {
      unsafeWindow.window.location = url
    }
  }
}

var process_webmonkey_post_intent_redirect_to_url = function() {
  var url = null

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'string')
    url = user_options.webmonkey.post_intent_redirect_to_url

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'function')
    url = user_options.webmonkey.post_intent_redirect_to_url()

  if (typeof url === 'string')
    redirect_to_url(url)
}

var process_video_url = function(video_url, video_type, vtt_url, referer_url) {
  if (!referer_url)
    referer_url = unsafeWindow.location.href

  if (typeof GM_startIntent === 'function') {
    // running in Android-WebMonkey: open Intent chooser

    var args = [
      /* action = */ 'android.intent.action.VIEW',
      /* data   = */ video_url,
      /* type   = */ video_type
    ]

    // extras:
    if (vtt_url) {
      args.push('textUrl')
      args.push(vtt_url)
    }
    if (referer_url) {
      args.push('referUrl')
      args.push(referer_url)
    }

    GM_startIntent.apply(this, args)
    process_webmonkey_post_intent_redirect_to_url()
    return true
  }
  else if (user_options.greasemonkey.redirect_to_webcast_reloaded) {
    // running in standard web browser: redirect URL to top-level tool on Webcast Reloaded website

    redirect_to_url(get_webcast_reloaded_url(video_url, vtt_url, referer_url))
    return true
  }
  else {
    return false
  }
}

// ----------------------------------------------------------------------------- collect media formats

var sort_media_formats = function(formats) {
  var compare_ints_asc = function(i1, i2) {
    return (i1 < i2)
      ? -1
      : (i1 > i2)
        ? 1
        : 0
  }

  var compare_ints_desc = function(i1, i2) {
    return compare_ints_asc(i2, i1)
  }

  var sort_comparison = function(f1, f2) {
    var i1, i2, result

    i1 = parseInt(f1.priority, 10)
    i2 = parseInt(f2.priority, 10)
    result = compare_ints_desc(i1, i2)
    if (result !== 0) return result

    i1 = (f1.transferFormat === 'hls') ? 1 : 2
    i2 = (f2.transferFormat === 'hls') ? 1 : 2
    result = compare_ints_asc(i1, i2)
    if (result !== 0) return result

    i1 = (f1.protocol === 'https') ? 1 : 2
    i2 = (f2.protocol === 'https') ? 1 : 2
    result = compare_ints_asc(i1, i2)
    if (result !== 0) return result

    return 0
  }

  formats.sort(sort_comparison)
}

var process_jsonp_data = function(data) {
  var formats = []
  var media, format

  if (data && ('object' === (typeof data)) && Array.isArray(data.media) && data.media.length) {
    for (var i=0; i < data.media.length; i++) {
      media = data.media[i]

      if (media && ('object' === (typeof media)) && (media.kind === 'video') && Array.isArray(media.connection) && media.connection.length) {
        for (var i2=0; i2 < media.connection.length; i2++) {
          format = media.connection[i2]

          if (format && ('object' === (typeof format)) && format.href && format.transferFormat && constants.transfer_format[format.transferFormat]) {
            formats.push(format)
          }
        }
      }
    }
  }

  if (formats.length)
    sort_media_formats(formats)

  return formats
}

var get_media_formats = function(callback) {
  if (
       !unsafeWindow.__IPLAYER_REDUX_STATE__
    || ('object' !== (typeof unsafeWindow.__IPLAYER_REDUX_STATE__))
    || !Array.isArray(unsafeWindow.__IPLAYER_REDUX_STATE__.versions)
    || !unsafeWindow.__IPLAYER_REDUX_STATE__.versions.length
    || ('object' !== (typeof unsafeWindow.__IPLAYER_REDUX_STATE__.versions[0]))
    || !unsafeWindow.__IPLAYER_REDUX_STATE__.versions[0].id
  ) return

  var video_id  = unsafeWindow.__IPLAYER_REDUX_STATE__.versions[0].id
  var jsonp_url = 'https://open.live.bbc.co.uk/mediaselector/6/select/version/2.0/mediaset/pc/vpid/' + video_id + '/format/json/jsfunc/' + constants.jsonp_callback

  unsafeWindow.window[constants.jsonp_callback] = function(data) {
    var formats = process_jsonp_data(data)

    if (formats && Array.isArray(formats) && formats.length)
      callback(formats)
  }

  var script = make_element('script')
  script.setAttribute('src', jsonp_url)
  unsafeWindow.document.body.appendChild(script)
}

// ----------------------------------------------------------------------------- display results

var format_subset_to_tablerows = function(format) {
  var keys_whitelist = ["protocol", "supplier", "transferFormat"]
  var keys = Object.keys(format)
  var rows = []
  var key

  for (var i=0; i < keys.length; i++) {
    key = keys[i]

    if (keys_whitelist.indexOf(key) >= 0)
      rows.push([key, format[key]])
  }

  return rows.length
    ? rows.map(function(row) {return '<tr><td>' + row[0] + ':</td><td>' + row[1] + '</td></tr>'}).join("\n")
    : ''
}

var format_to_listitem = function(format) {
  var inner_html = [
    '<div class="' + constants.dom_classes.div_media_summary + '">',
      '<table>',
        format_subset_to_tablerows(format),
      '</table>',
    '</div>',
    '<div class="' + constants.dom_classes.div_media_buttons + '">',
      '<button class="' + constants.dom_classes.btn_start_media  + '">' + strings.buttons.start_media  + '</button>',
      '<button class="' + constants.dom_classes.btn_show_details + '">' + strings.buttons.show_details + '</button>',
    '</div>',
    '<div class="' + constants.dom_classes.div_media_details + '" style="display:none">',
      '<pre>' + JSON.stringify(format, null, 2) + '</pre>',
    '</div>'
  ]

  return make_element('li', inner_html.join("\n"))
}

var format_to_mimetype = function(format) {
  var key = format.transferFormat
  var val = constants.transfer_format[key]

  return val ? val : null
}

var attach_button_event_handlers_to_listitem = function(li, format) {
  var button_start_media  = li.querySelector('button.' + constants.dom_classes.btn_start_media)
  var button_show_details = li.querySelector('button.' + constants.dom_classes.btn_show_details)
  var div_media_details   = li.querySelector('div.'    + constants.dom_classes.div_media_details)

  button_start_media.addEventListener('click', function() {
    var video_url   = format.href
    var video_type  = format_to_mimetype(format)
    var vtt_url     = null
    var referer_url = unsafeWindow.location.href

    process_video_url(video_url, video_type, vtt_url, referer_url)
  })

  button_show_details.addEventListener('click', function() {
    div_media_details.style.display = (div_media_details.style.display === 'none') ? 'block' : 'none'
  })
}

var insert_webcast_reloaded_div_to_listitem = function(li, format) {
  var block_element = li.querySelector('div.' + constants.dom_classes.div_media_summary)
  var video_url     = format.href
  var vtt_url       = null
  var referer_url   = unsafeWindow.location.href

  insert_webcast_reloaded_div(block_element, video_url, vtt_url, referer_url)
}

var rewrite_page_dom = function(formats) {
  var head  = unsafeWindow.document.getElementsByTagName('head')[0]
  var body  = unsafeWindow.document.body
  var title = unsafeWindow.document.title

  var html = {
    "head": [
      '<style>',

      'body {',
      '  background-color: #fff;',
      '}',

      'body > div > h2 {',
      '  text-align: center;',
      '  margin: 0.5em 0;',
      '}',

      'body > div > ul > li > div.media_summary {',
      '}',
      'body > div > ul > li > div.media_summary > table {',
      '  border-collapse: collapse;',
      '}',
      'body > div > ul > li > div.media_summary > table td {',
      '  border: 1px solid #999;',
      '  padding: 0.5em;',
      '}',
      'body > div > ul > li > div.media_summary > div.icons-container {',
      '}',

      'body > div > ul > li > div.media_buttons {',
      '}',
      'body > div > ul > li > div.media_buttons > button.start_media {',
      '}',
      'body > div > ul > li > div.media_buttons > button.show_details {',
      '  margin-left: 0.5em;',
      '}',

      'body > div > ul > li > div.media_details {',
      '}',
      'body > div > ul > li > div.media_details > pre {',
      '  background-color: #eee;',
      '  padding: 0.5em;',
      '}',

      // --------------------------------------------------- CSS: reset

      'h2 {',
      '  font-size: 24px;',
      '}',

      'body, td {',
      '  font-size: 18px;',
      '}',

      'button {',
      '  font-size: 16px;',
      '}',

      'pre {',
      '  font-size: 14px;',
      '}',

      // --------------------------------------------------- CSS: separation between media formats

      'body > div > ul {',
      '  list-style: none;',
      '  margin: 0;',
      '  padding: 0;',
      '}',

      'body > div > ul > li {',
      '  list-style: none;',
      '  margin-top: 0.5em;',
      '  border-top: 1px solid #999;',
      '  padding-top: 0.5em;',
      '}',

      'body > div > ul > li > div {',
      '  margin-top: 0.5em;',
      '}',

      // --------------------------------------------------- CSS: links to tools on Webcast Reloaded website

      'body > div > ul > li > div.media_summary > div.icons-container {',
      '  display: block;',
      '  position: relative;',
      '  z-index: 1;',
      '  float: right;',
      '  margin: 0.5em;',
      '  width: 60px;',
      '  height: 60px;',
      '  max-height: 60px;',
      '  vertical-align: top;',
      '  background-color: #d7ecf5;',
      '  border: 1px solid #000;',
      '  border-radius: 14px;',
      '}',

      'body > div > ul > li > div.media_summary > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.chromecast > img,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay > img,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.proxy,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.proxy > img,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.video-link,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.video-link > img {',
      '  display: block;',
      '  width: 25px;',
      '  height: 25px;',
      '}',

      'body > div > ul > li > div.media_summary > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.proxy,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.video-link {',
      '  position: absolute;',
      '  z-index: 1;',
      '  text-decoration: none;',
      '}',

      'body > div > ul > li > div.media_summary > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay {',
      '  top: 0;',
      '}',
      'body > div > ul > li > div.media_summary > div.icons-container > a.proxy,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.video-link {',
      '  bottom: 0;',
      '}',

      'body > div > ul > li > div.media_summary > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.proxy {',
      '  left: 0;',
      '}',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay,',
      'body > div > ul > li > div.media_summary > div.icons-container > a.video-link {',
      '  right: 0;',
      '}',
      'body > div > ul > li > div.media_summary > div.icons-container > a.airplay + a.video-link {',
      '  right: 17px; /* (60 - 25)/2 to center when there is no proxy icon */',
      '}',

      // ---------------------------------------------------

      '</style>'
    ],
    "body": [
      '<div>',
        '<ul>',
        '</ul>',
      '</div>'
    ]
  }

  if (title) {
    html.head.unshift('<title>'   + title + '</title>')
    html.body.unshift('<div><h2>' + title + '</h2></div>')
  }

  head.innerHTML = '' + html.head.join("\n")
  body.innerHTML = '' + html.body.join("\n")

  var ul = body.querySelector('ul')
  if (!ul) return

  var format, li
  for (var i=0; i < formats.length; i++) {
    format = formats[i]
    li     = format_to_listitem(format)

    ul.appendChild(li)
    attach_button_event_handlers_to_listitem(li, format)
    insert_webcast_reloaded_div_to_listitem(li, format)
  }
}

// ----------------------------------------------------------------------------- bootstrap

var init = function() {
  get_media_formats(function(formats) {
    if (!formats) return

    rewrite_page_dom(formats)
  })
}

init()

// -----------------------------------------------------------------------------
