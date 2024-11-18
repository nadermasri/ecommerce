import React, { useState, useEffect, useContext } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Box,
    InputBase,
    Badge,
    Tooltip,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    ListItemIcon,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    AccountCircle,
    ExpandLess,
    ExpandMore,
    Category as CategoryIcon,
    LocalOffer as PromotionsIcon,
    AdminPanelSettings as AdminIcon,
    Login as LoginIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryService';
import { AuthContext } from '../../context/AuthContext';
import Cart from '../Customer/Cart'; // Cart Component (to be created)
import UserLogin from '../Shared/UserLogin'; // Customer Login Component
import AdminLogin from '../Shared/AdminLogin'; // Admin Login Component
import '../../assets/css/customNavbar.css'; // Import custom CSS
import logo from '../../Resources/image/logo.png';

// Styled components for the search bar
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha('#000', 0.05),
    '&:hover': {
        backgroundColor: alpha('#000', 0.1),
    },
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
        width: '30ch',
    },
}));

function CustomerNavbar() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logoutUser } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [anchorElCategories, setAnchorElCategories] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [adminLoginDialogOpen, setAdminLoginDialogOpen] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState({});

    useEffect(() => {
        const getCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        getCategories();
    }, []);

    // Handlers for Categories Menu
    const handleCategoriesMenuOpen = (event) => {
        setAnchorElCategories(event.currentTarget);
    };

    const handleCategoriesMenuClose = () => {
        setAnchorElCategories(null);
        setCategoryMenuOpen({});
    };

    // Handlers for User Menu
    const handleUserMenuOpen = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorElUser(null);
    };

    // Handler for Logout
    const handleLogout = async () => {
        await logoutUser();
        navigate('/login');
    };

    // Handler for Search
    const handleSearch = () => {
        if (searchTerm.trim() !== '') {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // Handle Enter key in search
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Handler for Mobile Drawer
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handler for Category Collapse in Mobile Drawer
    const handleCategoryClick = (categoryId) => {
        setCategoryMenuOpen(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    return (
        <>
            {/* AppBar */}
            <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #003366, #2c3e50)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <Toolbar>
                    {/* Mobile Menu Button */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'white' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo Image */}
                    <Link to="/home" style={{ flexGrow: 1 }}>
                        <img
                            src= {logo} // Replace with your logo's file path
                            alt="Lebanese Heritage Shop"
                            style={{ height: '40px', width: 'auto' }}
                        />
                    </Link>

                    {/* Navigation Links (Hidden on Mobile) */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/home"
                            sx={{ textTransform: 'none', fontSize: '16px', marginRight: '1rem', '&:hover': { color: '#f1c40f' } }}
                        >
                            Home
                        </Button>

                        <Button
                            color="inherit"
                            onClick={handleCategoriesMenuOpen}
                            sx={{ textTransform: 'none', fontSize: '16px', marginRight: '1rem', '&:hover': { color: '#f1c40f' } }}
                        >
                            Products
                        </Button>
                        <Menu
                            anchorEl={anchorElCategories}
                            open={Boolean(anchorElCategories)}
                            onClose={handleCategoriesMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            sx={{ mt: '0.5rem' }}
                        >
                            {categories.map((category) => (
                                <MenuItem
                                    key={category.id}
                                    onClick={() => {
                                        navigate(`/categories/${category.id}`);
                                        handleCategoriesMenuClose();
                                    }}
                                    sx={{ fontSize: '14px', color: '#2c3e50' }}
                                >
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Menu>

                        <Button
                            color="inherit"
                            component={Link}
                            to="/promotions"
                            sx={{ textTransform: 'none', fontSize: '16px', '&:hover': { color: '#f1c40f' } }}
                            startIcon={<PromotionsIcon />}
                        >
                            Promotions
                        </Button>
                    </Box>

                    {/* Search Bar */}
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon sx={{ color: 'white' }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            sx={{ color: 'white' }}
                        />
                    </Search>
                    <Button
                        color="inherit"
                        onClick={handleSearch}
                        sx={{ mr: 2, textTransform: 'none', color: 'white', fontWeight: '500', '&:hover': { color: '#f1c40f' } }}
                    >
                        Search
                    </Button>

                    {/* Shopping Cart Icon */}
                    <Tooltip title="View Cart">
                        <IconButton color="inherit" onClick={() => setCartOpen(true)} sx={{ color: 'white' }}>
                            <Badge badgeContent={4} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User Account Icon */}
                    {isAuthenticated ? (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0, ml: 2, color: 'white' }}>
                                    <AccountCircle sx={{ fontSize: 30 }} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={handleUserMenuClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>Profile</MenuItem>
                                <MenuItem onClick={() => { navigate('/orders'); handleUserMenuClose(); }}>Orders</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            {/* Customer Login Button */}
                            <Button
                                color="inherit"
                                startIcon={<LoginIcon />}
                                onClick={() => setLoginDialogOpen(true)}
                                sx={{ textTransform: 'none', fontSize: '16px', ml: 1, color: 'white' }}
                            >
                                Login
                            </Button>

                            {/* Admin Login Button */}
                            <Button
                                color="inherit"
                                startIcon={<AdminIcon />}
                                onClick={() => setAdminLoginDialogOpen(true)}
                                sx={{ textTransform: 'none', fontSize: '16px', ml: 1, color: 'white' }}
                            >
                                Admin
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: 250, 
                        backgroundColor: 'var(--body-color)', 
                        color: 'var(--title-color)' 
                    },
                }}
            >
                <Box
                    sx={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--body-color)', height: '100%' }}
                >
                    <Typography variant="h6" component={Link} to="/home" sx={{ textDecoration: 'none', color: 'var(--title-color)' }}>
                        Beirut Treasures
                    </Typography>
                    <Divider sx={{ my: 2, backgroundColor: 'var(--border-color)' }} />
                </Box>
                <List>
                    <ListItem button component={Link} to="/home" onClick={handleDrawerToggle}>
                        <ListItemIcon sx={{ color: 'var(--title-color)' }}>
                            <MenuIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" sx={{ color: 'var(--title-color)' }} />
                    </ListItem>

                    {/* Products with Collapse for Categories */}
                    <ListItem button onClick={() => handleCategoryClick('products')}>
                        <ListItemIcon sx={{ color: 'var(--title-color)' }}>
                            <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Products" sx={{ color: 'var(--title-color)' }} />
                        {categoryMenuOpen['products'] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={categoryMenuOpen['products']} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {categories.map((category) => (
                                <ListItem
                                    button
                                    key={category.id}
                                    component={Link}
                                    to={`/categories/${category.id}`}
                                    onClick={handleDrawerToggle}
                                    sx={{ pl: 4, color: 'var(--text-color)' }}
                                >
                                    <ListItemText primary={category.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>

                    <ListItem button component={Link} to="/promotions" onClick={handleDrawerToggle}>
                        <ListItemIcon sx={{ color: 'var(--title-color)' }}>
                            <PromotionsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Promotions" sx={{ color: 'var(--title-color)' }} />
                    </ListItem>
                </List>
            </Drawer>

            {/* Shopping Cart Modal */}
            <Cart open={cartOpen} handleClose={() => setCartOpen(false)} />

            {/* Customer Login Dialog */}
            <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Customer Login</DialogTitle>
                <DialogContent>
                    <UserLogin closeDialog={() => setLoginDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Admin Login Dialog */}
            <Dialog open={adminLoginDialogOpen} onClose={() => setAdminLoginDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Admin Login</DialogTitle>
                <DialogContent>
                    <AdminLogin closeDialog={() => setAdminLoginDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}

export default CustomerNavbar;
