"use strict";

var defaultTargetPlayerName = "Wohnzimmer";
var lircOurRemoteName = "Pioneer_XXD3107_CD_300";

var localAmpPlayerName = "Wohnzimmer";
var localAmpOffTimeoutSecs = 120;

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
    "3": "3 ",
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
// discovery.applyPreset(presets[buttonToPreset[buttonName]]);

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
var lircdSocket = net.connect('/var/run/lirc/lircd');

lircdSocket.on("data", function (data) {

    var cols = data.toString().split(' ');
    var repeatCount = cols[1];
    var buttonName = cols[2];
    var remoteName = (cols[3] || '').trim();  // trim newline
    if (remoteName != lircOurRemoteName)
        return;

    console.log('lircdSocket.data: ', remoteName, buttonName, repeatCount, allowRepeat);
    
    if (repeatCount != "00" && !allowRepeat) {
        return;
    }
    
    if (targetPlayer)
    {
        var action = actions[buttonName];
        if (action) {
            allowRepeat = action(targetPlayer);
            return;
        }
        
        var actionFavorite = actionsFavorites[buttonName];
        if (actionFavorite) {
            targetPlayer.coordinator.replaceWithFavorite(actionFavorite, function(success) {
                if (success) {
                    targetPlayer.coordinator.play();
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
    
    //console.log('discovery.transport-state: ', data);
    if (data.state.playerState == 'PLAYING')
    {
        if (localAmpOffTimeoutId)
            clearTimeout(localAmpOffTimeoutId);
        localAmpOffTimeoutId = null;
        
        if (!isLocalAmpOn)
        {
            console.log('*** Turning Amp On');
            lircdSocket.write('SEND_ONCE Wohnzimmer Einschalten\n');
            setTimeout(function() {
                lircdSocket.write('SEND_ONCE Wohnzimmer Eingang_CD\n');
            }, 1000);
            
            isLocalAmpOn = true;
        }
    }
    else
    {
        if (isLocalAmpOn && !localAmpOffTimeoutId)
        {
            localAmpOffTimeoutId = setTimeout(function() {
                console.log('*** Turning Amp Off');
                lircdSocket.write('SEND_ONCE Wohnzimmer Ausschalten\n');
                
                isLocalAmpOn = false;
            }, localAmpOffTimeoutSecs * 1000);
        }
    }
});
