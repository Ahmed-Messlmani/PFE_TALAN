import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addUser, updateUser } from '../slices/users';
import { addChatMessage } from '../slices/messages';
import {
    addConnection,
    removeConnection,
    updateConnection
} from '../slices/connections';
import { addFeed, removeFeed, updateFeed } from '../slices/feeds';
import { Manager } from '../rtcclient';

import EnterRoomModal from './EnterRoomModal';
import MediaControlBar from './MediaControlBar';

import VideoStage from './VideoStage';

class App extends Component {
    constructor(props) {
        super(props);
        this.manager = this.props.manager;
        this.state = {
            displayEnterRoomModal: true,
        }

        this.videoStage = React.createRef();
        this.canUpdateIceServers = new RTCPeerConnection().setConfiguration !== undefined;

        this.onSubmitModal = this.onSubmitModal.bind(this);
        this.onReceiveChatMessage = this.onReceiveChatMessage.bind(this);
        this.onMediaPeer = this.onMediaPeer.bind(this);
        this.onMediaPeerRemoved = this.onMediaPeerRemoved.bind(this);
        this.onPeerTrack = this.onPeerTrack.bind(this);
        this.onPeerConnectionChange = this.onPeerConnectionChange.bind(this);
        this.onPeerUsernameChange = this.onPeerUsernameChange.bind(this);
        this.onSidebarToggle = this.onSidebarToggle.bind(this);
    }

    componentDidMount() {
        this.manager.addMessageListener({type: 'text'}, this.onReceiveChatMessage);
        this.manager.addMessageListener({type: 'ice-servers'}, this.onReceiveIceServers);
        this.manager.on('mediapeer', this.onMediaPeer);
        this.manager.on('mediapeerremoved', this.onMediaPeerRemoved);

        window.addEventListener('beforeunload', () => {
            this.manager.shutdown();
        });

        window.addEventListener('load', async () => {
            await this.manager.start();
        });
    }

    componentWillUnmount() {
        this.manager.shutdown();
    }

    render() {
        if (this.state.displayEnterRoomModal) {
            return (
                <EnterRoomModal
                    isVisible={this.state.displayEnterRoomModal}
                    onSubmit={this.onSubmitModal}
                />
            );
        }

        return (<>
            <main>
                <VideoStage 
                    ref={this.videoStage}
                />
                <MediaControlBar />
            </main>

        </>)
    }

    onSubmitModal() {
        this.setState({
            displayEnterRoomModal: false
        });
    }

    onReceiveChatMessage(message) {
        const chatMessage = {
            from: message.data.from,
            timestamp: message.data.time,
            text: message.data.text
        };
        this.props.addChatMessage(chatMessage);
    }

    onMediaPeer(peer) {
        peer.on('track', (track, streams) => {
            this.onPeerTrack(peer, track, streams);
        });

        peer.on('connectionstatechange', (state) => {
            this.onPeerConnectionChange(peer, 'connectionState', state)
        });

        peer.on('iceconnectionstatechange', (state) => {
            this.onPeerConnectionChange(peer, 'iceConnectionState', state)
        });

        peer.on('icegatheringstatechange', (state) => {
            this.onPeerConnectionChange(peer, 'iceGatheringState', state)
        });

        peer.on('signalingstatechange', (state) => {
            this.onPeerConnectionChange(peer, 'signalingState', state)
        });

        peer.on('usernamechange', (username) => {
            this.onPeerUsernameChange(peer, username);
        });

        const user = {
            id: peer.client_id,
            username: peer.username
        }
        const feed = {
            id: peer.client_id,
            videoStream: null,
            audioStream: null,
            videoEnabled: true,
            audioMuted: false
        };
        const connection = {
            id: peer.client_id,
            connectionState: peer.connectionState,
            iceConnectionState: peer.iceConnectionState,
            iceGatheringState: peer.iceGatheringState,
            signalingState: peer.signalingState
        };

        this.props.addUser(user);
        this.props.addFeed(feed);
        this.props.addConnection(connection);
    }

    onMediaPeerRemoved(peer) {
        this.props.removeFeed(peer.client_id);
        this.props.removeConnection(peer.client_id);
    }

    onPeerTrack(peer, track) {
        const stream = new MediaStream([track]);

        track.addEventListener('unmute', () => {
            console.log('Track unmuted', track, stream);
            const fieldName = track.kind == 'video' ? 'videoStream' : 'audioStream';
            const feed = {
                id: peer.client_id,
                [fieldName]: stream
            }
            this.props.updateFeed(feed);
        });

        track.addEventListener('mute', () => {
            console.log('Track muted', track);
            const fieldName = track.kind == 'video' ? 'videoStream' : 'audioStream';
            const feed = {
                id: peer.client_id,
                [fieldName]: null
            }
            this.props.updateFeed(feed);
        });
    }

    onPeerConnectionChange(peer, kind, status) {
        const connection = {
            id: peer.client_id,
            [kind]: status
        };
        this.props.updateConnection(connection);
    }

    onPeerUsernameChange(peer, username) {
        const user = {id: peer.client_id, username};
        this.props.updateUser(user);
    }

    onSidebarToggle() {
        // When the sidebar is toggled, VideoStage must be re-rendered to
        // update the scaling factor of its VideoFeeds. In the future, the
        // VideoStage should be able to update itself using Resize Observers
        // (see https://drafts.csswg.org/resize-observer-1/).
        this.videoStage.current.forceUpdate();
    }
}

App.propTypes = {
    manager: PropTypes.instanceOf(Manager).isRequired,
    addUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    addChatMessage: PropTypes.func.isRequired,
    addConnection: PropTypes.func.isRequired,
    removeConnection: PropTypes.func.isRequired,
    updateConnection: PropTypes.func.isRequired,
    addFeed: PropTypes.func.isRequired,
    removeFeed: PropTypes.func.isRequired,
    updateFeed: PropTypes.func.isRequired
};

export default connect(
    null,
    {
        addUser,
        updateUser,
        addChatMessage,
        addConnection,
        removeConnection,
        updateConnection,
        addFeed,
        removeFeed,
        updateFeed
    }
)(App);
