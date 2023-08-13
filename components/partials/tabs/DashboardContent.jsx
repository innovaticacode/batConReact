import React from 'react';
import Link from 'next/link';

const DashboardContent = ({ user }) => {
    return (
        <div className="ps-page__dashboard">
            <p>
                Hello <strong>{user.email}</strong>!
            </p>
            <p>
                From your account dashboard you can view your{' '}
                <Link href="/account/orders">
                    <a>recent orders</a>
                </Link>
                , manage your{' '}
                <Link href="/account/user-information">
                    <a>shipping and billing addresses</a>
                </Link>
                , and{' '}
                <Link href="/account/user-information">
                    <a>edit your password and account details</a>
                </Link>
                .
            </p>
        </div>
    );
};

export default DashboardContent;
