"use strict";

var defaultPlayer = "Kueche";

var actions = {
  "vol_up": function (player) { player.setVolume("+1"); return true; },
  "vol_down": function (player) { player.setVolume("-1"); return true; },
  "rev": function (player) { player.coordinator.previousTrack(); },
  "fwd": function (player) { player.coordinator.nextTrack(); },
  "play": function (player) { player.coordinator.play(); },
  "stop": function (player) { player.coordinator.pause(); }
};

var actionsFavorites = {
  "0": "0 ",
  "1": "1 ",
  "2": "2 ",
  "3": "3",
  "4": "4 ",
  "5": "5 ",
  "6": "6 ",
  "7": "7 ",
  "8": "8 ",
  "9": "9 ",
};

var actionsSwitchPlayer = {
  "red": "Wohnzimmer",
  "green": "Bad",
  "yellow": "Kueche"
};
// player = discovery.getPlayer("Wohnzimmer");

// presets for grouping
var presets = {
  "all": {"players": [
    { "roomName": "Wohnzimmer", "volume": 10 },
    { "roomName": "Bad", "volume": 10 },
    { "roomName": "Kueche", "volume": 10 }
  ]}};
// discovery.applyPreset(presets[buttonToPreset[keyCode]]);

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


var allowRepeat = false;

var net = require("net");
var socket = net.connect('/var/run/lirc/lircd');

socket.on("data", function (data) {
  var cols = data.toString().split(' ');
  var keyCode = cols[2];
  var repeat = cols[1];
  console.log(repeat, keyCode, allowRepeat);
  
  if (repeat != "00" && !allowRepeat) {
    return;
  }
  
  if (player)
  {
    var action = actions[keyCode];
    if (action) {
      allowRepeat = action(player);
      return;
    }
    
    var actionFavorite = actionsFavorites[keycode];
    if (actionFavorite) {
      player.replaceWithFavorite(actionFavorite, function() {
        player.play();
      });
      allowRepeat = false;
      return;
    }
  }
});
