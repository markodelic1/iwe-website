import '../index.css';
import React, { } from 'react';
import { firebase, storage } from '../firebase.js';

class EventUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            url: "",
            progress: 0,
            title: "",
            desc: "",
            date: "",
            link: ""
        }
    }

    handleChange = e => {
        e.preventDefault();
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({ image }));
        }
    };

    handleUpload = () => {
        const { image } = this.state;
        const uploadTask = storage.ref(`eventImages/${image.name}`).put(image);
        uploadTask.on(
            "state_changed",
            snapshot => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                this.setState({ progress });
            },
            error => {
                console.log(error);
            },
            () => {
                storage
                    .ref("eventImages")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        this.setState({ url });
                    });
            }
        );
        this.submitEvent();
    }

    handleTitleChange = () => {
        let eventTitle = document.getElementById('title-input');
        this.setState({ title: eventTitle.value });
    }

    handleDescChange = () => {
        let eventDesc = document.getElementById('desc-input');
        this.setState({ desc: eventDesc.value });
    }

    handleLinkChange = () => {
        let eventLink = document.getElementById('link-input');
        this.setState({ link: eventLink.value });
    }

    handleDateChange = () => {
        let eventDate = document.getElementById('date-input');
        this.setState({ date: eventDate.value });
    }

    submitEvent = () => {
        if ((this.state.title !== "")
            && (this.state.desc !== "")
            && (this.state.link !== "")
            && (this.state.date !== "")
            && (this.state.image.name !== "")) {
            let title = this.state.title;
            let desc = this.state.desc;
            let date = this.state.date;
            let link = this.state.link;
            let newData = {
                title: title,
                description: desc,
                image: this.state.image.name,
                date: date,
                link: link
            }

            let eventRef = firebase.database().ref('events');
            eventRef.push(newData);
        }
    }
    //make this work like other uploader, e should prevent default


    render() {
        return (
            <form className="admin-event-features">
                <input type="text"
                    className="event-input title"
                    placeholder="Enter Event Title Here"
                    id="title-input"
                    onChange={this.handleTitleChange}
                />
                <br />
                <input
                    type="text"
                    className="event-input desc"
                    placeholder="Enter Event Description Here"
                    id="desc-input"
                    onChange={this.handleDescChange}
                />
                <br />
                <input
                    type="text"
                    className="event-input link"
                    placeholder="Enter Event Link Here"
                    id="link-input"
                    onChange={this.handleLinkChange}
                />
                <br />
                <input
                    type="text"
                    className="event-input date"
                    placeholder="Enter Event Date Here"
                    id="date-input"
                    onChange={this.handleDateChange}
                />
                <br />
                {/* placeholder for picture upload */}
                {/* <input type="submit" /> */}
                {/* <br /> */}
                <div className="file-field input-field">
                    <div className="btn">
                        <span>File: </span>
                        <input type="file" onChange={this.handleChange} />
                    </div>
                </div>
                <div className="upload-button-container">
                    <button
                        onClick={this.handleUpload}
                        className="waves-effect waves-light btn"
                    >Upload</button>
                    <div className="row">
                        <progress value={this.state.progress} max="100" className="progress" />
                    </div>
                </div>
                <br />
                <br />
                <img
                    src={this.state.url || "https://via.placeholder.com/1920x1080"}
                    alt="Uploaded Images"
                    height="100"
                    width="100"
                />
            </form>

        )
    }

}
export default EventUpload;