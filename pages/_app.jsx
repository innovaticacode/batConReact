import React, { useEffect, useState } from 'react';
import { wrapper } from '~/store/store';
import { CookiesProvider } from 'react-cookie';
import MasterLayout from '~/components/layouts/MasterLayout';
import '~/public/static/fonts/Linearicons/Font/demo-files/demo.css';
import '~/public/static/fonts/font-awesome/css/font-awesome.min.css';
import '~/public/static/css/bootstrap.min.css';
import '~/public/static/css/slick.min.css';
import '~/public/static/css/style.css';
import '~/scss/style.scss';
import '~/scss/home-default.scss';
import '~/scss/market-place-1.scss';
import '~/scss/market-place-2.scss';
import '~/scss/market-place-3.scss';
import '~/scss/market-place-4.scss';
import '~/scss/electronic.scss';
import '~/scss/furniture.scss';
import '~/scss/organic.scss';
import '~/scss/technology.scss';
import '~/scss/autopart.scss';
import '~/scss/electronic.scss';
import Head from 'next/head';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { actionTypes, setUser } from '~/store/auth/action';
import { useRouter } from 'next/router';

const API_URL = 'https://enisreact.innovaticacode.com/laravel/public/api/';

function App({ Component, pageProps }) {
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        setTimeout(function () {
            document.getElementById('__next').classList.add('loaded');
        }, 100);
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (Cookies.get().userID) {
                    const response = await axios.get(
                        API_URL + 'users/' + Cookies.get().userID
                    );
                    const userData = response.data;
                    dispatch(setUser(userData.data));
                    if (userData?.data.status == 0) {
                        router.push('/account/login');
                        toast.warning(
                            'Sorry, your account has been suspended because your trial period has expired. Please contact the administrator.'
                        );
                    }
                } else {
                    router.push('/account/login');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserData();
    }, [Cookies.get(), dispatch]);

    return (
        <>
            <Head>
                <title>Martfury - React eCommerce Template</title>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta name="format-detection" content="telephone=no" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="author" content="nouthemes" />
                <meta
                    name="keywords"
                    content="Martfury, React, eCommerce, Template"
                />
                <meta
                    name="description"
                    content="Martfury - React eCommerce Template"
                />
            </Head>
            <CookiesProvider>
                <MasterLayout>
                    <Component {...pageProps} />
                </MasterLayout>
            </CookiesProvider>
        </>
    );
}

export default wrapper.withRedux(App);
