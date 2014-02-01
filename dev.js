"use strict";

var defaultTargetPlayerName = "Living Room";
var localAmpPlayerName = "Living Room";
var localAmpOffTimeoutSecs = 10;


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


process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(line) {
    line = line.trim();
    //console.log('data: ' + line);
    
    if (targetPlayer)
    {
        var action = actions[line];
        if (action) {
            action(targetPlayer);
            return;
        }
        
        var actionFavorite = actionsFavorites[line];
        if (actionFavorite) {
            targetPlayer.replaceWithFavorite(actionFavorite, function(success) {
                if (success) {
                    targetPlayer.play();
                }
            });
            return;
        }
    }
});


var isLocalAmpOn = false;
var localAmpOffTimeoutId = null;
discovery.on('transport-state', function (data) { 
    if (data.roomName != localAmpPlayerName)
        return;
    
    //console.log('transport-state: ', data);
    if (data.state.playerState == 'PLAYING')
    {
        if (localAmpOffTimeoutId)
            clearTimeout(localAmpOffTimeoutId);
        localAmpOffTimeoutId = null;
        
        if (!isLocalAmpOn)
        {
            console.log('Turning Amp On');
            isLocalAmpOn = true;
        }
    }
    else
    {
        if (isLocalAmpOn && !localAmpOffTimeoutId)
        {
            localAmpOffTimeoutId = setTimeout(function() {
                console.log('Turning Amp Off');
                isLocalAmpOn = false;
            }, localAmpOffTimeoutSecs * 1000);
        }
    }
});
