import { createSlice } from '@reduxjs/toolkit';

const feedsSlice = createSlice({
    name: 'feeds',
    initialState: [{
        id: 'local',
        audioStream: null,
        videoStream: null,
        audioMuted: true,
        videoEnabled: true
    }],
    reducers: {
        addFeed(state, action) {
            state.push(action.payload);
        },
        removeFeed(state, action) {
            const id = action.payload;
            return state.filter(feed => feed.id !== id);
        },
        updateFeed(state, action) {
            const {id} = action.payload;
            const feed = state.find(f => f.id === id);
            Object.assign(feed, action.payload);
        },
        setLocalAudio(state, action) {
            const track = action.payload;
            const stream = track ? new MediaStream([track]) : null;
            const localFeed = state.find(feed => feed.id === 'local');
            if (localFeed.audioStream) {
                localFeed.audioStream.getTracks().forEach(track => track.stop());
            }
            localFeed.audioStream = stream;
        },
        setLocalVideo(state, action) {
            const track = action.payload;
            const stream = track ? new MediaStream([track]) : null;
            const localFeed = state.find(feed => feed.id === 'local');
            if (localFeed.videoStream) {
                localFeed.videoStream.getTracks().forEach(track => track.stop());
            }
            localFeed.videoStream = stream;
        },
        disableRemoteVideo(state, action) {
            const id = action.payload;
            state.find(feed => feed.id === id).videoEnabled = false;
        },
        enableRemoteVideo(state, action) {
            const id = action.payload;
            state.find(feed => feed.id === id).videoEnabled = true;
        }
    }
});

const { actions, reducer } = feedsSlice;
export const {
    addFeed,
    removeFeed,
    updateFeed,
    setLocalAudio,
    setLocalVideo,
    disableRemoteVideo,
    enableRemoteVideo
} = actions;
export default reducer;
