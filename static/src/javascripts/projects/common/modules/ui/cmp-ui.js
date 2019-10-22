// @flow
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { cmpUi } from '@guardian/consent-management-platform';
// import reportError from 'lib/report-error';
import raven from 'lib/raven';

// const onErrorCmp = (error: Error): void => {
//     reportError(
//         error,
//         {
//             feature: 'cmp',
//         },
//         false
//     );
// };

const show = (): Promise<boolean> => {
    require.ensure(
        [],
        require => {
            raven.context(
                {
                    tags: {
                        feature: 'cmp',
                    },
                },
                require('common/modules/cmp-ui').init,
                []
            );
        },
        'cmp'
    );

    return Promise.resolve(true);
};

// const handlePrivacySettingsClick = (evt: Event): void => {
//     evt.preventDefault();

//     show();
// };

// export const addPrivacySettingsLink = (): void => {
//     if (!isInVariantSynchronous(commercialCmpUiIab, 'variant')) {
//         return;
//     }

//     const privacyLink: ?HTMLElement = document.querySelector(
//         'a[data-link-name=privacy]'
//     );

//     if (privacyLink) {
//         const privacyLinkListItem: ?Element = privacyLink.parentElement;

//         if (privacyLinkListItem) {
//             const newPrivacyLink: HTMLElement = privacyLink.cloneNode(false);

//             newPrivacyLink.dataset.linkName = 'privacy-settings';
//             newPrivacyLink.removeAttribute('href');
//             newPrivacyLink.innerText = 'Privacy settings';

//             const newPrivacyLinkListItem: Element = privacyLinkListItem.cloneNode(
//                 false
//             );

//             newPrivacyLinkListItem.appendChild(newPrivacyLink);

//             privacyLinkListItem.insertAdjacentElement(
//                 'afterend',
//                 newPrivacyLinkListItem
//             );

//             newPrivacyLink.addEventListener(
//                 'click',
//                 handlePrivacySettingsClick
//             );
//         }
//     }
// };

export const consentManagementPlatformUi = {
    id: 'cmpUi',
    canShow: (): Promise<boolean> => {
        if (isInVariantSynchronous(commercialCmpUiIab, 'variant')) {
            return Promise.resolve(cmpUi.canShow());
        }

        return Promise.resolve(false);
    },
    show,
};

// Exposed for testing purposes only
export const _ = {
    // reset: (): void => {
    //     if (overlay) {
    //         if (overlay.parentNode) {
    //             overlay.remove();
    //         }
    //         overlay = undefined;
    //     }
    //     uiPrepared = false;
    // },
    // CMP_READY_CLASS,
    // CMP_ANIMATE_CLASS,
    // OVERLAY_CLASS,
    // IFRAME_CLASS,
    // onReadyCmp,
    // onCloseCmp,
};
