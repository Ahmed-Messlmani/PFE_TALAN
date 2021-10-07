import { createSlice } from '@reduxjs/toolkit';

const devicesSlice = createSlice({
    name: 'devices',
    initialState: {
        audio: {
            active: false,
            id: ''
        },
        video: {
            active: false,
            id: '',
            resolution: 480,
            maxResolution: 0
        },
        text: {
            active: false
        },
        display:{
            active:false
        },
        noisereduction:{
            active:true
        }

    },
    reducers: {
        updateAudioDevice(state, action) {
            Object.assign(state.audio, action.payload);
        },
        updateVideoDevice(state, action) {
            Object.assign(state.video, action.payload);
        },
        updateDisplayDevice(state, action) {
            Object.assign(state.display, action.payload);
        },
        updateSpeechRecognition(state, action) {
            Object.assign(state.text, action.payload);
        },
        updateNoiseReduction(state, action) {
            Object.assign(state.noisereduction, action.payload);
        },
        setResolution(state, action) {
            state.video.resolution = action.payload;
        }
    }
});

const { actions, reducer } = devicesSlice;
export const {
    updateAudioDevice,
    updateVideoDevice,
    updateDisplayDevice,
    updateSpeechRecognition,
    updateNoiseReduction,
    setResolution
} = actions;
export default reducer;
