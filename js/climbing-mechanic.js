import {Component, Type} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';

export class ClimbingMechanic extends Component {
    static TypeName = 'climbing-mechanic';
    static Properties = {
        handedness: {type: Type.Enum, values: ['left', 'right'], default: 'left'},
        player: {type: Type.Object},
    };

    init() {
        this.overlappedGrip = null;
        this.heldGrip = null;

        this.grippedPosition = new Float32Array(3);
        this.newPosition = new Float32Array(3);
        this.diff = new Float32Array(3);
    }

    start() {
        this.collision = this.object.getComponent('collision');

        this.engine.onXRSessionStart.push(this.onXRSessionStart.bind(this));

        this.handedness = ['left', 'right'][this.handedness];
    }

    update(dt) {
        const overlaps = this.collision.queryOverlaps();
        if (overlaps.length > 0) {
            const comp = overlaps[0];
            if (comp.object.name.endsWith('Controller')) {
                return;
            }
            this.overlappedGrip = comp;
        } else {
            this.overlappedGrip = null;
        }

        if (this.heldGrip != null) {
            this.object.getTranslationWorld(this.newPosition);
            vec3.sub(this.diff, this.grippedPosition, this.newPosition);
            this.player.translate(this.diff);
        }
    }

    onXRSessionStart(session) {
        session.addEventListener('selectstart', this.onTriggerPressed.bind(this));
        session.addEventListener('selectend', this.onTriggerReleased.bind(this));
    }

    onTriggerPressed(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.heldGrip = this.overlappedGrip;
            this.object.getTranslationWorld(this.grippedPosition);
        }
    }

    onTriggerReleased(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.heldGrip = null;
        }
    }
}
