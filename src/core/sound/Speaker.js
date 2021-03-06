export default class SoundSpeaker {
    constructor(src) {
        this.target = {
            position: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        this.index = SoundSpeaker.Index++;
        this.sourceType = 'audio';
        this.source = src;
        this.sourceNode = null;
        this.volume = 0;
        this.volumeNode = null;
        this.playing = false;
        this.paused = false;
        this.loaded = false;
        this.visible = false;
        this.loop = false;
        this.loopType = 'forever';
        this.playTime = 0;
    }
    static Index = 0;
    bindTarget(target) {
        this.target = target;
    }
    async bindSource(source) {
        this.sourceNode = await this.createBufferSource(source)
        this.sourceType = 'audio';
        if(this.sourceNode) {
            this.source = source;
            this.volumeNode = this.ctx.createGain();
            this.createPannerNode();
            this.sourceNode.connect(this.pannerNode);
            this.pannerNode.connect(this.volumeNode);
            this.volumeNode.connect(this.ctx.destination);
        }
        this.loaded = true;
    }

    async createBufferSource(source) {
        return new Promise((resolve, reject)=>{
            try{
                var sourceNode = this.ctx.createBufferSource();
                var request = new XMLHttpRequest();
                request.open('GET', source, true);
                request.responseType = 'arraybuffer';
                request.onload = ()=> {
                    var audioData = request.response;
                    this.ctx.decodeAudioData(audioData, (buffer)=> {
                        sourceNode.buffer = buffer;
                        sourceNode.loop = this.loop;
                        resolve(sourceNode);
                    })
                }
                request.send();
            } catch(e) {
                reject(e);
            }
        })
    }
    createPannerNode() {
        var panner = this.ctx.createPanner();
        this.pannerNode = panner;
    }

    /** ???????????? */
    play() {
        this.playing = true;
        this.paused = false;
        this.sourceNode.start(0);
    }

    /** ???????????? */
    puase() {
        this.playing = false;
        this.paused = true;
        this.sourceNode.stop(this.playTime);
    }

    /** ???????????? */
    stop() {
        this.playing = false;
        this.puased = true;
        this.playTime = 0;
        this.sourceNode.stop(0);
    }

    Start() {
        // ?????????????????????????????????????????????
        if(this.source) {
            this.bindSource(this.source);
        }
        this.visible = true;
    }
    Update() {
        // ????????????
        if(!this.ctx) return;
        if(!this.loaded) return;
        if(this.target && this.target.position) {
            const position = this.target.position;
            if(this.pannerNode.positionX) {
                this.pannerNode.positionX.setValueAtTime(position.x, this.ctx.currentTime);
                this.pannerNode.positionY.setValueAtTime(position.y, this.ctx.currentTime);
                this.pannerNode.positionZ.setValueAtTime(position.z, this.ctx.currentTime);
            } else {
                this.pannerNode.setPosition(position.x, position.y, position.z);
            }
        }
    }
    End() {
        this.loaded = false;
        this.visible = false;
    }
}