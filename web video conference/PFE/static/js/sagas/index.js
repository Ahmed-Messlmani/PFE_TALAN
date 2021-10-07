import {
    apply,
    put,
    takeEvery,
    takeLatest,
    getContext,
    select
} from 'redux-saga/effects';
import { setUsername } from '../slices/users';
import { setLocalAudio, setLocalVideo} from '../slices/feeds';
import { setResolution } from '../slices/devices';
import { sendChatMessage } from '../slices/messages';
import { disableRemoteVideo, enableRemoteVideo } from '../slices/feeds';

export default function* rootSaga() {
    yield takeLatest(setUsername.type, doSetUsername);//takes every matching action and runs the instructerd sag but cancels any previous saga task if it is still running
    yield takeEvery(sendChatMessage.type, doSendChatMessage);//takes every matching action and runs the instructered saga, can run concurrent tasks
    yield takeLatest(setLocalAudio.type, doSetLocalAudio);
    yield takeLatest(setLocalVideo.type, doSetLocalVideo);
    yield takeLatest(setResolution.type, doSetResolution);
    yield takeLatest(disableRemoteVideo.type, doDisableRemoteVideo);
    yield takeLatest(enableRemoteVideo.type, doEnableRemoteVideo);

}

function* doSendChatMessage(action) {
    const manager = yield getContext('manager');
    const message = action.payload;
    const from = manager.username;

    try {
        yield apply(manager.signaler, manager.signaler.text, [message, from]);
        yield put({type: 'MANAGER_UPDATED'});
    } catch (err) {
        yield put({type: 'MANAGER_ERROR', payload: err});
    }
}
function* doSetUsername(action) {
    const manager = yield getContext('manager');
    const username = action.payload;

    try {
        yield apply(manager, manager.setUsername, [username]);
        yield put({type: 'MANAGER_UPDATED'});
    } catch (err) {
        yield put({type: 'MANAGER_ERROR', payload: err});
    }
}

function* doSetLocalAudio(action) {
    const manager = yield getContext('manager');
    const track = action.payload;

    try {
        if (track) {
            yield apply(manager, manager.setTrack, ['audio', track]);
        } else {
            yield apply(manager, manager.stopTrack, ['audio']);
        }

        yield put({type: 'MANAGER_UPDATED'});
    } catch(err) {
        yield put({type: 'MANAGER_ERROR', payload: err});
    }
}

function* doSetLocalVideo(action) {
    const manager = yield getContext('manager');
    const track = action.payload;

    try {
        if (track) {
            yield apply(manager, manager.setTrack, ['video', track]);
        } else {
            yield apply(manager, manager.stopTrack, ['video']);
        }

        yield put({type: 'MANAGER_UPDATED'});
    } catch(err) {
        yield put({type: 'MANAGER_ERROR', payload: err});
    }
}

function* doSetResolution(action) {
    const resolution = action.payload;

    try {
        const localFeed = yield select(state => state.feeds.find(feed => feed.id === 'local'));
        if (localFeed.videoStream) {
            const track = localFeed.videoStream.getVideoTracks()[0];
            const constraints = {
                height: {ideal: resolution},
                width: {ideal: resolution * 4 / 3}
            };
            yield apply(track, track.applyConstraints, [constraints]);
        }
        yield put({type: 'RESOLUTION_UPDATED'});
    } catch(err) {
        console.error(err);
        yield put({type: 'ERROR', payload: err});
    }
}

function* doDisableRemoteVideo(action) {
    const manager = yield getContext('manager');
    const id = action.payload;

    try {
        const peer = manager.mediaPeers.get(id);
        yield apply(peer, peer.disableRemoteVideo);
        yield put({type: 'PEER_UPDATED'});
    } catch(err) {
        yield put({type: 'PEER_ERROR', payload: err});
    }
}

function* doEnableRemoteVideo(action) {
    const manager = yield getContext('manager');
    const id = action.payload;

    try {
        const peer = manager.mediaPeers.get(id);
        yield apply(peer, peer.enableRemoteVideo);
        yield put({type: 'PEER_UPDATED'});
    } catch(err) {
        yield put({type: 'PEER_ERROR', payload: err});
    }
}

