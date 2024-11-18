// src/components/Customer/CustomerLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';
import Footer from './Footer';

function CustomerLayout() {
    return (
        <>
            <CustomerNavbar />
            <Outlet /> {/* Renders the matched child route */}
            <Footer />
        </>
    );
}

export default CustomerLayout;
