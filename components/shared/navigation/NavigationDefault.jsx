import React, { Component } from 'react';
import { notification } from 'antd';

import LanguageSwicher from '../headers/modules/LanguageSwicher';

class NavigationDefault extends Component {
   

    handleFeatureWillUpdate(e) {
        e.preventDefault();
        notification.open({
            message: 'Opp! Something went wrong.',
            description: 'This feature has been updated later!',
            duration: 500,
        });
    }

    render() {
        return (
            <nav className="navigation">
                <div className="ps-container">
                    <div className="navigation__left">
                    </div>
                    <div className="navigation__right">
                     
                        <ul className="navigation__extra" > 
                        <li>
                               BatCon Slogan, Lets Shop!
                            </li>
                            <li>
                                <LanguageSwicher />
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default NavigationDefault;
