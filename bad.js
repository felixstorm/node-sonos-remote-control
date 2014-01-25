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

var actionsFavorites = {
  "KEY_KP0": "0 ",
  "KEY_KP1": "1 ",
  "KEY_KP2": "2 ",
  "KEY_KP3": "3",
  "KEY_KP4": "4 ",
  "KEY_KP5": "5 ",
  "KEY_KP6": "6 ",
  "KEY_KP7": "7 ",
  "KEY_KP8": "8 ",
  "KEY_KP9": "9 ",
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


var SonosDiscovery = require('sonos-discovery');
var discovery = new SonosDiscovery();

var player = null;
discovery.on('topology-change', function () {
  if (player == null) {
    player = discovery.getPlayer(defaultPlayer);
  }
});


var LinuxKeyboard = require('./linux-keyboard.js');
var keyboardKeys = new LinuxKeyboard('event2');
var keyboardMedia = new LinuxKeyboard('event3');

keyboardKeys.on('keypress', processKeyEvent);
keyboardMedia.on('keypress', processKeyEvent);

function processKeyEvent(event) {
  console.log(event.keyCode + " " + event.keyId);

  var action = actions[event.keyId] || actions[event.keyCode];
  if (player && action) {
    action(player);
  }

  var actionFavorite = actionsFavorites[line];
  if (player && actionFavorite) {
    player.replaceWithFavorite(actionFavorite, function() {
      player.play();
    });
  }
}
