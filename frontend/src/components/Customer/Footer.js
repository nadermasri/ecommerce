import React from 'react';
import { Box, Typography, Link, Grid, IconButton, Paper } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

function Footer() {
    return (
        <Box sx={{ backgroundColor: '#1C1C1C', color: '#fff', padding: '3rem 0' }}>
            <Grid container spacing={4} justifyContent="center">
                {/* About Section */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        backgroundColor: '#333',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',  // Center content horizontally
                        textAlign: 'center',   // Center text inside the Paper
                        maxWidth: '90%',
                        marginLeft: 'auto',
                        marginRight: 'auto',  // Center the Paper container
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#fff' }}>About Us</Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#fff' }}>
                            Explore the essence of Lebanon through a curated collection of authentic Lebanese products. From delicious traditional snacks to handcrafted heritage items, we bring the spirit of Lebanon to you.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Quick Links */}
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6" gutterBottom>Quick Links</Typography>
                    <Link href="/home" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                        Home
                    </Link>
                    <Link href="/products" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                        Shop Products
                    </Link>
                    <Link href="/about" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                        Our Story
                    </Link>
                    <Link href="/contact" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                        Contact Us
                    </Link>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6" gutterBottom>Contact Us</Typography>
                    <Typography variant="body2">
                        Email: support@lebaneseheritage.com
                    </Typography>
                    <Typography variant="body2">
                        Phone: +961 1 234 567
                    </Typography>
                    <Typography variant="body2">
                        Address: 456 Beirut Heritage St, Beirut, Lebanon
                    </Typography>
                </Grid>

                {/* Social Media Links */}
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6" gutterBottom>Follow Us</Typography>
                    <Box>
                        <IconButton href="https://facebook.com/lebaneseheritage" target="_blank" color="inherit">
                            <Facebook />
                        </IconButton>
                        <IconButton href="https://twitter.com/lebaneseheritage" target="_blank" color="inherit">
                            <Twitter />
                        </IconButton>
                        <IconButton href="https://instagram.com/lebaneseheritage" target="_blank" color="inherit">
                            <Instagram />
                        </IconButton>
                        <IconButton href="https://linkedin.com/company/lebaneseheritage" target="_blank" color="inherit">
                            <LinkedIn />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>

            {/* Copyright */}
            <Box sx={{ textAlign: 'center', marginTop: '3rem' }}>
                <Typography variant="body2">
                    &copy; {new Date().getFullYear()} Lebanese Heritage Shop. All rights reserved. Crafted with love for Lebanon's legacy.
                </Typography>
            </Box>
        </Box>
    );
}

export default Footer;
