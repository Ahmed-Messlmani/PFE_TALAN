import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setLocalAudio, setLocalVideo} from '../slices/feeds';
import { updateAudioDevice, updateVideoDevice, updateDisplayDevice, updateSpeechRecognition, updateNoiseReduction } from '../slices/devices';
import { getUserVideo, getUserAudio, getDisplayMedia} from '../mediaUtils';
import { sendChatMessage } from '../slices/messages';
import ExitDialog from './ExitDialog';

class MediaControlBar extends Component {
    constructor(props) {
        super(props);
        this.onTrack = this.onTrack.bind(this);
    }

    render() {
        const {
            videoDevice,
            audioDevice,
            displayDevice,
            recognitionDevice,
            NoiseReductionDevice,
        } = this.props;

        const resolution = videoDevice.resolution;
        const videoConstraints = {
            deviceId: videoDevice.id,
            height: {ideal: resolution},
            width: {ideal: resolution * 4 / 3}
        };

        const audioConstraints = {
            deviceId: audioDevice.id
        };

        return (
            <section
                className='media-control-bar'
                aria-labelledby='media-controls-title'
            >
                <h1 id='media-controls-title' className='sr-only'>
                    Media controls
                </h1>
                <MediaToggleButton
                    kind={'Start Video'}
                    deviceConstraints={videoConstraints}
                    isOn={videoDevice.active}
                    onTrack={this.onTrack}
                    noiseOn={NoiseReductionDevice.active}
                    getMedia={getUserVideo}
                    icons={{on: 'videocam', off: 'videocam_off'}}
                    ariaLabel='Toggle enable camera'
                />
                <MediaToggleButton
                    kind={'Join Audio'}
                    deviceConstraints={audioConstraints}
                    isOn={audioDevice.active}
                    noiseOn={NoiseReductionDevice.active}
                    onTrack={this.onTrack}
                    getMedia={getUserAudio}
                    icons={{on: 'mic', off: 'mic_off'}}
                    ariaLabel='Toggle enable microphone'
                />
                <MediaToggleButton
                    kind={'Share Content'}
                    deviceConstraints={null}
                    isOn={displayDevice.active}
                    noiseOn={NoiseReductionDevice.active}
                    onTrack={this.onTrack}
                    getMedia={getDisplayMedia}
                    icons={{on: 'screen_share', off: 'stop_screen_share'}}
                    ariaLabel='Toggle enable desktop sharing'
                />
                <SpeechToText
                    kind={'Speech Recognition'}
                    onTrack={this.onTrack}
                    isOn={recognitionDevice.active}
                    icons={{on: 'closed_caption', off: 'closed_caption_disabled'}}
                    ariaLabel='speech To Text'
                    micstat={audioDevice.active}
                />
                <NoiseReduction
                    kind={'Noise Reduction'}
                    isOn={NoiseReductionDevice.active}
                    onTrack={this.onTrack}
                    icons={{on: 'auto_fix_normal', off: 'auto_fix_off'}}
                    ariaLabel='Noise Reduction'

                />
                
            
                <HangUpButton />
                
                
            </section>
        );
    }

    onTrack(kind, mediaTrack) {
        if (kind === 'Start Video') {
            this.props.setLocalVideo(mediaTrack);

            if (mediaTrack) {
                this.props.updateVideoDevice({active: true});
                this.props.updateDisplayDevice({active: false});
            } else {
                this.props.updateVideoDevice({active: false});
            }
        } else if (kind === 'Share Content') {
            this.props.setLocalVideo(mediaTrack);

            if (mediaTrack) {
                this.props.updateDisplayDevice({active: true});
                this.props.updateVideoDevice({active: false});
            } else {
                this.props.updateDisplayDevice({active: false});
            }
        } else if (kind === 'Join Audio') {
            this.props.setLocalAudio(mediaTrack);

            if (mediaTrack) {
                this.props.updateAudioDevice({active: true});
            } else {
                this.props.updateAudioDevice({active: false});
                this.props.updateSpeechRecognition({active: false});
            }
        } else if (kind === 'Speech Recognition'){
            if (this.props.audioDevice.active==false || mediaTrack === null){
                this.props.updateSpeechRecognition({active: false});  
            }
            else{
                this.props.updateSpeechRecognition({active: true});
                if (mediaTrack!=''){
                    this.props.sendChatMessage(mediaTrack.trim());
                }
            }
         }
        else if (kind ==='Noise Reduction'){
            console.log(mediaTrack);
            if(this.props.NoiseReductionDevice.active==false){
                this.props.updateNoiseReduction({active:true});   
            }
            else{
                this.props.updateNoiseReduction({active:false});
            }
            
        }
        }



    
}

