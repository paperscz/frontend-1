// @flow
import { ConsentManagementPlatform } from '@guardian/consent-management-platform/lib/ConsentManagementPlatform';
import React from 'react';
import ReactDOM from 'react-dom';

export const init = () => {
    const container = document.createElement('div');
    container.id = 'cmpContainer';

    if (document.body) {
        document.body.appendChild(container);
    }

    ReactDOM.render(
        <ConsentManagementPlatform
            onClose={() => {
                console.log('*** onClose ***');
                ReactDOM.unmountComponentAtNode(container);
            }}
        />,
        container
    );
};
