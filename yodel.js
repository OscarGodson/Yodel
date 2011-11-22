/**
 * Copyright (c) <year> <copyright holders>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(window, undefined){
  
  //Figure out what API to use for the rest of the script
  var _notificationApi = 'none';

  try{ //IE9 requires this to be in a try/catch (wtf?!)
    if (window.external.msIsSiteMode()) {
      _notificationApi = 'msie9';
      window.external.msSiteModeCreateJumplist('Notifications');
    } 
  }
  catch(e){
    if(window.webkitNotifications){
      _notificationApi = 'webkit';
    } 
  }

  //Save it here so that it is in fact the original title
  var _originalTitle = document.title;
  
  //Startup yodel
  function yodel(){
    return this;
  }

  /**
   * Asks the user for permission to display notifications. Not required for all browsers.
   * Note: This MUST be called via a user event, such as a click, for browsers that support notifications!
   * PERMISSION_ALLOWED (0) [If user accepts]
   * PERMISSION_NOT_ALLOWED (1) [If the user takes no action or hits cancel]
   * PERMISSION_DENIED (2) [If the user denies]
   * @return {object}
   */
  yodel.prototype.askPermission = function(){
    switch(_notificationApi){
      case 'webkit':
        return webkitNotifications.requestPermission();
      default:
        //Permission not needed
        return 0;
    }
    return this;
  };
  
  /**
   * Checks the permission of the notifications and returns true or false if it's able to display notifications
   * @return {boolean}
   */
  yodel.prototype.checkPermission = function(){
    switch(_notificationApi){
      case 'webkit':
        if(webkitNotifications.checkPermission() === 0){
          return true;
        }
        else{
          return false;
        }
        break;
      default:
        //There are no permissions
        return true;
    }
    return this;
  };

  /**
   * Will display the notification (and behind the scenes sets up links for events to it)
   * @param  {string} title the title of notification
   * @param  {string} message the message to display in the notification
   * @param  {string} icon a path to an image to be used as an icon
   * @return {object}
   */
  yodel.prototype.notify = function(title,message,icon,url){
    title    = title   || '';
    message  = message || '';
    icon     = icon    || '';
    url      = url     || '';
    this.url = url;
    var self = this;
    switch(_notificationApi){
      case 'webkit':
        self.notification           = webkitNotifications.createNotification(icon,title,message);
        self.notification.ondisplay = function(){ self.onopen();  };
        self.notification.onclose   = function(){ self.onclose(); };
        self.notification.onerror   = function(){ self.onerror(); };
        self.notification.onclick   = function(){ self.onclick(); };
        //this.replaceId = this.notification.replaceId(1);
        this.notification.show();
        break;
      case 'msie9':
        window.external.msSiteModeActivate();
        window.external.msSiteModeAddJumpListItem(message, this.url, icon);
        window.external.msSiteModeShowJumpList();
        window.external.msSiteModeSetIconOverlay(icon, title);
        self.onopen();
        break;
      default:
        //If all else fails, use the title bar
        var _messageTitle       = message
        ,   _toggleCounter      =  0;
        
        self.originalTitle = _originalTitle;
        
        document.title = _messageTitle;
        
        self.titleTimer = window.setInterval(function(){
          if(_toggleCounter === 0){
            document.title = self.originalTitle;
            _toggleCounter = 1;
          }
          else{
            document.title = _messageTitle;
            _toggleCounter = 0;
          }
        },2500);

        self.onopen();
    }
    return this;
  };
  
  /**
   * Used to bind events to the notification
   * @param  {string} event the event you want to bind to
   * @param  {function} callback what you want to happen once the event fires
   * @return {object}
   */
  yodel.prototype.on = function(event,callback){
    switch(event){
      case 'open':
        this.onopen  = function(){ callback.call(this); };
        break;
      case 'close':
        this.onclose = function(){ callback.call(this); };
        break;
      case 'error': //This event may not fire depending on the notification API
        this.onerror = function(){ callback.call(this); };
        break;
      case 'click': //This event may not fire depending on the notification API
        this.onclick = function(){
          callback.call(this);
          window.focus();
          if(this.url !== ''){
            window.location = this.url;
          } 
      };
    }
    return this;
  };
  
  /**
   * Closes the notification. If notification isn't a popup, will stop the blinking.
   * @param  {int} timer How long in milliseconds you want to wait before closing. If null, will close immeditaly. If 0, will never close.
   * @param  {function} callback what do you want to happen once it's closed
   * @return {object}
   */
  yodel.prototype.close = function(timer){
    //Need a check or else 0 will be seen as "false" and then will default to 5000
    var self = this;
    switch(_notificationApi){
      case 'webkit':
        theNotification = this.notification;
        if(timer && timer !== 0){
          setTimeout(function(){
            self.notification.cancel();
          },timer);
        }
        else{
          self.notification.cancel();
        }
        break;
      case 'msie9':
        var _resetJumpList = function(){
          window.external.msSiteModeClearIconOverlay();
          window.external.msSiteModeClearJumpList();
          self.onclose();
        }
        if(timer && timer !== 0){
          setTimeout(function(){
            _resetJumpList();
          },timer);
        }
        else{
          _resetJumpList();
        }
        break;
      default:
        var _resetTitleBar = function(){
          clearInterval(self.titleTimer);
          document.title = self.originalTitle;
          self.onclose();
        };
        if(timer && timer !== 0){
          setTimeout(function(){
            _resetTitleBar();
          },timer);
        }
        else{
          _resetTitleBar();
        }
    }
    return this;
  };
  
  window.yodel = yodel;
})(window);