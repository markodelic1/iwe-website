import React from 'react';
import firebase from 'firebase';
import { auth } from '../firebase';
import users from './UsersWithRoles';
import BookingUpload from '../postUpload/postUploadBooking';

class booking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bookPosts: [],
            downloadUrls: [],
            imageNames: [],
            user: null,
            isAdmin: false,
            loaded: false,
            editTitle: "",
            editDesc: "",
            editId: "",
            isEditing: false
        }
    }

    //title, description
    componentDidMount() {
        let bookingRef = firebase.database().ref('booking').orderByKey();
        bookingRef.on('child_added', snapshot => {

            let bookingFromDB = snapshot.toJSON();
            let title = bookingFromDB.title;
            let description = bookingFromDB.description;
            let image = "";
            let booking = { title: title, description: description, image: image, id: snapshot.key }

            this.setState({ bookPosts: [booking].concat(this.state.bookPosts) });
            // this.setState({ imageNames: [imageName].concat(this.state.imageNames) });
        });
        // authorisation
        let currentComp = this;
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentComp.setState({ user: user });
                if (currentComp.isAdmin() === true) {
                    currentComp.setState({ isAdmin: true });
                }
            } else {
                currentComp.setState({ user: null, isAdmin: false });
                console.log("No user detected");
            }
        });
        this.setState({ loaded: true });
    }

    capitaliseFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    isAdmin() {
        for (let i = 0; i < users.length; i++) {
            if ((users[i].email === firebase.auth().currentUser.email) && (users[i].role === "ADMIN")) {
                return true;
            }
        }

        console.log("returning false anyways");
        return false;
    }

    addDownloadURL(imageName, bookingId) {
        firebase
            .storage()
            .ref('rosterHeadshots')
            .child(imageName)
            .getDownloadURL()
            .then(url => {
                let pictureObject = { link: url, id: bookingId };
                this.setState({ downloadUrls: [pictureObject].concat(this.state.downloadUrls) });
            })
            .catch(e => console.log(e));
    }


    getDownloadURL(bookingId) {

        for (let i = 0; i < this.state.downloadUrls.length; i++) {
            if (this.state.downloadUrls[i].id === bookingId) {
                return this.state.downloadUrls[i].link;
            }
        }

    }

    getImageName(bookingId) {
        for (let i = 0; i < this.state.imageNames.length; i++) {
            if (this.state.imageNames[i].id === bookingId) {
                return this.state.imageNames[i].name;
            }
        }
    }

    deletePost(bookingId) {
        let ref = firebase.database().ref('booking').child(bookingId);
        console.log('ref has been created for wrestler posts: booking/' + bookingId);
        // let imName = this.getImageName(bookingId);
        // console.log('image name got: ' + imName);
        // let storageRef = firebase.storage().ref('bookingImages/').child(imName);
        // if (!(this.othersUseImage(imName))) {
        //     storageRef.delete();
        // }
        ref.remove();
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

    editPost(bookingId) {
        if (!this.state.isEditing) {
            this.setState({
                isEditing: true,
                editId: bookingId
            });
            let initialEditTitle = document.getElementById('title-edit-in');
            if (initialEditTitle !== null) {
                this.setState({
                    editTitle: initialEditTitle
                });
            }

            let initialEditDesc = document.getElementById('desc-edit-in');
            if (initialEditDesc !== null) {
                this.setState({
                    editDesc: initialEditDesc
                });
            }

        } else {
            this.setState({
                isEditing: false,
                editId: ""
            });
        }
    }

    handleEditTitleChange = () => {
        let editTitleIn = document.getElementById('title-edit-in');
        this.setState({ editTitle: editTitleIn.value });
    }

    handleEditDescChange = () => {
        let editDescIn = document.getElementById("desc-edit-in");
        this.setState({ editDesc: editDescIn.value });
    }

    submitEdit = (bookId) => {
        console.log("submit is being called");
        let newTitle = this.state.editTitle;
        let newDesc = this.state.editDesc;
        let ref = firebase.database().ref("booking");
        ref.child(bookId).set({ 'title': newTitle, 'description': newDesc });
        window.location.reload();
    }

    render() {
        return (
            <div className="page" >
                {(!this.state.loaded) ?
                    <div></div>
                    :
                    <div className="booking">
                        <h1>Booking</h1>
                        {(this.state.isAdmin) ?
                            <div className="booking-admin-features">
                                <BookingUpload></BookingUpload>
                            </div>
                            :
                            <div></div>
                        }
                        {
                            this.state.bookPosts.map((bookPost, index) => {
                                return (
                                    <div className="booking-container-div" key={bookPost.id}>
                                        {(this.state.isAdmin) ?
                                            <div className="booking-admin-container">
                                                <button
                                                    className="delete-button"
                                                    onClick={() => this.deletePost(bookPost.id)}
                                                >
                                                    Delete Post
                                                </button>

                                                <button className="edit-button" onClick={() => this.editPost(bookPost.id)} >
                                                    Edit Post
                                                </button>

                                                <p className="post-index-number">{index + 1}</p>
                                            </div>
                                            :
                                            <div></div>
                                        }
                                        {(this.state.isEditing && this.state.editId === bookPost.id) === true ?
                                            <div className="book-title-desc-div edit">
                                                <input
                                                    type="text"
                                                    id="title-edit-in"
                                                    className="book-title edit"
                                                    onChange={this.handleEditTitleChange}
                                                    defaultValue={bookPost.title}
                                                />
                                                <textarea
                                                    id="desc-edit-in"
                                                    className="book-description edit"
                                                    onChange={this.handleEditDescChange}
                                                    defaultValue={bookPost.description}
                                                />
                                                <button className="book-edit-submit" onClick={() => { this.submitEdit(bookPost.id) }}>Submit</button>
                                            </div>
                                            :
                                            <div className="book-title-desc-div">
                                                <p className="book-title">{bookPost.title}</p>
                                                <p className="book-description">{bookPost.description}</p>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                }
            </div>
        );
    }
}

export default booking;
