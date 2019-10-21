// @flow
import { CMP } from '@guardian/consent-management-platform/lib/Cmp-Ui-Component';
import ReactDOM from 'react-dom';

export const init = () => {
    const container = document.createElement('div');

    if (document.body) {
        document.body.appendChild(container);
    }

    ReactDOM.render(CMP(), container);
};