MediaControlBar.propTypes = {
    audioDevice: PropTypes.object.isRequired,
    videoDevice: PropTypes.object.isRequired,
    displayDevice: PropTypes.object.isRequired,
    recognitionDevice: PropTypes.object.isRequired,
    setLocalAudio: PropTypes.func.isRequired,
    setLocalVideo: PropTypes.func.isRequired,
    updateAudioDevice: PropTypes.func.isRequired,
    updateVideoDevice: PropTypes.func.isRequired,
    updateDisplayDevice: PropTypes.func.isRequired,
    updateSpeechRecognition: PropTypes.func.isRequired,
    updateNoiseReduction: PropTypes.func.isRequired,
    sendChatMessage: PropTypes.func.isRequired
};
const mapStateToProps = state => {
    

    return {
        audioDevice: state.devices.audio,
        videoDevice: state.devices.video,
        displayDevice: state.devices.display,
        recognitionDevice: state.devices.text,
        NoiseReductionDevice:state.devices.noisereduction
    }
}

export default connect(
    mapStateToProps,
    {
        setLocalAudio,
        sendChatMessage, 
        setLocalVideo,
        updateAudioDevice,
        updateVideoDevice,
        updateDisplayDevice,
        updateNoiseReduction,
        updateSpeechRecognition
    }
)(MediaControlBar);

class MediaToggleButton extends Component {
    constructor(props) {
        super(props);
        this.mediaTrack = null;
        this.noise=this.props.noiseOn;
        this.onClick = this.onClick.bind(this);
    }

    mediaIsOn() {
        return this.mediaTrack && this.mediaTrack.readyState === 'live';
    }

    render() {
        
        return (
            <button onClick={this.onClick}
                aria-label={this.props.ariaLabel}
                aria-pressed={this.props.isOn}
            >
                <i className='material-icons'>
                    {this.props.isOn ? this.props.icons.on : this.props.icons.off}
                </i>
                <h6>{this.props.kind}</h6>
            </button>
        );
    }

    componentDidMount() {
        this.setMedia();
    }
    /*componentDidUpdate(){
        this.noise=this.props.noiseOn
        if (this.props.isOn) {
            this.mediaOn();
        }
    }
    */

    setMedia() {
        // Turn media on or off as specified by props
        if (this.props.isOn && !this.mediaIsOn()) {
            this.mediaOn();
        } else if (!this.props.isOn && this.mediaIsOn()) {
            this.mediaOff();
        }
    }

    onClick() {
        // Toggle media when the button is clicked
        if (this.props.isOn) {
            this.mediaOff();
        } else {
            this.mediaOn();
        }
    }

    mediaOn() {
        if (this.props.kind == "Share Content"){     
            console.log("test"); 
            this.props.getMedia(this.props.deviceConstraints).then((track) => {
                this.mediaTrack = track;
                this.props.onTrack(this.props.kind, track);
            });           
            
            
        }
        else{
            console.log("test1");
            this.props.getMedia(this.props.deviceConstraints,this.noise).then((track) => {
                this.mediaTrack = track;
                this.props.onTrack(this.props.kind, track);
            });
        }
    }

    mediaOff() {
        if (this.mediaIsOn()) {
            this.mediaTrack.enabled = false;
            this.mediaTrack.stop();
        }
        this.props.onTrack(this.props.kind, null);
    }
}

MediaToggleButton.propTypes = {
    kind: PropTypes.string.isRequired,
    deviceConstraints: PropTypes.object,
    isOn: PropTypes.bool.isRequired,
    noiseOn:PropTypes.bool.isRequired,
    icons: PropTypes.object.isRequired,
    getMedia: PropTypes.func.isRequired,
    onTrack: PropTypes.func.isRequired,
    ariaLabel: PropTypes.string.isRequired
};

class HangUpButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showExitDialog: false,
        };

        this.onClick = this.onClick.bind(this);
        this.onCloseExitDialog = this.onCloseExitDialog.bind(this);
    }

    render() {
        return (<>
            { this.state.showExitDialog &&
            <ExitDialog onClose={this.onCloseExitDialog} />
            }
            <button onClick={this.onClick} aria-label='Hang up'>
                <i className='material-icons' style={{color: '#a00'}}>call_end</i>
                <h6>Leaving Meet</h6>
            </button>
        </>);
    }

    onClick() {
        this.setState({
            showExitDialog: true
        });
    }

    onCloseExitDialog() {
        this.setState({
            showExitDialog: false
        });
    }
}
class SpeechToText extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.restart= this.restart.bind(this);
        this.speechApi=null;
        this.transcription=null;
        
 
    }
    
    render() {
        return (
            <button onClick={this.onClick}
                aria-label={this.props.ariaLabel}
                aria-pressed={this.props.isOn}
            >
                <i className='material-icons'>
                    {this.props.isOn ? this.props.icons.on : this.props.icons.off}
                </i>
                <select name="lang" id="lang">
                    <option value="en-US">English</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="es-ES">Spanish</option>
                    <option value="it-IT">Italian</option>
                </select>
                <h6>{this.props.kind}</h6>
            </button>
        );
    }
    componentDidMount() {
        this.setMedia();
    }
    componentDidUpdate(){
        var e = document.getElementById("lang");
        var strUser = e.value;
        console.log(strUser);
        this.speechApi.lang=strUser;
    }

    setMedia() {
        this.speechApi= new webkitSpeechRecognition();
	    this.speechApi.continuous = true;
        this.speechApi.interimResults = true; 
        this.speechApi.addEventListener('end',this.restart);
    }

    onClick() {
        if (this.props.isOn==false && this.props.micstat) {
            this.mediaOn();
        } else {
            this.mediaOff();
        }
    }

    mediaOn() {
        this.speechApi.lang=document.getElementById("lang").value;
        this.speechApi.start();
        
        this.props.onTrack(this.props.kind, "speech recognition started");
        this.speechApi.onresult = (event) => {
            let final_transcript='';
            let interim_transcript = "";
            // Loop through the results from the speech recognition object.
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
              if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
              }else {
                interim_transcript += event.results[i][0].transcript;
              }
            }
            // Set the Final transcript 
            this.transcription=interim_transcript;
            //console.log(this.transcription);
            this.props.onTrack(this.props.kind, this.transcription);
            
          };
          
            
          
        
        
    }
    mediaOff() {
        this.speechApi.abort();
        this.props.onTrack(this.props.kind, null);
    }
    restart(){
        if (this.props.isOn==true){
            console.log('Speech recognition service disconnected');
            this.speechApi.start();
        }

    };


}
SpeechToText.propTypes = {
    kind: PropTypes.string.isRequired,
    isOn: PropTypes.bool.isRequired,
    icons: PropTypes.object.isRequired,
    onTrack: PropTypes.func.isRequired,
    ariaLabel: PropTypes.string.isRequired
};


class NoiseReduction extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        return (
            <button onClick={this.onClick}
                aria-label={this.props.ariaLabel}
                aria-pressed={this.props.isOn}
            >
                <i className='material-icons'>
                    {this.props.isOn ? this.props.icons.on : this.props.icons.off}
                </i>
                <h6>{this.props.kind}</h6>
            </button>
        );
    }
    onClick(){
        if(this.props.isOn==true){
            this.props.onTrack(this.props.kind,false);
        }
        else{
            this.props.onTrack(this.props.kind,true);
        }
    }
}
NoiseReduction.propTypes = {
    kind: PropTypes.string.isRequired,
    isOn: PropTypes.bool.isRequired,
    icons: PropTypes.object.isRequired,
    ariaLabel: PropTypes.string.isRequired,
    onTrack: PropTypes.func.isRequired
};
