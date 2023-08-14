import React, { Component, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import DashboardContent from '../tabs/DashboardContent';
import FirstRegistrationFormContent from '../tabs/FirstRegistrationFormContent';
import { notification } from 'antd';
import CompanyRegistrationFormContent from '../tabs/CompanyRegistrationFormContent';
import CreateProduct from '../tabs/CreateProduct';
import MyProducts from '../tabs/MyProducts';

const MyAccount = () => {
    const API_URL = 'https://enisreact.innovaticacode.com/laravel/public/api/';
    const login = useSelector((state) => state.auth.user);
    const [user, setUser] = useState(login);
    const router = useRouter();
    const [activeAccount, setActiveAccount] = useState(false);
    const [
        showCompleteRegistrationForm,
        setShowCompleteRegistrationForm,
    ] = useState(false);
    const [showFirstRegistrationForm, setShowFirstRegistrationForm] = useState(
        true
    );
    const [activeContent, setActiveContent] = useState('dashboard');
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        if (!user) {
            router.push('/account/login');
        } else {
            if (user.firstRegistrationFormEntries.length > 0) {
                setShowCompleteRegistrationForm(true);
            }

            if (
                user.firstRegistrationFormEntries.length > 0 &&
                user.companyRegistrationFormEntries.length > 0
            ) {
                setActiveAccount(true);
            }
        }

        function kebabToCamel(kebabCase) {
            return kebabCase.replace(/-([a-z])/g, (match, letter) =>
                letter.toUpperCase()
            );
        }

        const userPermissionData =
            user?.rolePermissions.map((permission) => {
                const key = permission.permissions[0].title;
                const kebabCase = key.toLowerCase().split(' ').join('-');

                const slug = kebabToCamel(kebabCase);

                return { key, slug };
            }) || [];

        console.log(userPermissionData);
        setPermissions(userPermissionData);
    }, [user]);

    if (!user) {
        return null;
    }

    const updateUserAndOpenCompanyRegistration = async () => {
        try {
            const response = await axios.get(API_URL + 'users/' + user.id);
            const updatedUser = response.data.data;
            setUser(updatedUser);
            setShowCompleteRegistrationForm(true);
            setActiveContent('companyRegistration');
        } catch (error) {
            console.error(error);
        }
    };

    const updateUserAndActiveAccount = async () => {
        setActiveAccount(true);
        notification.success({
            message: 'Account Information Completed',
            description:
                'You have successfully completed your account information. Thank you!',
        });
        setActiveContent('dashboard');
    };

    const handleContentChange = (contentName) => {
        setActiveContent(contentName);
    };

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
        <section className="ps-my-account ps-page--account ps-section--account">
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
                                        <li
                                            className={
                                                activeContent === 'dashboard'
                                                    ? 'active'
                                                    : ''
                                            }>
                                            <a
                                                onClick={() =>
                                                    handleContentChange(
                                                        'dashboard'
                                                    )
                                                }>
                                                Dashboard
                                            </a>
                                        </li>
                                        {!activeAccount && (
                                            <>
                                                <li
                                                    className={
                                                        activeContent ===
                                                        'firstRegistration'
                                                            ? 'active'
                                                            : ''
                                                    }>
                                                    <a
                                                        onClick={() =>
                                                            handleContentChange(
                                                                'firstRegistration'
                                                            )
                                                        }>
                                                        First Registration
                                                    </a>
                                                </li>
                                                <li
                                                    className={
                                                        activeContent ===
                                                        'companyRegistration'
                                                            ? 'active'
                                                            : ''
                                                    }>
                                                    <a
                                                        onClick={() => {
                                                            if (
                                                                showCompleteRegistrationForm
                                                            ) {
                                                                handleContentChange(
                                                                    'companyRegistration'
                                                                );
                                                            } else {
                                                                notification.warning(
                                                                    {
                                                                        message:
                                                                            'Please complete the First Registration',
                                                                        description:
                                                                            'Please fill in the First Registration form first.',
                                                                    }
                                                                );
                                                            }
                                                        }}>
                                                        Company Registration
                                                    </a>
                                                </li>
                                            </>
                                        )}

                                        {activeAccount &&
                                            permissions.length > 0 &&
                                            permissions.map((permission) => (
                                                <li
                                                    key={permission.key}
                                                    className={
                                                        activeContent ===
                                                        permission.slug
                                                            ? 'active'
                                                            : ''
                                                    }>
                                                    <a
                                                        onClick={() =>
                                                            handleContentChange(
                                                                permission.slug
                                                            )
                                                        }>
                                                        {permission.key}
                                                    </a>
                                                </li>
                                            ))}

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
                            {activeContent === 'dashboard' && (
                                <DashboardContent user={user} />
                            )}
                            {activeContent === 'firstRegistration' && (
                                <FirstRegistrationFormContent
                                    user={user}
                                    updateUserAndOpenCompanyRegistration={
                                        updateUserAndOpenCompanyRegistration
                                    }
                                />
                            )}
                            {activeContent === 'companyRegistration' && (
                                <CompanyRegistrationFormContent
                                    user={user}
                                    updateUserAndActiveAccount={
                                        updateUserAndActiveAccount
                                    }
                                />
                            )}
                            {activeContent === 'createProduct' && (
                                <CreateProduct user={user} />
                            )}
                            {activeContent === 'myProducts' && (
                                <MyProducts user={user} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MyAccount;
