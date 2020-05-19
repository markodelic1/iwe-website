import React from 'react';
import { firebase } from '../firebase.js';
import { auth } from '../firebase';
import 'firebase/storage';
import PostUpload from '../postUpload/postIndex';
import users from './UsersWithRoles';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            topPosts: [],
            nextPosts: [],
            imageNames: [],
            downloadUrls: [],
            user: null,
            isAdmin: false,
            loaded: "false"
        };
    }



    componentDidMount() {
        let postRef = firebase.database().ref('postsWLink').orderByKey();
        postRef.on('child_added', snapshot => {
            let post = { text: snapshot.val(), id: snapshot.key };
            let postSplit = post.text.split("_pwi_");
            let imageName = { name: postSplit[1], id: post.id };
            this.addDownloadURL(imageName.name, post.id);
            let textSplit = postSplit[0].split("_twd_");
            
            let newPost = { text: this.capitaliseFirstLetter(textSplit[0]), textDesc: this.capitaliseFirstLetter(textSplit[1]), id: post.id };
            this.setState({ posts: [newPost].concat(this.state.posts) });
            this.setState({ imageNames: [imageName].concat(this.state.imageNames) });
        });
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

    addDownloadURL(imageName, postId) {
        firebase
            .storage()
            .ref('images')
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

    getImageName(postId) {
        for (let i = 0; i < this.state.imageNames.length; i++) {
            if (this.state.imageNames[i].id === postId) {
                return this.state.imageNames[i].name;
            }
        }
    }

    deletePost(postId) {
        let ref = firebase.database().ref('postsWLink/').child(postId);
        let imName = this.getImageName(postId);
        let storageRef = firebase.storage().ref('images').child(imName);
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


    renderTop1Post() {
        let newPostsList = this.state.posts.slice(0, 1);
        console.log("render1 is called");
        return (
            newPostsList.map((topPost, index) => {

                let imagePath = this.getDownloadURL(this.state.posts[0].id);
                if (index < 1) {
                    return (

                        <div className="post-div top1" key={this.state.posts[0].id}>


                            <div className="post-image-div top1">
                                <img
                                    cache="false"
                                    src={imagePath || "https://via.placeholder.com/1920x1080"}
                                    alt="Cannot load"
                                    className="post-image top1"
                                />
                                {(this.state.isAdmin) === true ?
                                    <div>
                                        <button className="delete-button" onClick={() => this.deletePost(this.state.posts[0].id)} >
                                            Delete Post
                                            </button>
                                        {/* <button className="edit-button" onClick={() => this.deletePost(this.state.posts[0].id)} >
                                            Edit Post
                                            </button> */}
                                        <p className="post-index-number">{index + 1}</p>
                                    </div>

                                    :
                                    <div></div>
                                }
                            </div>
                            <div className="post-text-div top1">
                                {
                                    <div className="post-text-both-container">
                                        <p className="post-text top1-title">{this.state.posts[0].text}</p>
                                        <p className="post-text top1-description">{this.state.posts[0].textDesc}</p>
                                    </div>
                                }
                            </div>
                        </div>
                    )
                } else {
                    return <div key={topPost.id}></div>;
                }
            })
        )
    }


    renderTop3Post() {
        let newPostsListNext3 = this.state.posts.slice(1, 4);
        console.log("render3 is called");
        return (
            <div className="post-container next3">
                {
                    newPostsListNext3.map((topPost, index) => {
                        let imagePath = this.getDownloadURL(topPost.id);

                        return (
                            <div className="post-div next3" key={topPost.id}>
                                {(this.state.isAdmin) === true ?
                                    <div className="admin-features-container">

                                        <button className="delete-button" onClick={() => this.deletePost(topPost.id)} >
                                            Delete Post
                                        </button>
                                        {/* <button className="edit-button" onClick={() => this.deletePost(this.state.posts[0].id)} >
                                            Edit Post
                                        </button> */}
                                        <p className="post-index-number">{index + 2}</p>

                                    </div>
                                    :
                                    <div></div>
                                }

                                <div className="post-image-div next3">
                                    <img
                                        cache="false"
                                        src={imagePath || "https://via.placeholder.com/1920x1080"}
                                        alt="Cannot load"
                                        className="post-image next3"
                                    />
                                    <p className="post-text next3-description">{topPost.textDesc}</p>
                                </div>
                                <div className="post-text-div next3">
                                    {
                                        <p className="post-text next3-title">{topPost.text}</p>
                                    }
                                </div>
                            </div>
                        )

                    })
                }
            </div>
        )
    }

    renderPosts() {
        console.log("render rest is called");

        let newPostsListNextAll = this.state.posts.slice(5);
        return (
            <div className="post-container regular">
                {
                    (this.state.loaded === false) ?
                        <div></div>
                        :
                        newPostsListNextAll.map((post, index) => {
                            let imagePath = this.getDownloadURL(post.id);
                            return (
                                <div className="post-div regular" key={post.id}>
                                    <div className="post-image-div regular">
                                        <img
                                            cache="false"
                                            className="post-image regular"
                                            alt="Cannot load"
                                            src={imagePath || "https://via.placeholder.com/1920x1080"}
                                        ></img>
                                    </div>
                                    <div className="post-text-div regular">
                                        <p className="post-text regular-title">{post.text}</p>
                                        <p className="post-text regular-description">{post.textDesc}</p>
                                    </div>

                                    {(this.state.isAdmin) === true ?
                                        <div className="admin-features-container">
                                            <button className="delete-button" onClick={() => this.deletePost(post.id)} >
                                                Delete Post
                                            </button>
                                            {/* <button className="edit-button" onClick={() => this.deletePost(this.state.posts[0].id)} >
                                                Edit Post
                                            </button> */}
                                            <p className="post-index-number">{index + 5}</p>
                                        </div>
                                        :
                                        <div></div>
                                    }
                                </div>
                            )
                        })
                }
            </div>
        )
    }

    render() {
        return (
            <div className="page">
                {(this.state.loaded === true) ?
                    <div className="home">
                        <div className="page-content-block">
                            {(this.state.isAdmin) === true ?
                                <div className="post-uploader">
                                    <PostUpload></PostUpload>
                                </div>
                                :
                                <div></div>
                            }

                            <form className="form-for-posts">

                                <div className="top-post-collection">
                                    {
                                        this.renderTop1Post()
                                    }
                                    {
                                        this.renderTop3Post()
                                    }
                                </div>

                                {
                                    this.renderPosts()
                                }


                            </form>
                        </div>
                    </div>
                :
                    <div className="page-not-loaded" >
                        
                    </div>
                }
            </div>
        );
    }
}

export default Home;
