import React, { useState, useEffect } from 'react';

const MartketPlace4SiteFeatures = () => {
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [returnCount, setReturnCount] = useState(0);
    const [paymentCount, setPaymentCount] = useState(0);
    const [supportCount, setSupportCount] = useState(0);

    useEffect(() => {
        const getRandomNumber = () => Math.floor(Math.random() * 10000);

        const interval = setInterval(() => {
            setDeliveryCount(getRandomNumber());
            setReturnCount(getRandomNumber());
            setPaymentCount(getRandomNumber());
            setSupportCount(getRandomNumber());
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, []);
    return (
        <div className="ps-site-features">
            <div className="container">
                <div className="ps-block--site-features ps-block--site-features-2">
                    <div className="ps-block__item">
                        <div className="ps-block__left">
                            <i className="icon-rocket"></i>
                        </div>
                        <div className="ps-block__right">
                            <h4>Vendors</h4>
                            <p>For all orders over ${deliveryCount}</p>
                        </div>
                    </div>
                    <div className="ps-block__item">
                        <div className="ps-block__left">
                            <i className="icon-sync"></i>
                        </div>
                        <div className="ps-block__right">
                            <h4>{returnCount} Materials</h4>
                            <p>If goods have problems</p>
                        </div>
                    </div>
                    <div className="ps-block__item">
                        <div className="ps-block__left">
                            <i className="icon-credit-card"></i>
                        </div>
                        <div className="ps-block__right">
                            <h4>Secure Payment</h4>
                            <p>{paymentCount}% secure payment</p>
                        </div>
                    </div>
                    <div className="ps-block__item">
                        <div className="ps-block__left">
                            <i className="icon-bubbles"></i>
                        </div>
                        <div className="ps-block__right">
                            <h4>24/7 Support</h4>
                            <p>{supportCount} customers supported</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MartketPlace4SiteFeatures;
