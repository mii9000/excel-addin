import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import App from './components/App';
import './index.css';

/* Initialize Office JS */
Office.onReady(() => {
    // Initialize FluentUI icons
    initializeIcons();
    
    // Render the component
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}); 