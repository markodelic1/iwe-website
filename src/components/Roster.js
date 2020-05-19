import React from 'react';
import firebase from 'firebase';
import { auth } from '../firebase';
import users from './UsersWithRoles';
import RosterUpload from '../postUpload/postUploadRoster';
import { storage } from '../firebase.js';

class roster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wrestlerList: [],
            user: null,
            isAdmin: false,
            imageNames: [],
            image: { name: "" },
            downloadUrls: [],
            loaded: false,
            isEditing: false,
            editId: "",
            editName: "",
            editHeight: "",
            editWeight: "",
            editAchievements: "",
            editBio: ""
        }
    }

    //  headshot, stats ( height, weight, achievements, bio, scrolling pics at bottom )

    async componentDidMount() {
        let rosterRef = firebase.database().ref('roster').orderByKey();
        rosterRef.on("child_added", snapshot => {
            let wrestlerFromDB = snapshot.toJSON();
            let name = wrestlerFromDB.name;
            let height = wrestlerFromDB.height;
            let weight = wrestlerFromDB.weight;
            let achievements = wrestlerFromDB.achievements;
            let bio = wrestlerFromDB.bio;
            let id = snapshot.key;
            let imageName = { name: wrestlerFromDB.headshot, id: id }
            let headshot = this.addDownloadURL(wrestlerFromDB.headshot, snapshot.key);
            let wrestler = {
                name: name,
                height: height,
                weight: weight,
                achievements: achievements,
                bio: bio,
                headshot: headshot,
                id: id
            };
            this.setState({
                wrestlerList: [wrestler].concat(this.state.wrestlerList),
                imageNames: [imageName].concat(this.state.imageNames)
            })
        })
        let currentComp = this;
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentComp.setState({ user: user });
                if (this.isAdmin() === true) {
                    this.setState({ isAdmin: true });
                }
            } else {
                this.setState({ user: null, isAdmin: false });
            }
        })
        this.setState({ isLoaded: true });
    }

    isAdmin() {
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === firebase.auth().currentUser.email && (users[i].role === "ADMIN")) {
                return true;
            }
        }
        return false;
    }

    addDownloadURL(imageName, rosterId) {
        console.log(imageName);
        firebase
            .storage()
            .ref('rosterHeadshots')
            .child(imageName)
            .getDownloadURL()
            .then(url => {
                let pictureObject = { link: url, id: rosterId };
                this.setState({ downloadUrls: [pictureObject].concat(this.state.downloadUrls) });
            })
            .catch(e => console.log(e));
    }


    getDownloadURL(postId) {

        for (let i = 0; i < this.state.downloadUrls.length; i++) {
            if (this.state.downloadUrls[i].id === postId) {
                return this.state.downloadUrls[i].link;
            }
        }

    }

    getImageName(postId) {
        for (let i = 0; i < this.state.imageNames.length; i++) {
            if (this.state.imageNames[i].id === postId) {
                return this.state.imageNames[i].name;
            }
        }
    }

    deletePost(wrestlerId) {
        let ref = firebase.database().ref('roster/').child(wrestlerId);
        console.log('ref has been created for wrestler posts: roster/' + wrestlerId);
        let imName = this.getImageName(wrestlerId);
        console.log('image name got: ' + imName);
        let storageRef = firebase.storage().ref('rosterHeadshots').child(imName);
        if (!(this.othersUseImage(imName))) {
            storageRef.delete();
        }
        ref.remove();
        window.location.reload();
    }

    othersUseImage(imageName) {
        let imageCount = 0;
        for (let i = 0; i < this.state.imageNames.length; i++) {
            console.log(this.state.imageNames[i]);
            if (this.state.imageNames[i].name.includes(imageName)) {
                imageCount++;
            }
        }
        if (imageCount > 1) {
            return true;
        } else {
            return false;
        }
    }

    editPost(rosterId) {
        if (!this.state.isEditing) {
            this.setState({
                isEditing: true,
                editId: rosterId
            });
            console.log("editPost is being called: " + rosterId);
            let initialEditName = document.getElementById('name-edit-in');
            if (initialEditName !== null) {
                this.setState({
                    editName: initialEditName
                });
            }

            let initialEditHeight = document.getElementById('height-edit-in');
            if (initialEditHeight !== null) {
                this.setState({
                    editHeight: initialEditHeight
                });
            }
            let initialEditWeight = document.getElementById('weight-edit-in');
            if (initialEditWeight !== null) {
                this.setState({
                    editWeight: initialEditWeight
                });
            }
            let initialEditAchievements = document.getElementById('achievements-edit-in');
            if (initialEditAchievements !== null) {
                this.setState({
                    editAchievements: initialEditAchievements
                });
            }
            let initialEditBio = document.getElementById('bio-edit-in');
            if (initialEditBio !== null) {
                this.setState({
                    editBio: initialEditBio
                });
            }

        } else {
            this.setState({
                isEditing: false,
                editId: ""
            });
        }
    }

    handleEditNameChange = () => {
        let editIn = document.getElementById('name-edit-in');
        this.setState({ editName: editIn.value });
    }

    handleEditHeightChange = () => {
        let editIn = document.getElementById('height-edit-in');
        this.setState({ editHeight: editIn.value });
    }

    handleEditWeightChange = () => {
        let editIn = document.getElementById('weight-edit-in');
        this.setState({ editWeight: editIn.value });
    }

    handleEditAchievementsChange = () => {
        let editIn = document.getElementById('achievements-edit-in');
        this.setState({ editAchievements: editIn.value });
    }

    handleEditBioChange = () => {
        let editIn = document.getElementById('bio-edit-in');
        this.setState({ editBio: editIn.value });
    }

    handleEditImageChange = (e) => {
        e.preventDefault();
        if (e.target.files[0]) {
            const image = e.target.files[0];
            this.setState(() => ({ image }));
        }
    }

    handleUpload = (id, index) => {
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
        console.log("image name is "+ image.name);
        let dbRef = firebase.database().ref('roster').child(id).set({
            'headshot':image.name,
            'name': this.state.wrestlerList[index].name,
            'height': this.state.wrestlerList[index].height,
            'weight': this.state.wrestlerList[index].weight,
            'bio': this.state.wrestlerList[index].bio,
            'achievements': this.state.wrestlerList[index].achievements,
        });
    }

    submitEdit = (id, index) => {
        let newName = "";
        if (this.state.editName !== "") {
            newName = this.state.editName;
        } else {
            newName = this.state.wrestlerList[index].name;
        }

        let newHeight = "";
        if (this.state.editHeight !== "") {
            newHeight = this.state.editHeight;
        } else {
            newHeight = this.state.wrestlerList[index].height;
        }

        let newWeight = "";
        if (this.state.editWeight !== "") {
            newWeight = this.state.editWeight;
        } else {
            newHeight = this.state.wrestlerList[index].weight;
        }

        let newAchievements = "";
        if (this.state.editAchievements !== "") {
            newAchievements = this.state.editAchievements;
        } else {
            newAchievements = this.state.wrestlerList[index].achievements;
        }

        let newBio = "";
        if (this.state.editBio !== "") {
            newBio = this.state.editBio;
        } else {
            newBio = this.state.wrestlerList[index].bio;
        }

        let ref = firebase.database().ref("roster");
        ref.child(id).set({
            'name': newName,
            'height': newHeight,
            'weight': newWeight,
            'achievements': newAchievements,
            'bio': newBio,
            'headshot': this.state.imageNames[index].name
        });
        window.location.reload();
    }

    render() {
        return (
            <div className="page" >
                {
                    (!this.state.isLoaded) ?
                        <div></div>
                        :
                        <div className="roster">
                            <div className="page-content-block">
                                <h1>Roster</h1>
                                {
                                    (this.state.isAdmin) === true ?
                                        <div className="roster-uploader">
                                            <RosterUpload></RosterUpload>
                                        </div>
                                        :
                                        <div></div>
                                }
                                {
                                    this.state.wrestlerList.map((wrestler, index) => {
                                        let imagePath = this.getDownloadURL(wrestler.id)
                                        return (
                                            <div className="roster-container" key={index}>
                                                {(this.state.isAdmin === true) ?
                                                    <div className="roster-post-admin">
                                                        <button className="delete-button" onClick={() => this.deletePost(wrestler.id)} >
                                                            Delete Post
                                                        </button>

                                                        <button className="edit-button" onClick={() => this.editPost(wrestler.id)} >
                                                            Edit Post
                                                        </button>

                                                        <p className="post-index-number">{index + 1}</p>
                                                    </div>
                                                    :
                                                    <div></div>
                                                }
                                                {((this.state.isEditing === true) && (this.state.editId === wrestler.id)) ?
                                                    <div className="roster-second-div">
                                                        <div className="roster-image-div">
                                                            <img className="roster-headshot" src={imagePath} >
                                                            </img>
                                                            <input className="picture-input-edit roster" type="file" onChange={this.handleEditImageChange} />
                                                            <button className="picture-button-edit roster" onClick={() => this.handleUpload(wrestler.id, index)}>Submit picture change</button>
                                                        </div>
                                                        <div className="text-field-container-edit">
                                                            <input
                                                                id="name-edit-in"
                                                                className="roster-text-field name"
                                                                defaultValue={wrestler.name}
                                                                onChange={this.handleEditNameChange}
                                                            />
                                                            <input
                                                                id="height-edit-in"
                                                                className="roster-text-field height"
                                                                defaultValue={wrestler.height}
                                                                onChange={this.handleEditHeightChange}
                                                            />
                                                            <input
                                                                id="weight-edit-in"
                                                                className="roster-text-field weight"
                                                                defaultValue={wrestler.weight}
                                                                onChange={this.handleEditWeightChange}
                                                            />
                                                            <input
                                                                id="achievements-edit-in"
                                                                className="roster-text-field achievements"
                                                                defaultValue={wrestler.achievements}
                                                                onChange={this.handleEditAchievementsChange}
                                                            />
                                                            <input
                                                                id="bio-edit-in"
                                                                className="roster-text-field bio"
                                                                defaultValue={wrestler.bio}
                                                                onChange={this.handleEditBioChange}
                                                            />
                                                            <button
                                                                className="roster-edit-submit"
                                                                onClick={() => { this.submitEdit(wrestler.id, index) }}
                                                            >Submit</button>

                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="roster-second-div">
                                                        <div className="roster-image-div">
                                                            <img className="roster-headshot" src={imagePath}></img>

                                                        </div>
                                                        <div className="text-field-container">
                                                            <p className="roster-text-field name">{wrestler.name}</p>
                                                            <p className="roster-text-field height">Height: {wrestler.height}</p>
                                                            <p className="roster-text-field weight">Weight: {wrestler.weight}</p>
                                                            <p className="roster-text-field achievements">Achievements: {wrestler.achievements}</p>
                                                            <p className="roster-text-field bio">Bio: {wrestler.bio}</p>
                                                        </div>
                                                    </div>

                                                }
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default roster;
