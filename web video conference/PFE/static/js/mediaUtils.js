export const RESOLUTIONS = [
    2160,
    1080,
    720,
    480,
    360,
    240
];

export async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
    } catch(err) {
        console.error(err);
        return [];
    }
}

export async function getMics() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'audioinput');
    } catch(err) {
        console.error(err);
        return [];
    }
}

export async function hasCamera() {
    const cameras = await getCameras();
    return cameras.length > 0;
}

export async function hasMic() {
    const mics = await getMics();
    return mics.length > 0;
}

//var noiseSuppression = MediaTrackSettings.noiseSuppression;
export async function getUserMedia(audio=true, video=true,noisereduction) {
    
    const audioConstraints = (typeof audio === 'object' ? audio : audio && await hasMic() );
    const videoConstraints = (typeof video === 'object' ? video :video && await hasCamera() );
    const constraints = {
        audio: audioConstraints===true ? true: {
            sampleRate: 48000,
            channelCount: 1,
            volume: 1.0,
            noiseSuppression:noisereduction
          } ,
        video: videoConstraints
    };
    //console.log(navigator.mediaDevices.getSupportedConstraints() );
    

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
    } catch(err) {
        console.log(err);
        return {audio: null, video: null};
    }
    const videoTrack = stream.getTracks().find(track => track.kind === 'video');
    const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
    return {audio: audioTrack, video: videoTrack}
}

export async function getUserVideo(constraints=null,noisereduction) {
    const {video} = await getUserMedia(false, constraints ? constraints : true, noisereduction);
    return video;
}


export async function getUserAudio(constraints=null,noisereduction) {
    const {audio} = await getUserMedia(constraints ? constraints : true, false,noisereduction);
    console.log(audio.getConstraints());
    console.log(audio.getSettings());
    console.log(audio.getCapabilities());
    return audio;
    
    
}
export async function getDisplayMedia() {
    // TODO: accept constraints
    const constraints = {
        'video': {cursor: 'always'},
        'audio': false
    };

    let stream;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    } catch(err) {
        console.error(err);
        return null;
    }

    const videoTrack = stream.getTracks().find(track => track.kind === 'video');
    return videoTrack;
}
