// @flow
import React, { Component } from 'preact-compat';
import reqwest from 'reqwest';
import ophan from 'ophan/ng';
import reportError from 'lib/report-error';

type AccountCreationFormProps = {
    csrfToken: string,
    accountToken: string,
    email: string,
    onAccountCreated: () => {},
};

class AccountCreationForm extends Component<
    AccountCreationFormProps,
    {
        password?: string,
        isLoading?: boolean,
        hasError?: boolean,
        errorReason?: string,
    }
> {
    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            hasError: false,
        });

        reqwest({
            url: '/password/guest',
            method: 'post',
            data: {
                csrfToken: this.props.csrfToken,
                token: this.props.accountToken,
                password: this.state.password,
            },
            success: () => {
                ophan.record({
                    component: 'set-password',
                    value: 'set-password',
                });
                this.props.onAccountCreated();
            },
            error: response => {
                reportError(
                    Error(response),
                    {
                        feature: 'identity-create-account-upsell',
                    },
                    false
                );
                try {
                    const apiError = JSON.parse(response.responseText)[0];
                    this.setState({
                        hasError: true,
                        errorReason: apiError.description,
                    });
                } catch (exception) {
                    this.setState({ hasError: true });
                }
            },
            complete: () => {
                this.setState({ isLoading: false });
            },
        });
    };

    handlePasswordChange = (ev: Event) => {
        if (!(ev.target instanceof HTMLInputElement)) {
            return;
        }
        this.setState({ password: ev.target.value });
    };

    render() {
        const { hasError, errorReason, isLoading } = this.state;
        const { email } = this.props;
        return (
            <form onSubmit={this.onSubmit}>
                <ul className="identity-forms-fields">
                    <li aria-live="polite">
                        {hasError && (
                            <div className="form__error" role="alert">
                                {errorReason || 'Oops. Something went wrong'}
                            </div>
                        )}
                    </li>
                    {email && (
                        <li id="email_field" aria-hidden>
                            <label
                                className="identity-forms-input-wrap"
                                htmlFor="email">
                                <div className="identity-forms-label">
                                    Email
                                </div>
                                <input
                                    className="identity-forms-input"
                                    type="email"
                                    id="email"
                                    value={email}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    aria-required="true"
                                    required
                                    disabled
                                />
                            </label>
                        </li>
                    )}
                    <li id="password_field">
                        <label
                            className="identity-forms-input-wrap"
                            htmlFor="password">
                            <div className="identity-forms-label">Password</div>
                            <input
                                className="identity-forms-input"
                                type="password"
                                id="password"
                                name="password"
                                value={this.state.password}
                                autoComplete="off"
                                onChange={this.handlePasswordChange}
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck="false"
                                aria-required="true"
                                required
                            />
                        </label>
                    </li>
                    <li>
                        {isLoading ? (
                            <button
                                disabled
                                className="manage-account__button manage-account__button--light manage-account__button--center">
                                Hang on...
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="manage-account__button manage-account__button--icon manage-account__button--main">
                                Create an account
                            </button>
                        )}
                    </li>
                </ul>
            </form>
        );
    }
}

export type { AccountCreationFormProps };
export { AccountCreationForm };