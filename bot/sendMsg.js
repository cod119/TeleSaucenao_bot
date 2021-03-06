// 주의: bot.sendmessage의 text param에 markdown 기호 예컨대 [, ], (,), _, `가 온전하게 닫힌 형태로 안 들어가면 에러뜸;; 알아내느라고 2시간썼다;;
// 예외처리를 하기 위해 \를 붙여야하는데, 하나만 붙였더니 나중에 array.join하는 과정에서 없어지는 건지 다시 에러가 발생.
// \\ 처럼 두개를 붙여주니 실제 출력될때 \가 하나 붙은 채로 출력. 일단 하는 수 없는 듯.

var urlbase = require("../settings/settings.js").url;
var MESSAGE = require("../settings/settings.js").msg;
var idButtonName = require("../settings/settings.js").id_buttonName;
var idbaseArray = Object.keys(idButtonName);
var tools = require("../tools/tools.js");

var sendMsg = function(results, totalLength, bot, msg) {
  results = results || [];
  var chat_id = msg.from.id;
  var username = msg.from.username;
  var reply = msg.message_id;
  if (!results.length) {
    // console.log("Processing: nokori 0");

    // count user request and if it satisfies condition, print msg asking rating
    if (global.userCount.on) {
      var count = global.userCount[chat_id.toString()];
      if (count === undefined) {
        global.userCount[chat_id.toString()] = {};
        global.userCount[chat_id.toString()]["username"] = username;
        global.userCount[chat_id.toString()]["count"] = 0;
      }
      global.userCount[chat_id.toString()]["count"] += 1;

      count = global.userCount[chat_id.toString()]["count"];

      if ((count / 2) - Math.floor(count / 2) === 0) {
        bot.sendMessage(chat_id, MESSAGE.requestRating, {parse: "Markdown", preview: false});
      }
    }
    return;
  } else {
    // console.log("Processing: nokori ", results.length);
  }
  totalLength = totalLength || totalLength;
  var element = results[0];
  var header = element.header;
  var data = element.data;
  var data_keys = Object.keys(data);
  var textarray = [];
  var text = "";
  var buttons = [];
  var innerbuttons = [];
  var innerbuttonsContainer = [];
  var markup;
  var number = totalLength - results.length + 1;
  var buttonName, urlPrefix, id, url, urls, urls_keys;
  var restOfIds = tools.arraysInCommon(idbaseArray, Object.keys(data));


  for (var i = 0; i < data_keys.length; i++) {
    var key = data_keys[i];
    if (typeof data[key] === "string") {
      data[key] = data[key].replace(/\[/gi, "\\[");
        data[key] = data[key].replace(/\]/gi, "\\]");
        data[key] = data[key].replace(/\(/gi, "\\(");
        data[key] = data[key].replace(/\)/gi, "\\)");
        data[key] = data[key].replace(/\*/gi, "\\*");
        data[key] = data[key].replace(/\_/gi, "\\_");
        data[key] = data[key].replace(/\`/gi, "\\`");
    }
  }

  if (data["ext_urls"] && data["ext_urls"]["0"]) {
   // ext_urls가 있을 경우
    urls = data.ext_urls;
    urls_keys = Object.keys(urls);

    textarray = [
      number.toString() + "/" + totalLength.toString(), "|",
      "*Similarity:*", header.similarity + "%", "|",
      "*Title:*", data.title || "-", "|",
      "*by:*", data.member_name || data.creator || "-", "|",
      (data.eng_name) ? "*Eng_title:* " + data.eng_name + " |": "",
      (data.jp_name) ? "*Jp_title:* " + data.jp_name + " |": "",
      (data.source) ? "*Source:* " + data.source + " |": "",
      (data.part) ? "*Part:* " + data.part + " |": "",
      (data.year) ? "*Year:* " + data.year + " |": "",
      "[<Thumnail>](" + header.thumbnail + ")"
    ];
    text = textarray.join(" ");

    for (var j = 0; j < urls_keys.length; j++) {
      url = urls[urls_keys[j]];
      buttonName = "Open@" + url.split("/")[2];

      innerbuttonsContainer.push(
        bot.inlineButton(buttonName, {
          url: url
        })
      );
    }
    for (var i = 0; i < innerbuttonsContainer.length; i++) {
      if (innerbuttons.length < 2){
        innerbuttons.push(innerbuttonsContainer[i]);
      } else {
        var target = innerbuttons;
        innerbuttons = [];
        innerbuttons.push(innerbuttonsContainer[i]);
        buttons.push(target);
      }
      if (i === innerbuttonsContainer.length - 1) {
        buttons.push(innerbuttons);
      }
    }
 
  } else if (restOfIds.length) {
  // pixiv_id를 제외한 XXX_id 유형이 있는 경우,
  // settings/settings.js의 url property를 참조하여 지정된 id 항목을 추출
    textarray = [
      number.toString() + "/" + totalLength.toString(), "|",
      "*Similarity:*", header.similarity + "%", "|",
      "*Title:*", data.title || "-", "|",
      "*by:*", data.member_name || data.creator || "-", "|",
      (data.eng_name) ? "*Eng_title:* " + data.eng_name + " |": "",
      (data.jp_name) ? "*Jp_title:* " + data.jp_name + " |": "",
      (data.source) ? "*Source:* " + data.source + " |": "",
      (data.part) ? "*Part:* " + data.part + " |": "",
      (data.year) ? "*Year:* " + data.year + " |": "",
      "[<Thumnail>](" + header.thumbnail + ")"
    ];
    text = textarray.join(" ");

    for (var j = 0; j < restOfIds.length; j++) {
      buttonName = idButtonName[restOfIds[j]];
      urlPrefix = urlbase[restOfIds[j]];
      id = data[restOfIds[j]];

      innerbuttonsContainer.push(
        bot.inlineButton(buttonName, {
          url: urlPrefix + id
        })
      );
    }
    for (var i = 0; i < innerbuttonsContainer.length; i++) {
      if (innerbuttons.length < 2){
        innerbuttons.push(innerbuttonsContainer[i]);
      } else {
        var target = innerbuttons;
        innerbuttons = [];
        innerbuttons.push(innerbuttonsContainer[i]);
        buttons.push(target);
      }
      if (i === innerbuttonsContainer.length - 1) {
        buttons.push(innerbuttons);
      }
    }
  } else {
    textarray = [
      number.toString() + "/" + totalLength.toString(), "|",
      "*Similarity:*", header.similarity + "%", "|",
      "*Title:*", data.title || "-", "|",
      "*by:*", data.member_name || data.creator || "-", "|",
      (data.eng_name) ? "*Eng_title:* " + data.eng_name + " |": "",
      (data.jp_name) ? "*Jp_title:* " + data.jp_name + " |": "",
      (data.source) ? "*Source:* " + data.source + " |": "",
      (data.part) ? "*Part:* " + data.part + " |": "",
      (data.year) ? "*Year:* " + data.year + " |": "",
      "[<Thumnail>](" + header.thumbnail + ")"
    ];
    text = textarray.join(" ");
  }

  markup = bot.inlineKeyboard(buttons);

  return bot.sendMessage(chat_id, text, {reply: reply, markup: markup, parse: "Markdown"})
  .then(function() {
    if (global.debug) console.log('inner then');
    return sendMsg(results.slice(1), totalLength, bot, msg);
  });

};

module.exports = sendMsg;
