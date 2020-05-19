import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Error from './components/Error';
import Booking from './components/BookingEnq';
import Events from './components/EventsPage';
import Roster from './components/Roster';
import Navigation from './components/Navigation';
import './index.css';

 
class App extends Component {
  constructor(){
    super();
    this.state = {
      user: null
    }
  }

  render() {
    return (      
       <BrowserRouter>
        <div>
          <Navigation />
            <Switch>
             <Route exact path="/" component={Home} />
             <Route path="/about" component={About}/>
             <Route path="/contact" component={Contact}/>
             <Route path="/booking" component={Booking}/>
             <Route path="/eventspage" component={Events}/>
             <Route path="/roster" component={Roster}/>
            <Route component={Error}/>
           </Switch>
        </div> 
      </BrowserRouter>
    );
  }
}
 
export default App;