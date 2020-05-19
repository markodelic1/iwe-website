import '../index.css';
import React, { } from 'react';
import { firebase, storage } from '../firebase.js';

class RosterUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: { name: "" },
            url: "",
            progress: 0,
            name: "",
            height: "",
            weight: "",
            achievements: "",
            bio: ""
        }
    }

    handleChange = e => {
        e.preventDefault();
        console.log(e.target.files);
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({ image }));
        }
    };

    handleUpload = (e) => {
        e.preventDefault();
        console.log()
        const { image } = this.state;
        const uploadTask = storage.ref(`rosterHeadshots/${image.name}`).put(image);
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
                    .ref("rosterHeadshots")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        this.setState({ url });
                    });
            }
        );
        this.submitEvent(e);
    }

    handleNameChange = () => {
        let wrestlerName = document.getElementById('name-input');
        this.setState({ name: wrestlerName.value });

        console.log("Name is " + wrestlerName.value);
    }

    handleHeightChange = () => {
        let wrestlerHeight = document.getElementById('height-input');
        this.setState({ height: wrestlerHeight.value });
        console.log("height is " + wrestlerHeight.value);
    }

    handleWeightChange = () => {
        let wrestlerWeight = document.getElementById('weight-input');
        this.setState({ weight: wrestlerWeight.value });
        console.log("weight is " + wrestlerWeight.value);
    }

    handleAchievementsChange = () => {
        let wrestlerAchievements = document.getElementById('achievements-input');
        this.setState({ achievements: wrestlerAchievements.value });
        console.log("ach is " + wrestlerAchievements.value);
    }

    handleBioChange = () => {
        let wrestlerBio = document.getElementById('bio-input');
        this.setState({ bio: wrestlerBio.value });
        console.log("bio is " + wrestlerBio.value);
    }


    submitEvent = (e) => {
        e.preventDefault();
        if ((this.state.name !== "")
            && (this.state.achievements !== "")
            && (this.state.image.name !== "")) {
            let name = this.state.name;
            let height = this.state.height;
            let weight = this.state.weight;
            let achievements = this.state.achievements;
            let bio = this.state.bio;

            let newData = {
                name: name,
                height: height,
                weight: weight,
                achievements: achievements,
                bio: bio,
                headshot: this.state.image.name
            }
            let eventRef = firebase.database().ref('roster');
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
            <div className="admin-booking-features">
                <input type="text"
                    className="roster-input name"
                    placeholder="Enter Name Here"
                    id="name-input"
                    onChange={this.handleNameChange}
                />
                <br />
                <input
                    type="text"
                    className="roster-input height"
                    placeholder="Enter Height Here"
                    id="height-input"
                    onChange={this.handleHeightChange}
                />
                <br />
                <input
                    type="text"
                    className="roster-input weight"
                    placeholder="Enter Weight Here"
                    id="weight-input"
                    onChange={this.handleWeightChange}
                />
                <br />
                <textarea
                    className="roster-input achievements"
                    placeholder="Enter Achievements Here"
                    id="achievements-input"
                    onChange={this.handleAchievementsChange}
                />
                <br />
                <textarea
                    type="text"
                    className="roster-input bio"
                    placeholder="Enter Bio Here"
                    id="bio-input"
                    onChange={this.handleBioChange}
                />
                <br />


                <div className="image-upload-booking-div">
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
                        src={this.state.url || "https://via.placeholder.com/100x100"}
                        alt="Uploaded Images"
                        height="100"
                        width="100"
                    />

                </div>

            </div>

        )
    }

}
export default RosterUpload;