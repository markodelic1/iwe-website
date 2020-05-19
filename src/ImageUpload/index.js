
import React, { Component } from 'react';
import { firebase, storage } from '../firebase.js';

class ImageUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            url: "",
            progress: 0
        };
    }

    // componentDidMount() {
    //     let postRef = firebase.database().ref('posts').orderByKey();
    //     postRef.on('child_added', snapshot => {
    //         let post = { text: snapshot.val(), id: snapshot.key };
    //         this.setState({ posts: [post].concat(this.state.posts) });
    //     })
    // }

    addPost(e) {
        e.preventDefault();
        if(this.inputEl.value !== ""){
            firebase.database().ref('posts').push(this.inputEl.value);
            this.inputEl.value = "";
        }
    }


    handleChange = e => {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({ image }));
        }
    };

    handleUpload = () => {
        const { image } = this.state;
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
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
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        this.setState({ url });
                    });
            }
        );
    };

    render() {
        return (
            <div className="center">
                <br />
                <h2 className="green-text">React Firebase Image Uploader</h2>
                <br />
                <div className="file-field input-field">
                    <div className="btn">
                        <span>File: </span>
                        <input type="file" onChange={this.handleChange} />
                    </div>
                <br />
                    {/* <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" />
                    </div> */}
                </div>
                <button
                    onClick={this.handleUpload}
                    className="waves-effect waves-light btn"
                >
                    Upload
            </button>
                <div className="row">
                    <progress value={this.state.progress} max="100" className="progress" />
                </div>
                <br />
                <br />
                <img
                    src={this.state.url || "https://via.placeholder.com/1920x1080"}
                    alt="Uploaded Images"
                    height="108"
                    width="192"
                />
            </div>
        );
    }
}

export default ImageUpload;