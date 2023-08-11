import React, { Component, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const MyAccount = () => {
    const API_URL = 'http://127.0.0.1:8000/api/';
    const user = useSelector((state) => state.auth.user);
    const [activeAccount, setActiveAccount] = useState(false);
    const [
        showCompleteRegistrationForm,
        setShowCompleteRegistrationForm,
    ] = useState(false);
    const [showFirstRegistrationForm, setShowFirstRegistrationForm] = useState(
        false
    );

    console.log(user);
    const router = useRouter();
    useEffect(() => {
        if (!user) {
            router.push('/account/login');
        } else {
            if (user.firstRegistrationFormEntries.length == 0) {
                setShowFirstRegistrationForm(true);
            } else if (user.firstRegistrationFormEntries.length > 0) {
                setShowCompleteRegistrationForm(true);
            }
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const onLogoutHandler = () => {
        axios
            .post(API_URL + 'logout')
            .then((response) => {
                Cookies.set('user', '');
                Cookies.set('userID', '');
                Cookies.set('isLoggedIn', false);
                localStorage.removeItem('user');
                router.push('/account/login');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <section className="ps-my-account ps-page--account">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-md-12">
                        <div className="ps-section__left">
                            <aside className="ps-widget--account-dashboard">
                                <div className="ps-widget__header">
                                    <img src="/static/img/users/3.jpg" />
                                    <figure>
                                        <figcaption>Hello</figcaption>
                                        <p>{user.email}</p>
                                    </figure>
                                </div>
                                <div className="ps-widget__content">
                                    <ul>
                                        <li className="active">
                                            <Link href="/account/my-account">
                                                <a>Dashboard</a>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/account/first-registration">
                                                <a>First Registration</a>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/account/my-account">
                                                <a>Company Registration</a>
                                            </Link>
                                        </li>
                                        <li onClick={onLogoutHandler}>
                                            <a>
                                                <i className="icon-power-switch"></i>
                                                Logout
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="ps-page__content">
                            <div className="ps-page__dashboard">
                                <p>
                                    Hello <strong>{user.email}</strong>!
                                </p>
                                <p>
                                    From your account dashboard you can view
                                    your{' '}
                                    <Link href="/account/orders">
                                        <a>recent orders</a>
                                    </Link>
                                    , manage your{' '}
                                    <Link href="/account/user-information">
                                        <a>shipping and billing addresses</a>
                                    </Link>
                                    , and{' '}
                                    <Link href="/account/user-information">
                                        <a>
                                            edit your password and account
                                            details
                                        </a>
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MyAccount;
