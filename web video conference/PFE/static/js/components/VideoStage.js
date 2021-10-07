import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
class VideoStage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoHeightAspect: 3,
            videoWidthAspect: 4,
            videoScaleFactor: 1.0
        };

        this.updateScaleFactor = this.updateScaleFactor.bind(this);
    }

    render() {
        // Associate each feed with the corresponding username
        const users = this.props.users;
        const feeds = this.props.feeds.map(feed => {
            const user = users.find(user => user.id === feed.id);
            const username = user ? user.username : 'John doe';
            return Object.assign({}, feed, {username});
        });

        const feedHeight = Math.floor(this.state.videoScaleFactor * this.state.videoHeightAspect);
        const feedWidth = Math.floor(this.state.videoScaleFactor * this.state.videoWidthAspect);
        const videoFeedStyle = {
            height: `${feedHeight}px`,
            width: `${feedWidth}px`,
        };

        return (
            <ul
                id='video-stage'
                className='video-stage'
                aria-labelledby='video-stage-title'
            >
                <h1 id='video-stage-title' className='sr-only'>
                    Video feeds
                </h1>
                {feeds.map((feed) =>
                    <VideoFeed
                        key={feed.id}
                        feed={feed}
                        style={videoFeedStyle}
                        message={this.props.messages}
                    />
                )}
            </ul>
        );
    }

    componentDidMount() {
        // Dynamically update the size of displayed video feeds when the
        // window is resized
        window.addEventListener('resize', this.updateScaleFactor)
        this.updateScaleFactor();
    }

    componentDidUpdate() {
        const videoScaleFactor = this.calculateScaleFactor(
            this.props.feeds.length, this.state.videoHeightAspect, this.state.videoWidthAspect);

        if (videoScaleFactor !== this.state.videoScaleFactor) {
            this.updateScaleFactor(videoScaleFactor);
        }
    }

    updateScaleFactor(scaleFactor=null) {
        this.setState((state, props)  => {
            const videoScaleFactor = (scaleFactor ?
                scaleFactor :
                this.calculateScaleFactor(props.feeds.length, state.videoHeightAspect,
                                            state.videoWidthAspect)
            );


            return {
                videoScaleFactor
            };
        });
    }

    calculateScaleFactor(nItems, heightAspect, widthAspect, minWidth=0) {
        const container = document.querySelector('#video-stage');

        // "Normalize" the height and width of the container relative to the
        // aspect ratio of the contained items
        const normHeight = container.clientHeight / heightAspect;
        const normWidth = container.clientWidth / widthAspect;

        // The ratio of columns to rows should approximately match the 
        // normalized aspect ratio of the container
        let rows = (Math.sqrt(nItems * (normHeight / normWidth)));
        let columns = (Math.sqrt(nItems * (normWidth / normHeight)));

        // The product of rows and columns should be minimized such that it still
        // fits all the items
        const rowsFloor = Math.floor(rows);
        const rowsCeiling = Math.ceil(rows);
        const columnsFloor = Math.floor(columns);
        const columnsCeiling = Math.ceil(columns);
        const gridOptions = [
            [rowsFloor, columnsFloor],
            [rowsCeiling, columnsFloor],
            [rowsFloor, columnsCeiling],
            [rowsCeiling, columnsCeiling]
        ].filter(([rows, columns]) => rows * columns >= nItems);

        // Compute the maximum scaling factor based on the remaining grid options
        const scaleFactors = gridOptions.map(([rows, columns]) => {
            // The -4 provides a small amount of slack to account for numerical
            // imprecision. Without this slack, occasionally the items are slightly
            // too wide and pushed into a new row, causing overflow.
            const xScale = (container.clientWidth - 4) / (columns * widthAspect);
            const yScale = (container.clientHeight - 4) / (rows * heightAspect);
            return Math.min(xScale, yScale);
        });
        let scale = Math.max(...scaleFactors);

        // If the computed scaling factor would cause the width of an item to
        // be less than the specified minimum, recompute the scaling factor to
        // conform to the minimum
        if (scale * widthAspect < minWidth) {
            scale = minWidth / widthAspect;
        }

        return scale;
    }
}

VideoStage.propTypes = {
    feeds: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    messages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function select(state) {
    const {
        users,
        feeds,
        messages
    } = state;

    return {
        users,
        feeds,
        messages
    }
}

export default connect(
    select,
    null,
    null,
    {forwardRef: true}
)(VideoStage);

class VideoFeed extends Component {
    constructor(props) {
        super(props);

        // create a ref for the <video> element so that we can act on the DOM
        // directly to update the stream sourceC
        this.video = React.createRef();
        this.audio = React.createRef();
        this.videoContainer = React.createRef();
    }

    render() {
        const feed = this.props.feed;
        var mess ='';
        var user='';
        var twopoint='';
        if(this.props.message.length !=0){
            const arrmess=Array.from(this.props.message.values());
            mess =arrmess[arrmess.length - 1].text;
            user=arrmess[arrmess.length - 1].from;
            twopoint=':';
        }
        if (feed.id=='local'){
            return (
                <li className='video-feed'
                    style={this.props.style}
                    draggable={'false'}
                    tabIndex={0}
                    aria-labelledby={`video-feed-${feed.id}`}
                >
                    <h2 id={`video-feed-${feed.id}`} className='sr-only'>
                        {`Video feed for user ${feed.username}`}
                    </h2>
                    <div
                        ref={this.videoContainer}
                        className="videoText"
                    >
                        <p className='video-tag'>{feed.username}</p>

                        <video
                            className="video"
                            ref={this.video}
                            id={feed.id}
                            autoPlay={true}
                            playsInline={true}
                            muted={true}
                        />
                        <span id={feed.id} className="text-light" >{user} {twopoint} {mess}</span> 
                    </div>
                    <audio 
                        ref={this.audio}
                        autoPlay={true}
                    />

                </li>
                
            );
        }
         else{
            return (
                <li className='video-feed'
                    style={this.props.style}
                    draggable={'false'}
                    tabIndex={0}
                    aria-labelledby={`video-feed-${feed.id}`}
                >
                    <h2 id={`video-feed-${feed.id}`} className='sr-only'>
                        {`Video feed for user ${feed.username}`}
                    </h2>
                    <div
                        ref={this.videoContainer}
                        className="videoText"
                    >
                        <p className='video-tag'>{feed.username}</p>

                        <video
                            className="video"
                            ref={this.video}
                            id={feed.id}
                            autoPlay={true}
                            playsInline={true}
                            muted={true}
                        />
                    </div>
                    <audio 
                        ref={this.audio}
                        autoPlay={true}
                    />

                </li>
                
            );

            }
        
    }

    componentDidMount() {
        const {
            videoStream,
            audioStream,
            audioMuted,
            videoEnabled,
        } = this.props.feed;

        this.video.current.srcObject = videoEnabled ? videoStream : null;
        this.audio.current.srcObject = audioMuted ? null : audioStream;
        //this.text.current.value = transcription;
    }

    componentDidUpdate() {
        const {
            videoStream,
            audioStream,
            audioMuted,
            videoEnabled,
        } = this.props.feed;

        if (!videoEnabled) {
            this.video.current.srcObject = null;
        } else if (this.video.current.srcObject !== videoStream) {
            this.video.current.srcObject = videoStream;
        }

        if (this.audio.current.srcObject !== audioStream) {
            this.audio.current.srcObject = audioMuted ? null : audioStream;
        }
    }
}

VideoFeed.propTypes = {
    feed: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    message: PropTypes.arrayOf(PropTypes.object).isRequired

};
