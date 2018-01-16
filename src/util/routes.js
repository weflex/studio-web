import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {requireAuthentication} from '../components/AuthenticatedPage';
import App from '../containers/App';
import LoginIndex from '../containers/Login';
import SignupIndex from '../containers/Signup';
import WeflexCalendar from '../containers/WeflexCalendar';
import Booking from '../containers/Booking';
import ClassPackage from '../containers/ClassPackage/list';
import ClassTemplate from '../containers/ClassTemplate/list';
import Member from '../containers/Member';
import Report from '../containers/Report';
import Settings from '../containers/Settings';
import Trainer from '../containers/Trainer';

export default(
  <Route path="/" component={App}>
    <IndexRoute component={LoginIndex} />
    <Route path="login" component={LoginIndex} />
    <Route path="signup" component={SignupIndex} />
    <Route path="calendar" component={requireAuthentication(WeflexCalendar, App)} />
    <Route path="booking" component={requireAuthentication(Booking, App)} />
    <Route path="booking/order" component={requireAuthentication(Booking, App)} />
    <Route path="booking/ptSession" component={requireAuthentication(Booking, App)} />
    <Route path="/class/template" component={requireAuthentication(ClassTemplate, App)} />
    <Route path="/class/template/add" component={requireAuthentication(ClassTemplate, App)} />
    <Route path="/class/package" component={requireAuthentication(ClassPackage, App)} />
    <Route path="/class/package/add" component={requireAuthentication(ClassPackage, App)} />
    <Route path="member" component={requireAuthentication(Member, App)} />
    <Route path="trainer" component={requireAuthentication(Trainer, App)} />
    <Route path="report" component={requireAuthentication(Report, App)} />
    <Route path="settings" component={requireAuthentication(Settings, App)} />
  </Route>
);
