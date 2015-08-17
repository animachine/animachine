import {Project} from './models'

function create(projectSource) {
  return new Project(projectSource)
}

export default {
  create
}

import {createStore} from 'redux';
import app from '../reducers';

export default createStore(app);
