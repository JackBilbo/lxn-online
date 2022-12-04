const handleKeybinds = (keybindOffsets,keybindstates) => {
    D.log('Keybinding-Data received. Transponder Code is ' + keybindOffsets.transponder.toString(16) )
    if(keybindOffsets.transponder != null) {
        const tc = keybindOffsets.transponder.toString(16);
        if(keybindstates.last_tc == null) { keybindstates.last_tc = tc}

        if(code_delta(keybindstates.last_tc[2], tc[2]) == -1) {
            keybindstates.last_tc = tc;
            NAVMAP.zoom_out();
        }

        if(code_delta(keybindstates.last_tc[2], tc[2]) == 1) {
            keybindstates.last_tc = tc;
            NAVMAP.zoom_in();
        }

        if(code_delta(keybindstates.last_tc[0], tc[0]) == -1) {
            keybindstates.last_tc = tc;
            if(B21_SOARING_ENGINE.task_index() < B21_SOARING_ENGINE.task_length() -1 ) {
                B21_SOARING_ENGINE.change_wp(1);
            }
        }

        if(code_delta(keybindstates.last_tc[0], tc[0]) == 1) {
            keybindstates.last_tc = tc;
            if(B21_SOARING_ENGINE.task_index() > 0) {
                B21_SOARING_ENGINE.change_wp(-1);
            }
        }

        if(keybindstates.last_tc[3] != tc[3]) {
            NAVMAP.toggleMapRotation();
        }

    }

}

const code_delta = function(a,b) {
            //console.log("knob_delta a:"+a+" b:"+b);
            let delta = parseInt(b) - parseInt(a);
            if (delta == 0) {
                return delta;
            }
            return (delta < -4) || (delta > 0 && delta < 4) ? 1 : -1;
}

module.exports = { handleKeybinds, code_delta }