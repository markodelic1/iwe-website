import React from 'react';
import firebase from 'firebase';
import { auth } from '../firebase';
import users from './UsersWithRoles';

class Contact extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         staff: [],
         user: null,
         isAdmin: false,
         loaded: false,
         name: "",
         role: "",
         email: "",
         phone: "",
         isEditing: false,
         editId: "",
         editName: "",
         editRole: "",
         editEmail: "",
         editPhone: ""
      }
   }
   // staffname_nwr_staffrole_rwe_staffemail_ewp_stafftelephone
   // preffered: name, role, email, telephone
   async componentDidMount() {
      let staffRef = firebase.database().ref('staff').orderByKey();
      staffRef.on('child_added', snapshot => {

         let staff = snapshot.toJSON();
         let staffName = staff.name;
         let staffRole = staff.role;
         let staffEmail = staff.email;
         let staffPhone = staff.phone;

         let newStaff = {
            name: staffName,
            role: staffRole,
            email: staffEmail,
            phone: staffPhone,
            id: snapshot.key
         }
         this.setState({ staff: [newStaff].concat(this.state.staff) });
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

   handleNameChange = () => {
      let staffName = document.getElementById('inn');
      this.setState({ name: staffName.value });
   }

   handleRoleChange = () => {
      let staffRole = document.getElementById('inr');
      this.setState({ role: staffRole.value });
   }

   handleEmailChange = () => {
      let staffEmail = document.getElementById('ine');
      this.setState({ email: staffEmail.value });
   }

   handlePhoneChange = () => {
      let staffPhone = document.getElementById('inp');
      this.setState({ phone: staffPhone.value });
   }

   handleUpload = () => {
      if (this.state.name !== "") {
         let name = this.state.name;
         let role = this.state.role;
         let email = this.state.email;
         let phone = this.state.phone;

         let newData = {
            name: name,
            role: role,
            email: email,
            phone: phone
         }
         let staffRef = firebase.database().ref('staff');
         staffRef.push(newData);
      }
   }

   editContact = (editId) => {
      if (this.state.isEditing === true) {
         this.setState({
            isEditing: false,
            editId: ""
         });
      } else {
         this.setState({
            isEditing: true,
            editId: editId
         });
      }
   }

   handleEditName = () => {
      let nameIn = document.getElementById('edit-name-input');
      // if (nameIn.value !== "") {
      this.setState({ editName: nameIn.value });
      // }
   }

   handleEditRole = () => {
      let roleIn = document.getElementById('edit-role-input');
      // if (roleIn.value !== "") {
      this.setState({ editRole: roleIn.value });
      // }
   }

   handleEditEmail = () => {
      let emailIn = document.getElementById('edit-email-input');
      // if (emailIn.value !== "") {
      this.setState({ editEmail: emailIn.value });
      // }

   }

   handleEditPhone = () => {
      let phoneIn = document.getElementById('edit-phone-input');
      // if (phoneIn.value !== "") {
      this.setState({ editPhone: phoneIn.value });
      // }

   }

   submitEdit = (editId, index) => {
      let name = this.state.staff[index].name;
      if (this.state.editName !== "" && this.state.editName !== null) {
         name = this.state.editName
      }
      let role = this.state.staff[index].role;
      if (this.state.editRole !== "" && this.state.editRole !== null) {
         role = this.state.editRole
      }
      let email = this.state.staff[index].email;
      if (this.state.editEmail !== "" && this.state.editEmail !== null) {
         email = this.state.editEmail
      }
      let phone = this.state.staff[index].phone;
      if (this.state.editPhone !== "" && this.state.editPhone !== null) {
         phone = this.state.editPhone
      }
      let ref = firebase.database().ref("staff");
      
      ref.child(editId).set({
         'name': name,
         'role': role,
         'email': email,
         'phone': phone
      });
   }

   deleteContact = (staffId) => {
      let ref = firebase.database().ref("staff").child(staffId);
      ref.remove();
   }

   render() {
      return (
         <div className="page">
            {
               (!this.state.loaded) ?
                  <div></div>
                  :
                  <div className="contact">
                     {
                        (this.state.isAdmin) ?
                           <div className="input-field-container">
                              <p className="add-staff-title">Add New Staff Contact</p>
                              <input type="text" id="inn" onChange={this.handleNameChange} className="staff-input name" placeholder="Enter Name" />
                              <br />
                              <input type="text" id="inr" onChange={this.handleRoleChange} className="staff-input role" placeholder="Enter Role" />
                              <br />
                              <input type="text" id="ine" onChange={this.handleEmailChange} className="staff-input email" placeholder="Enter Email" />
                              <br />
                              <input type="text" id="inp" onChange={this.handlePhoneChange} className="staff-input phone" placeholder="Enter Phone Number" />
                              <br />
                              <button onClick={this.handleUpload} className="upload-button-staff">Upload</button>
                           </div>
                           :
                           <div></div>
                     }
                     <h1>Contact us</h1>
                     <p className="contact-page-description">
                        For details on how to contact us you can see the emails and telephone numbers that we are contactable on here.
                     </p>

                     {
                        this.state.staff.map((staffEx, index) => {
                           return (
                              <div className="contact-container-div">
                                 {(this.state.isAdmin) === true ?
                                    <div className="admin-features-contact">
                                       <button
                                          className="edit-button contact"
                                          onClick={() => this.editContact(staffEx.id)}
                                       >Edit</button>

                                       <button
                                          className="delete-button contact"
                                          onClick={() => this.deleteContact(staffEx.id)}
                                       >Delete</button>

                                       <p className="event-index-number">{index + 1}</p>
                                    </div>
                                    :
                                    <div></div>
                                 }


                                 {(this.state.isEditing === true) && (this.state.editId === staffEx.id) ?
                                    <div className="contact-edit-container">
                                       <input
                                          type="text"
                                          className="contact-name-editor"
                                          id="edit-name-input"
                                          defaultValue={staffEx.name}
                                          onChange={this.handleEditName}
                                       />
                                       <br />
                                       <input
                                          type="text"
                                          className="contact-role-editor"
                                          id="edit-role-input"
                                          defaultValue={staffEx.role}
                                          onChange={this.handleEditRole} />
                                       <br />
                                       <input
                                          type="text"
                                          className="contact-email-editor"
                                          id="edit-email-input"
                                          defaultValue={staffEx.email}
                                          onChange={this.handleEditEmail}
                                       />
                                       <br />
                                       <input
                                          type="text"
                                          className="contact-phone-editor"
                                          id="edit-phone-input"
                                          defaultValue={staffEx.phone}
                                          onChange={this.handleEditPhone}
                                       />
                                       <button
                                          className="submit-button"
                                          onClick={this.submitEdit(staffEx.id, index)}
                                       >Submit Edit</button>
                                    </div>
                                    :
                                    <div className="staff-container-div">
                                       <p>Name: {staffEx.name}</p>
                                       <p>Role: {staffEx.role}</p>
                                       {
                                          (staffEx.email !== "") ?
                                             <div>
                                                <p>Email: {staffEx.email}</p>
                                             </div>
                                             :
                                             <div></div>
                                       }
                                       {
                                          (staffEx.phone !== "") ?
                                             <div>
                                                <p>Tele: {staffEx.phone}</p>
                                             </div>
                                             :
                                             <div></div>
                                       }
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

export default Contact;