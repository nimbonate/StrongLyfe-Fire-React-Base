import React from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useTheme } from 'styled-components';
import { toast } from 'react-toastify';

// Pages //
// Misc
import Home from './components/pages/misc/Home';
import About from './components/pages/misc/About';
import Credits from './components/pages/misc/Credits';
import PrivacyPolicy from './components/pages/misc/PrivacyPolicy';
import TermsConditions from './components/pages/misc/TermsConditions';
import ErrorBoundary from './components/pages/misc/ErrorBoundary';
import Page404 from './components/pages/misc/Page404';
// User
import Login from './components/pages/user/auth/Login';
import Register from './components/pages/user/auth/Register';
import LoggingIn from './components/pages/user/auth/LoggingIn';
import Dashboard from './components/pages/user/dashboard/Dashboard';
import Profile from './components/pages/user/dashboard/Profile';
// Admin
import AdminDashboard from './components/pages/user/admin/AdminDashboard';
import ManageMessages from './components/pages/user/admin/ManageMessages';
import ManageUsers from './components/pages/user/admin/ManageUsers';
import { Wrapper } from './utils/styles/misc';
import ManageSite from './components/pages/user/admin/ManageSite';
import { multiFactor } from 'firebase/auth';

function Views(props) {
    const theme = useTheme();

    // Loading the font as an inline style here, instead of in the Global variable for styled-components 
    // prevents the flashing of the font every load
    // If the value is a URL for either of the fonts, then load from URL
    let css = ``;
    if(theme.fonts.heading.url.includes("https://") && theme.fonts.body.url.includes("https://")){
        css = `
            @font-face {
                font-family: ${theme.fonts.heading.name ? theme.fonts.heading.name : "Arial, Helvetica, sans-serif"};
                src: url(${theme.fonts.heading.url}) format("truetype");
            }

            @font-face {
                font-family: ${theme.fonts.body.name ? theme.fonts.body.name : "Arial, Helvetica, sans-serif"};
                src: url(${theme.fonts.body.url}) format("truetype");
            }
        `
    }
    
    return (
        <>
        {css && (<>
            <style>{css}</style>
        </>
        )}
        <Routes>
            
            <Route 
                index 
                path="/" 
                element={<ErrorBoundary><Home site={props.site} /></ErrorBoundary>}
            />

            <Route 
                path="/about" 
                element={<ErrorBoundary><About site={props.site} /></ErrorBoundary>}
            />

            <Route 
                path="/credits" 
                element={<ErrorBoundary><Credits site={props.site} /></ErrorBoundary>}
            />

            <Route 
                path="/privacy-policy" 
                element={<ErrorBoundary><PrivacyPolicy site={props.site} /></ErrorBoundary>}
            />

            <Route 
                path="/terms-conditions" 
                element={<ErrorBoundary><TermsConditions site={props.site} /></ErrorBoundary>}
            />

            <Route 
                path="/logging-in" 
                element={
                    <ErrorBoundary>
                        <LoggingIn
                            site={props.site} 
                            fireUser={props.fireUser}
                            setIsLoggingIn={props.setIsLoggingIn}  
                        />
                    </ErrorBoundary>
                }
            />
            
            {/* Visitor ONLY routes */}
            <Route 
                element={
                    <ErrorBoundary>
                        <VisitorRoutes 
                            site={props.site} 
                            isUser={props.fireUser} 
                            isLoggingIn={props.isLoggingIn} 
                        />
                    </ErrorBoundary>
                }
            >
                <Route 
                    path="/register" 
                    element={
                        <Register 
                            site={props.site} 
                            fireUser={props.fireUser}
                            setIsLoggingIn={props.setIsLoggingIn}
                        />
                    }
                />
                <Route 
                    path="/login"
                    element={
                        <Login 
                            site={props.site} 
                            fireUser={props.fireUser}
                            setIsLoggingIn={props.setIsLoggingIn}
                        />
                    }
                />
            </Route>
            
            {/* User ONLY routes */}
            {/* isNotMFA={props.fireUser?.multiFactor?.enrolledFactors && props.fireUser.multiFactor.enrolledFactors.length === 0} */}
            <Route 
                element={
                    <ErrorBoundary>
                        <UserRoutes 
                            site={props.site} 
                            isUser={props.fireUser} 
                            isLoggingIn={props.isLoggingIn} 
                        />
                    </ErrorBoundary>
                }
            >
                <Route 
                    path="dashboard"
                    element={  
                        <Wrapper>
                            <Outlet />
                        </Wrapper> 
                    }
                >
                    <Route 
                        index
                        element={
                            <Dashboard 
                                site={props.site} 
                                fireUser={props.fireUser} 
                                user={props.user}
                                readOnlyFlags={props.readOnlyFlags}
                                cleanUpLogout={props.cleanUpLogout}
                            />
                        }
                    />
                    <Route 
                        path="profile" 
                        element={
                            <Profile 
                                site={props.site} 
                                fireUser={props.fireUser} 
                                readOnlyFlags={props.readOnlyFlags}
                                user={props.user}
                            />
                        }
                    />
                    {/* Admin ONLY routes */}
                    <Route 
                        element={
                            <ErrorBoundary>
                                <AdminRoutes 
                                    fireUser={props.fireUser}
                                    site={props.site} 
                                    isAdmin={props?.readOnlyFlags?.isAdmin} 
                                    isLoggingIn={props.isLoggingIn} 
                                />
                            </ErrorBoundary>
                        }
                    >
                        <Route 
                            path="admin" 
                            element={ <Outlet /> }
                        >
                            <Route 
                                index
                                element={
                                    <AdminDashboard
                                        site={props.site} 
                                        fireUser={props.fireUser} 
                                        readOnlyFlags={props.readOnlyFlags}
                                        user={props.user}
                                    />
                                }
                            />
                            <Route 
                                path="site" 
                                element={
                                    <ManageSite
                                        site={props.site} 
                                        fireUser={props.fireUser} 
                                        readOnlyFlags={props.readOnlyFlags}
                                        user={props.user}
                                    />
                                }
                            />
                            <Route 
                                path="messages" 
                                element={
                                    <ManageMessages
                                        site={props.site} 
                                        fireUser={props.fireUser} 
                                        readOnlyFlags={props.readOnlyFlags}
                                        user={props.user}
                                    />
                                }
                            />
                            <Route 
                                path="users" 
                                element={
                                    <ManageUsers
                                        site={props.site} 
                                        fireUser={props.fireUser} 
                                        readOnlyFlags={props.readOnlyFlags}
                                        user={props.user}
                                    />
                                }
                            />
                        </Route>
                    </Route>
                </Route>
                
            </Route>

            <Route path="*" element={<Page404 site={props.site} />} />
        </Routes>
        </>
        
    )
}

