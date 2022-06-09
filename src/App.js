import React, { useState, useEffect, useRef } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import { doc, onSnapshot } from 'firebase/firestore';
import { IconContext } from 'react-icons';
import { ScreenClassProvider, setConfiguration } from 'react-grid-system';

// CSS
import "./assets/css/App.css";
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Components
import Footer from './components/misc/Footer';
import Header from './components/misc/Header';
import Views from "./Views";
import { FirebaseAnalytics, StartAtTop } from './components/misc/Misc';
import { auth, firestore } from './Fire';
import { DEFAULT_SITE, SCHEMES } from './utils/constants.js';
import { BodyWrapper, DevAlert, GlobalStyle, Wrapper } from './utils/styles/misc';
import { Spinner } from './utils/styles/images';
import { H2 } from './utils/styles/text';


setConfiguration({ 
    // sm, md, lg, xl, xxl, xxxl
    breakpoints: [576, 768, 992, 1200, 1600, 1920],
    containerWidths: [540, 740, 960, 1140, 1540, 1810],
    defaultScreenClass: 'sm', 
    gutterWidth: 10 
});

function App() {
    const [loading, setLoading] = useState({ 
        user: true,
        fireUser: true,
        site: true,
        readOnlyFlags: true
    }); 

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [user, setUser] = useState();

    const [fireUser, setFireUser] = useState("");

    const [theme, setTheme] = useState({
        value: SCHEMES.LIGHT,
        colors: {
            primary: DEFAULT_SITE.THEME.COLORS.PRIMARY,
            secondary: DEFAULT_SITE.THEME.COLORS.SECONDARY,
            tertiary: DEFAULT_SITE.THEME.COLORS.TERTIARY,
            red: DEFAULT_SITE.THEME.COLORS.RED,
            green: DEFAULT_SITE.THEME.COLORS.GREEN,
            yellow: DEFAULT_SITE.THEME.COLORS.YELLOW,
            blue: DEFAULT_SITE.THEME.COLORS.BLUE,
            grey: DEFAULT_SITE.THEME.COLORS.GREY,
            lightGrey: DEFAULT_SITE.THEME.COLORS.LIGHT_GREY,
            background: DEFAULT_SITE.THEME.COLORS.BACKGROUND.LIGHT,
        },
        fonts: {
            heading: DEFAULT_SITE.THEME.FONTS.HEADING,
            body: DEFAULT_SITE.THEME.FONTS.BODY,
        },
    });

    const [readOnlyFlags, setReadOnlyFlags] = useState("");

    // Initially just pull the default site in case custom site not set yet
    const [site, setSite] = useState({
        unset: true,
        name: DEFAULT_SITE.NAME,
        logo: {
            width: DEFAULT_SITE.LOGO.WIDTH,
            height: DEFAULT_SITE.LOGO.HEIGHT,
            url: DEFAULT_SITE.LOGO.URL,
            showTitle: DEFAULT_SITE.LOGO.SHOW_TITLE,
        },
        hero: {
            heading: DEFAULT_SITE.HERO.HEADING,
            body: DEFAULT_SITE.HERO.BODY,
            cta: {
                link: DEFAULT_SITE.HERO.CTA.LINK,
                text: DEFAULT_SITE.HERO.CTA.TEXT,
                size: DEFAULT_SITE.HERO.CTA.SIZE,
                color: DEFAULT_SITE.HERO.CTA.COLOR,
            },                    
            banner: DEFAULT_SITE.HERO.BANNER,
        },
        emails: {
            support: DEFAULT_SITE.EMAILS.SUPPORT,
            noreply: DEFAULT_SITE.EMAILS.NOREPLY,
        },
        theme: { 
            fonts: {
                heading: {
                    name: DEFAULT_SITE.THEME.FONTS.HEADING.NAME,
                    url: DEFAULT_SITE.THEME.FONTS.HEADING.URL,
                    light: DEFAULT_SITE.THEME.FONTS.HEADING.LIGHT,
                    dark: DEFAULT_SITE.THEME.FONTS.HEADING.DARK,
                },
                body: {
                    name: DEFAULT_SITE.THEME.FONTS.BODY.NAME,
                    url: DEFAULT_SITE.THEME.FONTS.BODY.URL,
                    light: DEFAULT_SITE.THEME.FONTS.BODY.LIGHT,
                    dark: DEFAULT_SITE.THEME.FONTS.BODY.DARK,
                },
                link: {
                    name: DEFAULT_SITE.THEME.FONTS.LINK.NAME,
                    url: DEFAULT_SITE.THEME.FONTS.LINK.URL,
                    light: DEFAULT_SITE.THEME.FONTS.LINK.LIGHT,
                    dark: DEFAULT_SITE.THEME.FONTS.LINK.DARK,
                },
            },
            colors: {
                primary: DEFAULT_SITE.THEME.COLORS.PRIMARY,
                secondary: DEFAULT_SITE.THEME.COLORS.SECONDARY,
                tertiary: DEFAULT_SITE.THEME.COLORS.TERTIARY,
                red: DEFAULT_SITE.THEME.COLORS.RED,
                green: DEFAULT_SITE.THEME.COLORS.GREEN,
                yellow: DEFAULT_SITE.THEME.COLORS.YELLOW,
                blue: DEFAULT_SITE.THEME.COLORS.BLUE,
                grey: DEFAULT_SITE.THEME.COLORS.GREY,
                lightGrey: DEFAULT_SITE.THEME.COLORS.LIGHT_GREY,
                background: {
                    light: DEFAULT_SITE.THEME.COLORS.BACKGROUND.LIGHT,
                    dark: DEFAULT_SITE.THEME.COLORS.BACKGROUND.DARK,
                },
            },
        },
    });

    // Properly assemble the theme object to be passed to styled-components Theme based on the current scheme preference.
    useEffect(() => {
        let themeObject = {};
        let isDarkScheme = false;
        
        if(user){
            // User signed in, so grab their currently set preference
            if((user?.flags?.themeScheme ?? SCHEMES.LIGHT) === SCHEMES.DARK){
                isDarkScheme = true
            }
        } else {
            // No user signed in yet, so just grab the user's OS preference
            if((window.matchMedia(`(prefers-color-scheme: ${SCHEMES.DARK})`).matches ? SCHEMES.DARK : SCHEMES.LIGHT) === SCHEMES.DARK){
                isDarkScheme = true
            }
        }
        
        // Note: the extra logic of checking if the .light value of a color is taken is so this can be expanded to potentially accept a light and dark "red" for example.
        themeObject = { 
            value: isDarkScheme ? SCHEMES.DARK : SCHEMES.LIGHT,
            colors: {
                primary: !site.theme.colors.primary.light ? site.theme.colors.primary : (isDarkScheme ? site.theme.colors.primary.dark : site.theme.colors.primary.light),
                secondary: !site.theme.colors.secondary.light ? site.theme.colors.secondary : (isDarkScheme ? site.theme.colors.secondary.dark : site.theme.colors.secondary.light),
                tertiary: !site.theme.colors.tertiary.light ? site.theme.colors.tertiary : (isDarkScheme ? site.theme.colors.tertiary.dark : site.theme.colors.tertiary.light),
                red: !site.theme.colors.red.light ? site.theme.colors.red : (isDarkScheme ? site.theme.colors.red.dark : site.theme.colors.red.light),
                green: !site.theme.colors.green.light ? site.theme.colors.green : (isDarkScheme ? site.theme.colors.green.dark : site.theme.colors.green.light),
                yellow: !site.theme.colors.yellow.light ? site.theme.colors.yellow : (isDarkScheme ? site.theme.colors.yellow.dark : site.theme.colors.yellow.light),
                blue: !site.theme.colors.blue.light ? site.theme.colors.blue : (isDarkScheme ? site.theme.colors.blue.dark : site.theme.colors.blue.light),
                grey: !site.theme.colors.grey.light ? site.theme.colors.grey : (isDarkScheme ? site.theme.colors.grey.dark : site.theme.colors.grey.light),
                lightGrey: !site.theme.colors.lightGrey.light ? site.theme.colors.lightGrey : (isDarkScheme ? site.theme.colors.lightGrey.dark : site.theme.colors.lightGrey.light),
                background: !site.theme.colors.background.light ? site.theme.colors.primary : (isDarkScheme ? site.theme.colors.background.dark : site.theme.colors.background.light),
            },
            fonts: {
                heading: {
                    name: site.theme.fonts.heading.name,
                    url: site.theme.fonts.heading.url,
                    color: (isDarkScheme ? site.theme.fonts.heading.dark : site.theme.fonts.heading.light),
                },
                body: {
                    name: site.theme.fonts.body.name,
                    url: site.theme.fonts.body.url,
                    color: (isDarkScheme ? site.theme.fonts.body.dark : site.theme.fonts.body.light),
                },
                link: {
                    name: "",
                    url: "",
                    color: (isDarkScheme ? site.theme.fonts.link.dark : site.theme.fonts.link.light),
                },
            },
        }

        setTheme(themeObject)
    }, [user, site])

    useEffect(() => {
        return onSnapshot(doc(firestore, "site", "public"), (siteDoc) => {
            if(siteDoc.exists()){
                let siteData = siteDoc.data();
                setSite(siteData)
                setLoading(prevState => ({
                    ...prevState,
                    site: false
                }));
            } else {
                console.log("No custom site set, using theme defaults in setSite.")
                setLoading(prevState => ({
                    ...prevState,
                    site: false
                }));
            }
        });
    }, [])

    const unsubUser = useRef();
    const unsubReadOnlyFlags = useRef();
    
    useEffect(() => {
        onAuthStateChanged(auth, (fireUserData) => {
            // console.log("fireUserData: ")
            // console.log(fireUserData)
            if (fireUserData) {
                setFireUser(fireUserData)
                setLoading(prevState => ({
                    ...prevState,
                    fireUser: false
                }))

                unsubUser.current = onSnapshot(doc(firestore, "users", fireUserData.uid), (userDoc) => {
                    if(userDoc.exists()){
                        // User exists
                        const docWithMore = Object.assign({}, userDoc.data());
                        docWithMore.id = userDoc.id;
                        setUser(docWithMore);
                        setLoading(prevState => ({
                            ...prevState,
                            user: false
                        }))
                    } else {
                        console.log("No user exists.")
                        setLoading(prevState => ({
                            ...prevState,
                            user: false
                        }))
                    }
                });

                // For seeing if admin
                unsubReadOnlyFlags.current = onSnapshot(doc(firestore, "users", fireUserData.uid, "readOnly", "flags"), (readOnlyFlagsDoc) => {
                    if(readOnlyFlagsDoc.exists()){
                        setReadOnlyFlags(readOnlyFlagsDoc.data());
                        setLoading(prevState => ({
                            ...prevState,
                            readOnlyFlags: false
                        }));
                    } else {
                        console.log("No read only read only flags exists.")
                        setLoading(prevState => ({
                            ...prevState,
                            readOnlyFlags: false
                        }));
                    }
                });
                
            } else {                
                // No user signed in
                setLoading(prevState => ({
                    ...prevState,
                    fireUser: false,
                    user: false,
                    readOnlyFlags: false
                }))
            }
        });

        return () => {
            if(unsubUser.current){
                unsubUser?.current();
            }
            if(unsubReadOnlyFlags.current){
                unsubReadOnlyFlags?.current();
            }
        };
    }, [site]); // if site is not added here, the pages will continue to render endlessly for some reason

    const cleanUpLogout = () => {
        if(unsubUser.current){
            unsubUser?.current();
        }
        if(unsubReadOnlyFlags.current){
            unsubReadOnlyFlags?.current();
        }

        setFireUser("");
        setUser("");
        setReadOnlyFlags("")
    }

    if(loading.fireUser || loading.user || loading.readOnlyFlags || loading.site){
        return (
            <Wrapper>
                <H2>Loading... <Spinner /> </H2> 
            </Wrapper>
        )
    } else {
        return (
            <HelmetProvider>
                <Helmet>
                    <title>{site.name ? `${site.name}` : "Fire React Base"}</title>
                </Helmet>
                <ScreenClassProvider>
                    {/* ** Adjust this paddingBottom if icon is unaligned with font, applied to ALL fonts. Override with inline style for 1 icon! */}
                    <IconContext.Provider value={{ style: { verticalAlign: "middle", display: "inline", paddingBottom: "1%"} }}>
                        <ThemeProvider theme={theme}>
                            <BodyWrapper>
                                <BrowserRouter>
                                    <GlobalStyle /> 
                                    <FirebaseAnalytics />
                                    <StartAtTop />
                                    {process.env.NODE_ENV === 'development' && (
                                        <DevAlert>
                                            LOCAL SERVER
                                        </DevAlert>
                                    )}      
                                    <Header 
                                        site={site}
                                        user={user} 
                                    />
                                    <ToastContainer
                                        position="top-center"
                                        autoClose={4000}
                                        hideProgressBar={false}
                                        newestOnTop={false}
                                        theme={theme.value}
                                        closeOnClick
                                        rtl={false}
                                        pauseOnFocusLoss
                                        pauseOnHover
                                    />
                                    <Views 
                                        site={site}
                                        fireUser={fireUser} 
                                        user={user} 
                                        readOnlyFlags={readOnlyFlags}
                                        setFireUser={setFireUser}
                                        setUser={setUser}
                                        setReadOnlyFlags={setReadOnlyFlags}
                                        setIsLoggingIn={setIsLoggingIn} 
                                        cleanUpLogout={cleanUpLogout}
                                        isLoggingIn={isLoggingIn}
                                    />
                                    <Footer
                                        site={site} 
                                    />
                                </BrowserRouter>
                            </BodyWrapper>
                        </ThemeProvider>
                    </IconContext.Provider>
                </ScreenClassProvider>
                
            </HelmetProvider>
        );
    }
}

export default App;
