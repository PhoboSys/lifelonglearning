"use strict";

module.exports = {
  loadOlderTweets: `
  document.querySelector('.try-again-after-whale').click();
  document.querySelector('.hidden-replies-container').scrollIntoView();
  `,
  loadNewerTweets: "var el = document.querySelector('.new-tweets-bar.js-new-tweets-bar'); el && el.click();",
  cleanUpTwitterPage: `
    var elements = document.querySelectorAll('.js-stream-item.stream-item.stream-item');
    if(elements.length > 50) {
      var toRemove = Array.prototype.slice.call(elements, 0, elements.length*0.6);
      window.removeElements(toRemove);
    }
  `,
  countAjax: "return window.jQuery.active;",
  getUserAgent: "return navigator.userAgent;",
  preparePage: `
    //collecting js errors
    document.body.setAttribute("JSError", "");
    window.onerror = function(msg) {
      var errors = document.body.getAttribute("JSError");
      errors += "| " + msg + " |";
      document.body.setAttribute("JSError", errors);
    }
  `,
  getUser: `
  return (function getUser() {
    var user = {
      "user_image": _getAttr(".ProfileAvatar-image", "src"),
      "user_id": _getAttrInt(".ProfileNav[data-user-id]", "data-user-id"),
      "user_name": _getText(".ProfileHeaderCard-screenname"),
      "user_fullname": _getText(".ProfileHeaderCard-name .ProfileHeaderCard-nameLink"),
      "user_bio": _getText(".ProfileHeaderCard-bio"),
      "user_join_date": _getAttrDate(".ProfileHeaderCard-joinDateText", "title"),
      "user_link": _getText(".ProfileHeaderCard-url"),
      "user_place": _getText(".ProfileHeaderCard-locationText"),
      "user_tweets_count": _getAttrInt(".ProfileNav-item--tweets .ProfileNav-stat", "title"),
      "user_following_count": _getAttrInt(".ProfileNav-item--following .ProfileNav-stat", "title"),
      "user_followers_count": _getAttrInt(".ProfileNav-item--followers .ProfileNav-stat", "title"),
      "user_likes_count": _getAttrInt(".ProfileNav-item--favorites .ProfileNav-stat", "title"),
      "user_lists_count": _getAttrInt(".ProfileNav-item--lists .ProfileNav-stat", "title"),
      "verified": _isExists(".ProfileHeaderCard-name .Icon--verified")
    };
    return user;

    function _getAttrDate(selector, attr) {
      return new Date(_getAttr(selector, attr).replace("-", "")).toString();
    }
    function _getAttrInt(selector, attr) {
      return parseInt(_getAttr(selector, attr).replace(",", "")) || 0;
    }
    function _getAttr(selector, attr) {
      var value = "";
      var el = document.querySelector(selector);
      if (el) {
        var val = el.getAttribute(attr);
        if (val) {
          value = val;
        }
      }
      return value.trim();
    }
    function _isExists(selector) {
      return !!document.querySelector(selector);
    }
    function _getText(selector) {
      var value = "";
      var el = document.querySelector(selector);
      if (el) {
        var val = el.innerText;
        if (val) {
          value = val;
        }
      }
      return value.trim();
    }
  })()
  `,
  prepareTwitterPage: `
    $(function() {
      //init observer
      window.removeElements = function(elements) {
        document.body.scrollTop = 0;
        elements.forEach(function(e) {
          $("*", e).add([e]).each(function(){
            $.event.remove(this);
            $.removeData(this);
          });
          if (e.parentNode)
            e.parentNode.removeChild(e);
        });
      }

      //init observer
      var feed = document.querySelector('.stream-items.js-navigable-stream');
      var observer = new MutationObserver(function() {
        var toRemove = document.querySelectorAll('div.content .js-tweet-text-container~div:not(.stream-item-footer)');
        window.removeElements(toRemove);
      });
      observer.observe(feed, { childList: true });
    });
  `
};
