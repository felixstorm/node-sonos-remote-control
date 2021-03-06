"use strict";

var defaultTargetPlayerName = "Bad";

var actions = {
    "KEY_VOLUMEUP": function (player) { player.setVolume("+1"); return true; },
    "KEY_VOLUMEDOWN": function (player) { player.setVolume("-1"); return true; },
    "165": function (player) { player.coordinator.previousTrack(); },
    "163": function (player) { player.coordinator.nextTrack(); },
    "164": function (player) { player.coordinator.play(); },
    "166": function (player) { player.coordinator.pause(); },
    "172": function (player) { player.coordinator.shuffle(!player.coordinator.currentPlayMode.shuffle); }
};

var actionsFavorites = {
    "KEY_KP0": "0 ",
    "KEY_KP1": "1 ",
    "KEY_KP2": "2 ",
    "KEY_KP3": "3 ",
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
// targetPlayer = discovery.getPlayer("Wohnzimmer");

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

var targetPlayer = null;
discovery.on('topology-change', function () {
    if (targetPlayer == null) {
        targetPlayer = discovery.getPlayer(defaultTargetPlayerName);
    }
});


var LinuxKeyboard = require('./linux-keyboard.js');
var keyboardKeys = new LinuxKeyboard('event2');
var keyboardMedia = new LinuxKeyboard('event3');

keyboardKeys.on('keypress', processKeyEvent);
keyboardMedia.on('keypress', processKeyEvent);

function processKeyEvent(event) {
    console.log(event.keyCode + " " + event.keyId);

    if (targetPlayer)
    {
        var action = actions[event.keyId] || actions[event.keyCode];
        if (action) {
            action(targetPlayer);
            return;
        }
        
        var actionFavorite = actionsFavorites[event.keyId] || actionsFavorites[event.keyCode];
        if (actionFavorite) {
            targetPlayer.coordinator.replaceWithFavorite(actionFavorite, function(success) {
                if (success) {
                    targetPlayer.coordinator.play();
                }
            });
            return;
        }
    }
}