function VisitorRoutes({ isUser, isLoggingIn }) {
    let location = useLocation();
    if (isUser && !isLoggingIn) {
        // ** ID needed to be defined so doesnt render twice:
        // https://stackoverflow.com/questions/62578112/react-toastify-showing-multiple-toast
        toast.warn("Sorry, but you need to be signed out to access this page.", {
            toastId: 'visitor',
        });
        return <Navigate to="/dashboard" state={{ from: location }} />;
    } else {
        return <Outlet />;
    }
  
}

function UserRoutes({ isUser, isLoggingIn }) {
    let location = useLocation();
    if (!isUser && !isLoggingIn) {
        toast.warn("Sorry, but you need to be signed in to access this page.", {
            toastId: 'user',
        });
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} />;
    } else {
        return <Outlet />;
    }
}

function AdminRoutes({ isAdmin, isLoggingIn, fireUser }) {
    const location = useLocation();
    const mfaUser = multiFactor(fireUser);

    if (!isAdmin && !isLoggingIn) {
        toast.warn("Sorry, but you need to be an administrator to access this page.", {
            toastId: 'admin',
        });
        return <Navigate to="/dashboard" state={{ from: location }} />;
    } else if ((mfaUser?.enrolledFactors.length ?? 0) === 0) {
        toast.warn(`Sorry, but you need to enable 2FA to view admin pages. ${!fireUser.emailVerified ? "Start by verifying your email below." : "Secure your account on this page!"}`, {
            toastId: 'admin-2fa',
        });
        return <Navigate to="/dashboard/profile" state={{ from: location }} />;
    } else {
        return <Outlet />;
    }
}

export default Views;