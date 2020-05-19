import '../index.css';
import React, { } from 'react';
import { firebase, storage } from '../firebase.js';

class BookingUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: { name: "" },
            url: "",
            progress: 0,
            title: "",
            description: "",
            hasImage: false
        }
        this.changeHasImage = this.changeHasImage.bind(this);
        // this.submitEvent = this.submitEvent.bind(this);
    }

    handleChange = e => {
        e.preventDefault();
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({ image }));
        }
    };

    handleUpload = (e) => {
        e.preventDefault();
        const { image } = this.state;
        const uploadTask = storage.ref(`bookingImages/${image.name}`).put(image);
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
                    .ref("bookingImages")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        this.setState({ url });
                    });
            }
        );
        this.submitEvent(e);
    }

    handleTitleChange = () => {
        let titleIn = document.getElementById('title-input');
        this.setState({ title: titleIn.value });
    }

    handleDescChange = () => {
        let descIn = document.getElementById('desc-input');
        this.setState({ description: descIn.value });
    }

    submitEvent = (e) => {
        e.preventDefault();
        if ((this.state.title !== "")
            && (this.state.description !== "")
            && (this.state.image.name !== "")) {
            let title = this.state.title;
            let description = this.state.description;
            let newData = {
                title: title,
                description: description,
                image: this.state.image.name
            }
            let eventRef = firebase.database().ref('booking');
            eventRef.push(newData);
        } else if ((this.state.title !== "")
            && (this.state.description !== "")) {
            let title = this.state.title;
            let description = this.state.description;
            let image = "";
            let newData = {
                title: title,
                description: description,
                image: image
            }
            let eventRef = firebase.database().ref('booking');
            eventRef.push(newData);
        }
    }

    changeHasImage(e) {
        e.preventDefault();
        this.setState({ hasImage: !(this.state.hasImage) });
        console.log("hasImage: " + this.state.hasImage);
    }
    //make this work like other uploader, e should prevent default


    render() {
        return (
            <form className="admin-booking-features">
                <input type="text"
                    className="booking-input title"
                    placeholder="Enter Title Here"
                    id="title-input"
                    onChange={this.handleTitleChange}
                />
                <br />
                <textarea
                    className="booking-input desc"
                    placeholder="Enter Description Here"
                    id="desc-input"
                    onChange={this.handleDescChange}
                />
                <br />

                <button className="image-yes-no" onClick={this.changeHasImage}>Add Image</button>
                {(this.state.hasImage) ?
                    <div className="image-upload-booking-div">
                        <div className="file-field input-field">
                            <div className="btn">
                                <span>File: </span>
                                <input type="file" onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="upload-button-container">
                            <button
                                onClick={() => this.handleUpload}
                                className="waves-effect waves-light btn"
                            >Upload (Images are not rendered here yet so this should do nothing)</button>
                            <div className="row">
                                <progress value={this.state.progress} max="100" className="progress" />
                            </div>
                        </div>
                        <br />
                        <br />
                        <img
                            src={this.state.url || "https://via.placeholder.com/100x100"}
                            alt="Uploaded Images"
                            height="100"
                            width="100"
                        />

                    </div>
                    :
                    <div>
                        <button className="submitter" onClick={this.submitEvent}></button>
                    </div>
                }
            </form>

        )
    }

}
export default BookingUpload;