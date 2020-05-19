import React from 'react';
import firebase from 'firebase';
import { auth } from '../firebase';
import users from './UsersWithRoles';
import Linkify from 'react-linkify';
import EventUpload from '../postUpload/postUploadEvent';


class eventspage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            currEventTitle: "",
            currEventLink: "",
            currEventDesc: "",
            currEventPic: "",
            currEventDate: "",
            downloadUrls: [],
            imageNames: [],
            isAdmin: false,
            loaded: false,
            editTitle: "",
            editLink: "",
            editDesc: "",
            editPic: "",
            editDate: "",
            editId: "",
            isEditing: false
        }
    }

    componentDidMount() {
        let eventRef = firebase.database().ref('events').orderByKey();
        eventRef.on("child_added", snapshot => {
            let eventFromDB = snapshot.toJSON();
            let title = eventFromDB.title;
            let desc = eventFromDB.description;
            let pic = eventFromDB.image;
            this.addDownloadURL(pic, snapshot.key);
            let date = eventFromDB.date;
            let link = eventFromDB.link;

            let newEvent = { title: title, desc: desc, pic: pic, date: date, link: link, id: snapshot.key };
            this.setState({ events: [newEvent].concat(this.state.events) });
            let imageName = { name: pic, id: snapshot.key }
            this.setState({ imageNames: [imageName].concat(this.state.imageNames) });
        });
        let currentComp = this;
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentComp.setState({ user: user })
                if (currentComp.isAdmin() === true) {
                    currentComp.setState({ isAdmin: true });
                }
            } else {
                currentComp.setState({ user: null, isAdmin: false });
                console.log("no user detected for contact page")
            }
        })
        this.setState({ loaded: true });
    }

    isAdmin() {
        for (let i = 0; i < users.length; i++) {
            if ((users[i].email === firebase.auth().currentUser.email) && (users[i].role === "ADMIN")) {
                return true;
            }
        }
        return false;
    }

    addDownloadURL(imageName, postId) {
        firebase
            .storage()
            .ref('eventImages')
            .child(imageName)
            .getDownloadURL()
            .then(url => {
                let pictureObject = { link: url, id: postId };
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


    sumbitEvent = (e) => {
        e.preventDefault();
        if ((this.state.currEventTitle !== "")
            && (this.state.currEventDesc !== "")
            && (this.state.currEventLink !== "")) {
            let title = this.state.currEventTitle;
            let desc = this.state.currEventDesc;
            let pic = this.state.currEventPic;
            let date = this.state.currEventDate;
            let link = this.state.currEventLink;
            let newData =
                title + "_twd_" +
                desc + "_dwp_" +
                pic + "_pwd_" +
                date + "_dwl_" +
                link;
            let eventRef = firebase.database().ref('events');
            eventRef.push(newData);
        }
    }

    deleteEvent(eventId) {
        let ref = firebase.database().ref("events").child(eventId);
        let imName = this.getImageName(eventId);
        let storageRef = firebase.storage().ref('eventImages').child(eventId);
        if (!(this.othersUseImage(imName))) {
            storageRef.delete();
        }
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

    getImageName(eventId) {
        for (let i = 0; i < this.state.imageNames.length; i++) {
            if (this.state.imageNames[i].id === eventId) {
                return this.state.imageNames[i].name;
            }
        }
    }

    handleTitleChange = () => {
        let eventTitle = document.getElementById('title-edit-input');
        this.setState({ editTitle: eventTitle.value });
    }

    handleDescChange = () => {
        let eventDesc = document.getElementById('desc-edit-input');
        this.setState({ editDesc: eventDesc.value });
    }

    handleLinkChange = () => {
        let eventLink = document.getElementById('link-edit-input');
        this.setState({ editLink: eventLink.value });
    }

    handleDateChange = () => {
        let eventDate = document.getElementById('date-edit-input');
        this.setState({ editDate: eventDate.value });
    }

    editPost(eventId) {
        console.log("this.state.isEditing = " + this.state.isEditing);
        if (!this.state.isEditing) {
            this.setState({ 
                isEditing:true, 
                editId:eventId
            });
            // this.setState({
            //     isEditing: true,
            //     editId: eventId
            // });
            let initialEditTitle = document.getElementById('title-input');
            console.log("initialEditTitle set with value "+ initialEditTitle.value);
            if (initialEditTitle.value !== "") {
                this.setState({
                    editTitle: initialEditTitle.value
                });
                console.log("edit title called with value "+ this.state.editTitle);
            }

            let initialEditDesc = document.getElementById('desc-input');
            if (initialEditDesc.value !== "") {
                this.setState({
                    editDesc: initialEditDesc.value
                });
            }

            let initialEditLink = document.getElementById('link-input');
            if (initialEditLink.value !== "") {
                this.setState({
                    editLink: initialEditLink.value
                });
            }

            let initialEditDate = document.getElementById('date-input');
            if (initialEditDate.value !== "") {
                this.setState({
                    editDate: initialEditDate.value
                });
            }

        } else {
            this.setState({
                isEditing: false,
                editId: ""
            });
        }
    }

    submitEdit = (eventId, index) => {
        console.log("submit is being called" + eventId);
        
        let newTitle = this.state.events[index].title;
        if(this.state.editTitle !== "") {
            newTitle = this.state.editTitle;
            console.log("new title set from edit");
        }

        let newDesc = this.state.events[index].desc;
        if(this.state.editDesc !== "") {
            newDesc = this.state.editDesc;
            console.log("new description set from edit");
        }
        
        let newLink = this.state.events[index].link;
        if(this.state.editLink !== "") {
            newLink = this.state.editLink;
            console.log("new link set from edit");
        }
        
        let newDate = this.state.events[index].date;
        if(this.state.editDate !== "") {
            newDate = this.state.editDate;
            console.log("new date set from edit");
        }
        
        let ref = firebase.database().ref("events");
        ref.child(eventId).set({
            'description': newDesc,
            'image': this.state.events[index].pic,
            'link': newLink,
            'date': newDate,
            'title': newTitle
        });
        // window.location.reload();
    }

    render() {
        return (
            <div className="page">
                {(this.state.loaded === true) ?
                    <div className="eventspage">
                        <h1>Events</h1>
                        {
                            (this.state.isAdmin === true) ?
                                <div>
                                    <EventUpload></EventUpload>
                                </div>
                                :
                                <div></div>
                        }
                        <div className="event-div-container">
                            {
                                this.state.events.map((currEvent, index) => {
                                    return (
                                        <div className="event-div" key={currEvent.id}>
                                            {(this.state.isAdmin === true) ?
                                                <div className="admin-features-container">
                                                    <button className="delete-button event" onClick={() => this.deleteEvent(currEvent.id)} >
                                                        Delete Post
                                                    </button>

                                                    <button className="edit-button event" onClick={() => this.editPost(currEvent.id)} >
                                                        Edit Post
                                                    </button>

                                                    <p className="event-index-number">{index + 1}</p>
                                                </div>
                                                :
                                                <div></div>
                                            }
                                            {
                                                (this.state.isEditing && this.state.editId === currEvent.id) ?
                                                    <div className="edit-event-div">
                                                        <input type="text"
                                                            className="event-input title"
                                                            placeholder="Enter Event Title Here"
                                                            id="title-edit-input"
                                                            defaultValue={currEvent.title}
                                                            onChange={this.handleTitleChange}
                                                        />
                                                        <br />
                                                        <input
                                                            type="text"
                                                            className="event-input desc"
                                                            placeholder="Enter Event Description Here"
                                                            id="desc-edit-input"
                                                            defaultValue={currEvent.desc}
                                                            onChange={this.handleDescChange}
                                                        />
                                                        <br />
                                                        <input
                                                            type="text"
                                                            className="event-input link"
                                                            placeholder="Enter Event Link Here"
                                                            id="link-edit-input"
                                                            defaultValue={currEvent.link}
                                                            onChange={this.handleLinkChange}
                                                        />
                                                        <br />
                                                        <input
                                                            type="text"
                                                            className="event-input date"
                                                            placeholder="Enter Event Date Here"
                                                            id="date-edit-input"
                                                            defaultValue={currEvent.date}
                                                            onChange={this.handleDateChange}
                                                        />
                                                        <br />
                                                        <button className='event-edit-submit' onClick={() => { this.submitEdit(currEvent.id, index) }}>Submit</button>
                                                    </div>
                                                    :
                                                    <div className="normal-event-div">
                                                        <p className="event-object title">{currEvent.title}</p>
                                                        <p className="event-object description">{currEvent.desc}</p>
                                                        <p className="event-object date">{currEvent.date}</p>
                                                        <img src={this.getDownloadURL(currEvent.id)} className="event-image" alt="cant-get-src"></img>
                                                        <Linkify>{currEvent.link}</Linkify>
                                                    </div>
                                            }


                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    :
                    <div className="page-not-loaded" >
                        {/* <object className="load-page-spinner" data={} ></object>  */}
                    </div>
                }
            </div>
        );
    }
}

export default eventspage;
