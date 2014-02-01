"use strict";

var defaultTargetPlayerName = "Kueche";
var localAmpPlayerName = "Kueche";
var localAmpOffTimeoutSecs = 10;

var actions = {
    "vol_up": function (player) { player.setVolume("+1"); return true; },
    "vol_down": function (player) { player.setVolume("-1"); return true; },
    "rev": function (player) { player.coordinator.previousTrack(); },
    "fwd": function (player) { player.coordinator.nextTrack(); },
    "play": function (player) { player.coordinator.play(); },
    "stop": function (player) { player.coordinator.pause(); },
    "play_mode": function (player) { player.coordinator.shuffle(!player.coordinator.currentPlayMode.shuffle); }
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
    
    if (targetPlayer)
    {
        var action = actions[keyCode];
        if (action) {
            allowRepeat = action(targetPlayer);
            return;
        }
        
        var actionFavorite = actionsFavorites[keyCode];
        if (actionFavorite) {
            targetPlayer.replaceWithFavorite(actionFavorite, function(success) {
                if (success) {
                    targetPlayer.play();
                }
            });
            allowRepeat = false;
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
