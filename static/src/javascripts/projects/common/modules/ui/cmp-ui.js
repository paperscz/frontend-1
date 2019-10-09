// @flow
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialIabCompliant } from 'common/modules/experiments/tests/commercial-iab-compliant';
import { cmpConfig, cmpUi } from '@guardian/consent-management-platform';
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';

const CMP_READY_CLASS = 'cmp-iframe-ready';
const CMP_ANIMATE_CLASS = 'cmp-animate';
const OVERLAY_CLASS = 'cmp-overlay';
const IFRAME_CLASS = 'cmp-iframe';
const CONTAINER_CLASS = 'cmp-container';
let overlay: ?HTMLElement;
let uiPrepared: boolean = false;

const animateCmp = (): Promise<void> =>
    new Promise(resolve => {
        /**
         * Adding CMP_READY_CLASS changes display: none to display: block
         * on the overlay. You can't update this display property and transition
         * other properties of the overlay or the iframe in a single step because the display
         * property overrides the transitions. We therefore have this short setTimeout
         * before adding CMP_ANIMATE_CLASS to transition the overlay opacity and the iframe position.
         */
        setTimeout(() => {
            fastdom.write(() => {
                if (overlay && overlay.parentNode) {
                    overlay.classList.add(CMP_ANIMATE_CLASS);

                    // disable scrolling on body beneath overlay
                    if (document.body) {
                        document.body.classList.add('no-scroll');
                    }

                    resolve();
                }
            });
        }, 0);
    });

const onReadyCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (overlay && overlay.parentNode) {
                overlay.classList.add(CMP_READY_CLASS);
            }
        })
        .then(animateCmp);

const removeCmp = (): Promise<void> =>
    /**
     *  Wait for transition duration (600ms)
     *  to end before removing overlay
     */
    new Promise(resolve => {
        setTimeout(() => {
            fastdom
                .write(() => {
                    if (overlay && overlay.parentNode) {
                        overlay.remove();
                        overlay.classList.remove(CMP_READY_CLASS);
                    }
                })
                .then(resolve);
        }, 600);
    });

const onCloseCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (overlay && overlay.parentNode) {
                // enable scrolling on body beneath overlay
                if (document.body) {
                    document.body.classList.remove('no-scroll');
                }

                overlay.classList.remove(CMP_ANIMATE_CLASS);
            }
        })
        .then(removeCmp);

const onErrorCmp = (error: Error): void => {
    reportError(
        error,
        {
            feature: 'cmp',
        },
        false
    );
};

const prepareUi = (): void => {
    if (uiPrepared) {
        return;
    }

    overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;

    overlay.innerHTML = `<div class="${CONTAINER_CLASS}"><iframe src="${
        cmpConfig.CMP_URL
    }" class="${IFRAME_CLASS}" tabIndex="1"></iframe></div>`;

    cmpUi.setupMessageHandlers(onReadyCmp, onCloseCmp, onErrorCmp);

    uiPrepared = true;
};

const show = (): Promise<boolean> => {
    prepareUi();

    if (document.body && overlay && !overlay.parentElement) {
        document.body.appendChild(overlay);
    }

    return Promise.resolve(true);
};

const handlePrivacySettingsClick = (evt: Event): void => {
    evt.preventDefault();

    show();
};

const showSmartAppBanner = (): void => {
    console.log('*** showSmartAppBanner ***');

    if (!isInVariantSynchronous(commercialIabCompliant, 'variant')) {
        const meta = document.createElement('meta');
        meta.name = 'apple-itunes-app';
        // content="app-id=409128287
        // app-argument=https://www.theguardian.com/uk-news/2019/oct/09/arron-banks-apologises-for-xenophobic-tweet-targeting-merkel
        // affiliate-data=ct=newsmartappbanner&pt=304191"
        meta.content =
            'app-id=409128287, app-argument=https://www.theguardian.com/uk-news/2019/oct/09/arron-banks-apologises-for-xenophobic-tweet-targeting-merkel, affiliate-data=ct=newsmartappbanner&pt=304191';
        if (document && document.head) {
            document.head.appendChild(meta);
        }
    }
};

export const addPrivacySettingsLink = (): void => {
    if (!isInVariantSynchronous(commercialIabCompliant, 'variant')) {
        return;
    }

    const privacyLink: ?HTMLElement = document.querySelector(
        'a[data-link-name=privacy]'
    );

    if (privacyLink) {
        const privacyLinkListItem: ?Element = privacyLink.parentElement;

        if (privacyLinkListItem) {
            const newPrivacyLink: HTMLElement = privacyLink.cloneNode(false);

            newPrivacyLink.dataset.linkName = 'privacy-settings';
            newPrivacyLink.removeAttribute('href');
            newPrivacyLink.innerText = 'Privacy settings';

            const newPrivacyLinkListItem: Element = privacyLinkListItem.cloneNode(
                false
            );

            newPrivacyLinkListItem.appendChild(newPrivacyLink);

            privacyLinkListItem.insertAdjacentElement(
                'afterend',
                newPrivacyLinkListItem
            );

            newPrivacyLink.addEventListener(
                'click',
                handlePrivacySettingsClick
            );
        }
    }
};

export const consentManagementPlatformUi = {
    id: 'cmpUi',
    canShow: (): Promise<boolean> => {
        if (isInVariantSynchronous(commercialIabCompliant, 'variant')) {
            return Promise.resolve(cmpUi.canShow());
        }

        showSmartAppBanner();

        return Promise.resolve(false);
    },
    show,
};

// Exposed for testing purposes only
export const _ = {
    reset: (): void => {
        if (overlay) {
            if (overlay.parentNode) {
                overlay.remove();
            }
            overlay = undefined;
        }
        uiPrepared = false;
    },
    CMP_READY_CLASS,
    CMP_ANIMATE_CLASS,
    OVERLAY_CLASS,
    IFRAME_CLASS,
    onReadyCmp,
    onCloseCmp,
};
