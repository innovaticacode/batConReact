import React, { Component } from 'react';
import Link from 'next/link';

class CompanyPortfolio extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
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
                                            <p>username@gmail.com</p>
                                        </figure>
                                    </div>
                                    <div className="ps-widget__content">
                                        <ul>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Notification</a>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Messages</a>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Company Details</a>
                                                </Link>
                                            </li>
                                            <li className="active">
                                                <Link href="/account/company-portfolio">
                                                    <a>
                                                        Company Portfolio
                                                        (Vendors)
                                                    </a>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Account Details</a>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Premium Features</a>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/account/my-account">
                                                    <a>Logout</a>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </aside>
                            </div>
                        </div>
                        <div className="col-lg-9">
                            <div className="ps-page__content">
                                <div className="ps-page__dashboard">
                                    <table className="ps-table w-100">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div
                                                        className="ps-empty-table"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            alignItems:
                                                                'center',
                                                        }}>
                                                        <p>
                                                            <i className="fa fa-check-circle mr-3"></i>
                                                            No order has been
                                                            made yet.
                                                        </p>
                                                        <button className="ps-btn ps-btn--primary">
                                                            Add New Product
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default CompanyPortfolio;
