import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DonutWars from './DonutWars';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DonutWars />, document.getElementById('root'));
registerServiceWorker();
