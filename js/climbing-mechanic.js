WL.registerComponent('climbing-mechanic', {
    handedness: {type: WL.Type.Enum, values: ['left', 'right'], default: 'left'},
    player: {type: WL.Type.Object},
}, {
    init: function() {
        this.overlappedGrip = null;
        this.heldGrip = null;

        this.grippedPosition = new Float32Array(3);
        this.newPosition = new Float32Array(3);
        this.diff = new Float32Array(3);
    },
    start: function() {
        this.collision = this.object.getComponent('collision');

        WL.onXRSessionStart.push(this.onXRSessionStart.bind(this));

        this.handedness = ['left', 'right'][this.handedness];
    },
    update: function(dt) {
        const overlaps = this.collision.queryOverlaps();
        if(overlaps.length > 0) {
            const comp = overlaps[0];
            if(comp.object.name.endsWith('Controller')) {
                return;
            }
            this.overlappedGrip = comp;
        } else {
            this.overlappedGrip = null;
        }

        if(this.heldGrip != null) {
            this.object.getTranslationWorld(this.newPosition);
            glMatrix.vec3.sub(this.diff, this.grippedPosition, this.newPosition);
            this.player.translate(this.diff);
        }
    },

    onXRSessionStart: function(session) {
        session.addEventListener('selectstart', this.onTriggerPressed.bind(this));
        session.addEventListener('selectend', this.onTriggerReleased.bind(this));
    },

    onTriggerPressed: function(event) {
        if(event.inputSource.handedness == this.handedness) {
            this.heldGrip = this.overlappedGrip;
            this.object.getTranslationWorld(this.grippedPosition);
        }
    },
    onTriggerReleased: function(event) {
        if(event.inputSource.handedness == this.handedness) {
            this.heldGrip = null;
        }
    }
});
