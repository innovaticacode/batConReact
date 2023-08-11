import React, { useEffect, useState } from 'react';
import { DatePicker, Form, Input, Radio } from 'antd';
import { useSelector } from 'react-redux';
import Router from 'next/router';

const FormChangeUserInformation = () => {
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user) {
            Router.push('/account/login');
        }
    }, [user]);
   
    if (!user) {
        return null; 
    }

    return (
        <>  
        <form className="ps-form--account-setting">
            <div className="ps-form__header">
                <h3>Account Information</h3>
            </div>
            <div className="ps-form__content">
                <div className="form-group">
                    <input
                        className="form-control"
                        type="email"
                        value={user.email}
                        placeholder="Email address"
                    />
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                value={user.name}
                                placeholder="First name"
                            />
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                value={user.phone}
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Address"
                            />
                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                value={user.country}
                                placeholder="Country"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group submit">
                    <button className="ps-btn">Update profile</button>
                </div>
            </div>
        </form></>
      
    );
};

export default FormChangeUserInformation;
