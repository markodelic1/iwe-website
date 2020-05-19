
import '../index.css';
import React, { Component } from 'react';
import { firebase, storage } from '../firebase.js';

class PostUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            url: "",
            progress: 0,
            text: "",
            descText: "",
            posts: []
            //add image url and path here
        };
    }

    componentDidMount() {
        let postRef = firebase.database().ref('postsWLink').orderByKey();
        postRef.on('child_added', snapshot => {
            let post = { text: snapshot.val() + this.state.posts.length + 1, id: snapshot.key };
            this.setState({ posts: [post].concat(this.state.posts) });
        })
    }

    addPost(e) {
        e.preventDefault();
        if (this.inputEl.value !== "") {
            firebase.database().ref('postsWLink').push(this.inputEl.value + "postNo" + this.state.posts.length + 1);
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
        this.addPostFromButton();
    };

    storePostTitle = () => {
        var postText = document.getElementById('inputText');
        this.setState({ text: postText.value });
    }

    storePostDescription = () => {
        var postText = document.getElementById('inputText2');
        this.setState({ descText: postText.value });
    }

    addPostFromButton = (imageName) => {
        if (this.state.text !== "") {
            firebase.database().ref('postsWLink').push(this.state.text + "_twd_" + this.state.descText + "_pwi_" + this.state.image.name);
        }
    }

    render() {
        return (
            <div className="post-upload-div">
                <br />
                <h2 className="green-text">
                    Here you can choose a file to upload
                    with text to accompany the post.
                    Make sure your images are of a 16:9 aspect ratio
                    (or 1920x1080 resolution) or the bottom of the
                    image will be cropped.
                </h2>
                <br />
                <div className="input-container">
                    <div className="file-field input-field">
                        <div className="btn">
                            <span>File: </span>
                            <input type="file" onChange={this.handleChange} />
                        </div>
                        <br />
                    </div>
                    <input type="text" id="inputText" placeholder="Title text here" onChange={this.storePostTitle} className="input1" ></input>
                    <br/>
                    <input type="text" id="inputText2" placeholder="Post description text here" onChange={this.storePostDescription} className="input2" ></input>
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
                    height="108"
                    width="192"
                />
            </div>
        );
    }
}

export default PostUpload;