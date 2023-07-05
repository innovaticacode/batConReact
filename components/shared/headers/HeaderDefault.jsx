import React, { useEffect } from 'react';
import Logo from '~/components/elements/common/Logo';
import SearchHeader from '~/components/shared/headers/modules/SearchHeader';
import NavigationDefault from '~/components/shared/navigation/NavigationDefault';
import HeaderActions from '~/components/shared/headers/modules/HeaderActions';
import { stickyHeader } from '~/utilities/common-helpers';
import Menu from '../../elements/menu/Menu';
import menuData from '../../../public/static/data/menu';

const HeaderDefault = () => {
    useEffect(() => {
        if (process.browser) {
            window.addEventListener('scroll', stickyHeader);
        }
    }, []);

    return (
        <>
        <header
            className="header header--1"
            data-sticky="true"
            id="headerSticky">
            <NavigationDefault />
            <div className="header__top">
                <div className="ps-container">
                    <div className="header__left">
                        <Logo />
                    </div>
                    <div className="header__center">
                        <SearchHeader />
                    </div>
                    <div className="header__right">
                        <HeaderActions />
                    </div>
                </div>
                <Menu  
                source={menuData.menuPrimary.menu_1}
                className="menu"
                />
            </div>
            
        </header>

        
        </>
    );
};

export default HeaderDefault;
