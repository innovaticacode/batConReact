import React, { Component } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { Form, Input, notification } from 'antd';
import { connect } from 'react-redux';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://127.0.0.1:8000/api/';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleFeatureWillUpdate(e) {
        e.preventDefault();
        e.stopPropagation();
        notification.open({
            message: 'Opp! Something went wrong.',
            description: 'This feature has been updated later!',
            duration: 500,
        });
    }

    handleLoginSubmit = async (values) => {
        const { email, password } = values;
        try {
            const response = await axios.post(API_URL + 'login', {
                email,
                password,
            });

            if (response.data.status === 200) {
                if (response.data.status === 0) {
                    notification.warning({
                        message: 'Account Suspended',
                        description:
                            'Sorry, your account has been suspended because your trial period has expired. Please contact the administrator.',
                        duration: 5,
                    });
                } else {
                    Cookies.set('user', response.data.access_token, {
                        expires: 7,
                    });
                    Cookies.set('isLoggedIn', true);
                    Cookies.set('userID', response.data.id);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    Router.push('/account/my-account');
                }
            } else if (response.data.statusCode === 'error') {
                localStorage.setItem('user', response.data.validation_error);
            } else if (response.data.statusCode === 'failed') {
                localStorage.setItem('user', response.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        return (
            <div className="ps-my-account">
                <div className="container">
                    <Form
                        className="ps-form--account"
                        onFinish={this.handleLoginSubmit.bind(this)}>
                        <ul className="ps-tab-list">
                            <li className="active">
                                <Link href="/account/login">
                                    <a>Login</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/account/register">
                                    <a>Register</a>
                                </Link>
                            </li>
                        </ul>
                        <div className="ps-tab active" id="sign-in">
                            <div className="ps-form__content">
                                <h5>Log In Your Account</h5>
                                <div className="form-group">
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please input your email!',
                                            },
                                        ]}>
                                        <Input
                                            ref={(input) =>
                                                (this.emailInput = input)
                                            }
                                            className="form-control"
                                            type="email"
                                            placeholder="Email address"
                                        />
                                    </Form.Item>
                                </div>
                                <div className="form-group form-forgot">
                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please input your password!',
                                            },
                                        ]}>
                                        <Input
                                            className="form-control"
                                            type="password"
                                            placeholder="Password..."
                                        />
                                    </Form.Item>
                                </div>
                                <div className="form-group">
                                    <div className="ps-checkbox">
                                        <input
                                            className="form-control"
                                            type="checkbox"
                                            id="remember-me"
                                            name="remember-me"
                                        />
                                        <label htmlFor="remember-me">
                                            Rememeber me
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group submit">
                                    <button
                                        type="submit"
                                        className="ps-btn ps-btn--fullwidth">
                                        Login
                                    </button>
                                </div>
                            </div>
                            <div className="ps-form__footer">
                                <p>Connect with:</p>
                                <ul className="ps-list--social">
                                    <li>
                                        <a
                                            className="facebook"
                                            href="#"
                                            onClick={(e) =>
                                                this.handleFeatureWillUpdate(e)
                                            }>
                                            <i className="fa fa-facebook"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="google"
                                            href="#"
                                            onClick={(e) =>
                                                this.handleFeatureWillUpdate(e)
                                            }>
                                            <i className="fa fa-google-plus"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="twitter"
                                            href="#"
                                            onClick={(e) =>
                                                this.handleFeatureWillUpdate(e)
                                            }>
                                            <i className="fa fa-twitter"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="instagram"
                                            href="#"
                                            onClick={(e) =>
                                                this.handleFeatureWillUpdate(e)
                                            }>
                                            <i className="fa fa-instagram"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return state.auth;
};
export default connect(mapStateToProps)(Login);
