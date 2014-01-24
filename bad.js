"use strict";

var defaultPlayer = "Bad";

var actions = {
  "KEY_VOLUMEUP": function (player) { player.setVolume("+1"); return true; },
  "KEY_VOLUMEDOWN": function (player) { player.setVolume("-1"); return true; },
  "165": function (player) { player.coordinator.previousTrack(); },
  "163": function (player) { player.coordinator.nextTrack(); },
  "164": function (player) { player.coordinator.play(); },
  "166": function (player) { player.coordinator.pause(); }
};

var actionsSwitchPlayer = {
  "KEY_T": "Wohnzimmer",
  "KEY_M": "Bad",
  "KEY_I": "Kueche"
};
// player = discovery.getPlayer("Wohnzimmer");

// presets for grouping
var presets = {
  "all": {"players": [
    { "roomName": "Wohnzimmer", "volume": 10 },
    { "roomName": "Bad", "volume": 10 },
    { "roomName": "Kueche", "volume": 10 }
  ]}};

// this maps keycodes to predefined presets
var buttonToPreset = {
  "1a": "all",
  "2a": "tv"
};


var net = require("net");

var SonosDiscovery = require('sonos-discovery');
var discovery = new SonosDiscovery();

var Keyboard = require('./keyboard.js');
var keyboardKeys = new Keyboard('event2');
var keyboardMedia = new Keyboard('event3');

var player = null;
discovery.on('topology-change', function () {
  if (player == null) {
    player = discovery.getPlayer(defaultPlayer);
  }
});

keyboardKeys.on('keypress', processKeyEvent);
keyboardMedia.on('keypress', processKeyEvent);

function processKeyEvent(event) {
  console.log(event.keyCode + " " + event.keyId);
  var action = actions[event.keyId] || actions[event.keyCode];
  if (player && action) {
    action(player);
  }
}

/*
var allowRepeat;

socket.on("data", function (data) {
  var cols = data.toString().split(' ');
  var keyCode = cols[2];
  var repeat = cols[1];
  console.log(repeat, keyCode);
  allowRepeat = repeat == "00" ? true : allowRepeat;

  console.log(" before action ", allowRepeat)
  
  if (allowRepeat && player && actions[keyCode]) {
    allowRepeat = actions[keyCode](player);
  } else if (allowRepeat && presets[buttonToPreset[keyCode]]) {
    discovery.applyPreset(presets[buttonToPreset[keyCode]]);
    allowRepeat = false;
  }

  console.log("after action", allowRepeat);
  
});
*/
