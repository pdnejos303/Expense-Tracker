// src/components/PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { auth } from '../firebase';

function PrivateRoute({ element: Component, ...rest }) {
  return auth.currentUser ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default PrivateRoute;
