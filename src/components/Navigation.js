import React from 'react';
import '../index.css';
import logo from '../images/IWE_formal.svg';
import { NavLink } from 'react-router-dom';
import { provider, auth } from '../firebase';

class Navigation extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         user: null
      }
      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
   }

   componentDidMount() {
      auth.onAuthStateChanged((user) => {
         if (user) {
            this.setState({ user });
         }
      })
   }

   login() {
      auth.signInWithPopup(provider)
         .then((result) => {
            const user = result.user;
            this.setState({
               user
            });
         });
   }

   logout() {
      auth.signOut()
         .then(() => {
            this.setState({
               user: null
            });
         });
   }


   render() {
      return (
         <div className="nav-container">
            {/* <svg className="nav-bar-image" src={logo} alt="" /> */}

            <object type="image/svg+xml" data={logo} className="nav-bar-image">SVG</object>

            <div className="navigation-bar">
               <NavLink className="navlink" to="/">Home</NavLink>
               <NavLink className="navlink" to="/booking">Booking Enquiries</NavLink>
               <NavLink className="navlink" to="/roster">Roster</NavLink>
               <NavLink className="navlink" to="/eventspage">Events</NavLink>
               <NavLink className="navlink" to="/about">About</NavLink>
               <NavLink className="navlink" to="/contact">Contact</NavLink>
               {this.state.user ?
                  <button className="log out" onClick={this.logout}>Log out</button>
                  :
                  <button className="log in" onClick={this.login}>Log in</button>
               }
               {
                  this.state.user ?
                     <div>
                        <div className="user-profile">
                           <img className="user-profile-picture" src={this.state.user.photoURL} alt="" />
                        </div>
                     </div>
                     :
                     <div></div>
               }
            </div>
         </div>

      );
   }

}

export default Navigation;