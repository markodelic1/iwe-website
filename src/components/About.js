import React from 'react';
import firebase from 'firebase';
import { auth } from '../firebase';
import users from './UsersWithRoles';


class About extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         user: null,
         isAdmin: false,
         isLoaded: false,
         aboutKey: "",
         aboutDescription: "",
         descPlaceHolder: ""
      }
   }

   async componentDidMount() {
      let aboutRef = firebase.database().ref('about').orderByKey().limitToLast(1);
      aboutRef.on('child_added', snapshot => {
         let text = snapshot.val();
         let key = snapshot.key;
         this.setState({
            aboutKey: key,
            aboutDescription: text
         });
      });
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

   handleTextChange = () => {
      let textField = document.getElementById('admin-text-input');
      this.setState({ descPlaceHolder: textField.value });

   }

   submitText = (e) => {
      e.preventDefault();
      if (this.state.descPlaceHolder !== "") {
         this.deletePosts();
         let aboutRef = firebase.database().ref('about');
         let plc = this.state.descPlaceHolder;
         this.setState({ aboutDescription: plc });
         aboutRef.push(this.state.descPlaceHolder);
      } else {
         console.log("error inputting about section");
      }
   }

   deletePosts = () => {
      let aboutRef = firebase.database().ref('about');
      aboutRef.remove();
   }

   editPost = (e) => {
      e.preventDefault();
      document.getElementById('admin-text-input').value = this.state.aboutDescription;
   }

   render() {
      return (
         <div className="page">
            {
               (!this.state.isLoaded) ?
                  <div></div>
                  :
                  <div className="about">
                     <div class="page-content-block">
                        <h1>About US</h1>

                        {
                           (this.state.isAdmin) ?
                              <form className="about-admin-div" onSubmit={this.submitText}>
                                 <textarea type="text" id="admin-text-input" placeholder="Enter About Us Text Here" onChange={this.handleTextChange} className="admin-about-text-input" />
                                 <br />
                                 <input type="submit" className="admin-about-submit-input" />
                                 <button onClick={this.editPost}>Edit Post</button>
                              </form>
                              :
                              <div></div>
                        }
                        <pre className="paragraph-about">{this.state.aboutDescription}</pre>
                     </div>
                  </div>
            }
         </div>
      );
   }
}

export default About;