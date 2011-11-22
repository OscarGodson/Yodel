#Yodel.js
##Cross Platform Browser Notifications Made Simple

Yodel.js is a cross platform browser notification library. Browser notifications don't get too much attention from developers because they're a pain in the ass to implement. Yodel takes care of this for you. It currently supports:

- Chrome with "``webkitNotifications``" (like Gmail, Google Calendar, etc)
- IE9 with notifications being displayed in your [jump list](http://blogs.msdn.com/b/thebeebs/archive/2010/09/16/how-to-add-ie9-beta-pinning-to-you-website.aspx), blink the icon and add a notification badge to the toolbar
- Firefox, Safari, IE<9 and every other browser will get a blinking title bar with the notification.

The library will support more browsers like Mobile Firefox soon as well.

##Quick Start

Yodel is super easy. There are three steps to notifications. One, create a new instance of `yodel()`, two you need to request permission to post a notification, then three, actually post the notification. _(jQuery is used for clean examples, but not required)_

```javascript
//Step 1: New yodel instance
var y = new yodel();

//Step 2: Ask permission (SEE NOTE BELOW CODE)
$('#request').bind('click',function(){
  y.askPermission();
});

//Step 3: Notify!
$('#notify-me').bind('click',function(){
  y.notify('Title',''the message','notification-img.png');
});
```

**Note:** When asking permission, you _must_ do it asynchronously via user interaction. For example, a button click. This is part of the notification spec. There are hacks like making the entire body clickable, but just calling `askPermission()` will not do anything.

**Demoing Note:** You can not run this through the `file:///` protocol. You'll need to use something like MAMP or upload it to your server.

##API

###Constructor
`yodel()`  
Creates a new yodel instance.

###Methods

`askPermission()`  
Asks permission from the user to display notifications. _Must_ do it asynchronously via user interaction. For example, a button click. It will return `0`, `1`, `2` depending on the user's choice. `0` is accepted, `1` is no action taken (like hitting cancel), and `2` is denied. If the browser doesn't require permission it'll automatically return `0`.

**Note:** If accepted or denied (`0` or `2`), the notification will no longer display for Chrome even if you call `askPermission()` again. After, the user will have to go into their preferences and change this setting from there.

`checkPermission()`  
Simply returns a boolean if you are able to display notifications. If the browser doesn't require permission, it will automatically return `true`

`notify(title, message, icon, url)`  
Notifies the user of a message. The only required fields are `title` and `message`. Icon will be used for browsers that support icons (Chrome, and IE9 if it's an .ico file). `url` is used for where you want the user to be redirected on click. This will default to the current page so when you click the corresponding tab will be focused. For URLs that aren't blank, Chrome will focus on the right tab, then load the new page if it's not blank and IE9 will open a new page.

**Note:** For IE9, until you `close()` the notifications, the notification list will keep growing. Unlike Chrome, it will not force old ones to close.

`on(event, callback)`  
`on()` is an event handler. You can give it an event of: `open`, `close`, `error`, or `click` (more on this in the events section below), and a callback to trigger when the event has fired.

`close(timer)`  
Close will close or cancel the notification. If you pass it a timer it will stop after that long. Useful if you want to chain `notify().close(5000)`. If no timer is set it will close them immediately.

###Events

In the `on()` method you can use these events:

`open`  
Will fire once the notification is opened or being displayed.

`close`  
Will run when the notification is closed via user interaction or programmatically.

`click`
This fires when the notification is clicked. It also auto-handles displaying the corresponding tab/window again as well. This will only work for browser notifications in Chrome currently.

`error`
This happens if there is an error with the notification handler. This event will only fire if the browser supports browser notifications per spec (in other words, only Chrome right now).


##What's Next
- Support for mobile browsers such as Firefox Mobile
- Support for replacement notification IDs (so they don't stack up)
- More research on `createPopup()` for IE6-8. (I had bug with it, [any ideas](http://stackoverflow.com/questions/8217412/unspecified-error-in-internet-explorer-when-page-is-blurred)?)
- Support for an array of icons so you can support multiple file formats for different browsers (.png, .ico, etc.)
- Faux browser permissions. Create a permission requester for browsers that don't support it and save a cookie of their choice.