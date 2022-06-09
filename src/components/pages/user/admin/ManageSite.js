import React, { useEffect, useState } from 'react'
import { useTheme } from 'styled-components'
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { FaChevronLeft, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from "react-hook-form";
import { CgCheck, CgClose } from 'react-icons/cg'
import { AiOutlineArrowDown, AiOutlineArrowRight } from 'react-icons/ai'

import { Button, RadioInput, SelectInput, TextAreaInput, TextInput } from '../../../../utils/styles/forms'
import { BTYPES, DEFAULT_SITE, SIZES } from '../../../../utils/constants.js'
import { firestore } from '../../../../Fire'
import { Body, H1, H3, Label, LLink } from '../../../../utils/styles/text'
import ConfirmAlert from '../../../misc/ConfirmAlert'
import { Column, Grid, Hr, MiniColor, ModalCard, ModalContainer, Row } from '../../../../utils/styles/misc'
import { FormError, Tooltip } from '../../../misc/Misc'
import FileUpload from '../../../misc/FileUpload'
import { Img } from '../../../../utils/styles/images'
import { Hidden, Visible } from 'react-grid-system'
import { readTimestamp } from '../../../../utils/misc'
import { Tabs } from '../../../misc/Tabs'

export default function ManageSite(props) {
    const theme = useTheme();
    const navigate = useNavigate();

    const siteForm = useForm({
        defaultValues: {
            name: props.site.name,
            // projectId: props.site.projectId,// dont think we need to set this yet...
            logo: {
                width: props.site.logo.width,
                height: props.site.logo.height,
                url: props.site.logo.url,
                showTitle: props.site.logo.showTitle,
            },
            emails: {
                support: props.site.emails.support,
                noreply: DEFAULT_SITE.EMAILS.NOREPLY,
            },
            theme: {
                colors: {
                    primary: props.site.theme.colors.primary,
                    secondary: props.site.theme.colors.secondary,
                    tertiary: props.site.theme.colors.tertiary,
                    green: props.site.theme.colors.green,
                    red: props.site.theme.colors.red,
                    yellow: props.site.theme.colors.yellow,
                    blue: props.site.theme.colors.blue,
                    grey: props.site.theme.colors.grey,
                    lightGrey: props.site.theme.colors.lightGrey,
                    background: {
                        dark: props.site.theme.colors.background.dark,
                        light: props.site.theme.colors.background.light,
                    },
                },
                fonts: {
                    heading: {
                        name: props.site.theme.fonts.heading.name,
                        url: props.site.theme.fonts.heading.url,
                        dark: props.site.theme.fonts.heading.dark,
                        light: props.site.theme.fonts.heading.light,
                    },
                    body: {
                        name: props.site.theme.fonts.body.name,
                        url: props.site.theme.fonts.body.url,
                        dark: props.site.theme.fonts.body.dark,
                        light: props.site.theme.fonts.body.light,
                    },
                    link: {
                        name: props.site.theme.fonts.link.name,
                        url: props.site.theme.fonts.link.url,
                        dark: props.site.theme.fonts.link.dark,
                        light: props.site.theme.fonts.link.light,
                    },
                }
            },
            hero: {
                heading: props.site.hero.heading,
                body: props.site.hero.body,
                banner: props.site.hero.banner,
                cta: {
                    text: props.site.hero.cta.text,
                    link: props.site.hero.cta.link,
                    color: props.site.hero.cta.color,
                    size: props.site.hero.cta.size,
                },
            }
        }
    });

    const [submitting, setSubmitting] = useState({ 
        site: false,
        logoUrl: false,
    });
    
    const [shownModals, setShownModals] = useState([]); 

    useEffect(() => {
        function onUnload(e) {
            e.preventDefault();
            e.returnValue = "";
        }

        if (siteForm.formState.isDirty) {
            window.addEventListener("beforeunload", onUnload);
        } else {
            window.removeEventListener('beforeunload', onUnload); 
        }
    
        return () => {
          window.removeEventListener('beforeunload', onUnload);
        };
    }, [siteForm.formState.isDirty]);

    const toggleModal = (newStatus, index) => {
        let tempShownModals = [...shownModals];
        tempShownModals[index] = newStatus;
        setShownModals(tempShownModals);
    };

    const updateSite = (data) => {   
        updateDoc(doc(firestore, "site", "public"), {
            name: data.name,
            logo: {
                width: parseInt(data.logo.width),
                height: parseInt(data.logo.height),
                url: data.logo.url,
                showTitle: (data.logo.showTitle === "true"), //** value from react-hook-form is passed as string "false", so we need to "parseBoolean" */
            },
            emails: {
                support: data.emails.support,
                noreply: DEFAULT_SITE.EMAILS.NOREPLY,
            },
            theme: {
                colors: {
                    primary: data.theme.colors.primary,
                    secondary: data.theme.colors.secondary,
                    tertiary: data.theme.colors.tertiary,
                    green: data.theme.colors.green,
                    red: data.theme.colors.red,
                    yellow: data.theme.colors.yellow,
                    blue: data.theme.colors.blue,
                    grey: data.theme.colors.grey,
                    lightGrey: data.theme.colors.lightGrey,
                    background: {
                        dark: data.theme.colors.background.dark,
                        light: data.theme.colors.background.light,
                    },
                },
                fonts: {
                    heading: {
                        name: data.theme.fonts.heading.name,
                        url: data.theme.fonts.heading.url,
                        dark: data.theme.fonts.heading.dark,
                        light: data.theme.fonts.heading.light,
                    },
                    body: {
                        name: data.theme.fonts.body.name,
                        url: data.theme.fonts.body.url,
                        dark: data.theme.fonts.body.dark,
                        light: data.theme.fonts.body.light,
                    },
                    link: {
                        name: data.theme.fonts.link.name,
                        url: data.theme.fonts.link.url,
                        dark: data.theme.fonts.link.dark,
                        light: data.theme.fonts.link.light,
                    },
                }
            },
            hero: {
                heading: data.hero.heading,
                body: data.hero.body,
                banner: data.hero.banner,
                cta: {
                    text: data.hero.cta.text,
                    link: data.hero.cta.link,
                    size: data.hero.cta.size,
                    color: data.hero.cta.color,
                },
            },
            updated: {
                timestamp: Date.now(),
                userId: props.user.id,
                name: `${props.user.firstName} ${props.user.lastName}`,
                email: props.user.email,
            },
        }).then(() => {
            setSubmitting(prevState => ({
                ...prevState,
                site: false
            }));
            toast.success("Site updated!");
            siteForm.reset(data);
        }).catch(error => {
            toast.error(`Error updating site: ${error}`);
            setSubmitting(prevState => ({
                ...prevState,
                site: false
            }));
        });
    }

    const createCustomSite = async () => {
        const publicRef = doc(firestore, "site", "public");
        const publicDocSnap = await getDoc(publicRef);

        if (publicDocSnap.exists()) {
            toast.error(`Public site doc exists, please delete existing site on Firebase console to recreate.`);
            console.log("Public site doc exists, please delete existing site on Firebase console to recreate.");
        } else {
            console.log("Public doc doesn't exist, go ahead and create default!");
            
            await setDoc(publicRef, {
                name: "Minute.tech",
                projectId: process.env.REACT_APP_FIREBASE_LIVE_PROJECT_ID,
                logo: {
                    width: 100,
                    height: 100,
                    url: "https://firebasestorage.googleapis.com/v0/b/test-fire-react-base.appspot.com/o/public%2Fminute.tech%2Ficon-color-lg.png?alt=media&token=a2d63bf2-4787-4bdc-b29f-48502328c00e",
                    showTitle: DEFAULT_SITE.LOGO.SHOW_TITLE,
                },
                emails: {
                    support: DEFAULT_SITE.EMAILS.SUPPORT,
                    noreply: DEFAULT_SITE.EMAILS.NOREPLY,
                },
                hero: {
                    heading: "Welcome to Minute.tech",
                    body: DEFAULT_SITE.HERO.BODY,
                    cta: {
                        link: DEFAULT_SITE.HERO.CTA.LINK,
                        text: "Ask a question",
                        size: DEFAULT_SITE.HERO.CTA.SIZE,
                        color: DEFAULT_SITE.HERO.CTA.COLOR,
                    },                    
                    banner: "https://firebasestorage.googleapis.com/v0/b/test-fire-react-base.appspot.com/o/public%2Fminute.tech%2Fdesk-clutter.jpg?alt=media&token=ce6d3f14-744b-4a24-8a98-55a2fdb7803f",
                },
                theme: { 
                    fonts: {
                        heading: {
                            name: "Lato Black",
                            url: "https://firebasestorage.googleapis.com/v0/b/test-fire-react-base.appspot.com/o/public%2Ffonts%2FLato-Black.ttf?alt=media&token=cd887b00-055e-4a9d-a55b-3dda0ecd9e7b",
                            light: DEFAULT_SITE.THEME.FONTS.HEADING.LIGHT,
                            dark: DEFAULT_SITE.THEME.FONTS.HEADING.DARK,
                        },
                        body: {
                            name: "Lato Regular",
                            url: "https://firebasestorage.googleapis.com/v0/b/test-fire-react-base.appspot.com/o/public%2Ffonts%2FLato-Regular.ttf?alt=media&token=f2f37502-4d69-4224-ba6b-c9426ea22c20",
                            light: DEFAULT_SITE.THEME.FONTS.BODY.LIGHT,
                            dark: DEFAULT_SITE.THEME.FONTS.BODY.DARK,
                        },
                        link: {
                            name: "",
                            url: "",
                            light: DEFAULT_SITE.THEME.FONTS.LINK.LIGHT,
                            dark: DEFAULT_SITE.THEME.FONTS.LINK.DARK,
                        },
                    },
                    colors: {
                        primary: "#4FBFE0",
                        secondary: "#FDBB30",
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
            }).then(() => {
                toast.success(`Created public doc.`);
                console.log("Successful write of site public doc to Firestore.");
            }).catch((error) => {
                console.error("Error adding public document: ", error);
                toast.error(`Error setting public doc: ${error}`);
            });

            await setDoc(doc(firestore, "site", "sensitive"), {
                messengers: ["douglasrcjames@gmail.com"]
            }, {merge: true}).then(() => {
                console.log("Successful write of sensitive doc to Firestore.");
                toast.success(`Created sensitive doc.`);
            }).catch((error) => {
                console.error("Error adding sensitive document: ", error);
                toast.error(`Error setting sensitive doc: ${error}`);
            });
        }
    };

    const createDefaultSite = async () => {
        const publicRef = doc(firestore, "site", "public");
        const publicDocSnap = await getDoc(publicRef);

        if (publicDocSnap.exists()) {
            toast.error(`Public site doc exists, please delete existing site on Firebase console to recreate.`);
            console.log("Public site doc exists, please delete existing site on Firebase console to recreate.");
        } else {
            console.log("Public doc doesn't exist, go ahead and create default!");
            
            await setDoc(publicRef, {
                name: DEFAULT_SITE.NAME,
                projectId: process.env.REACT_APP_FIREBASE_LIVE_PROJECT_ID,
                logo: {
                    width: DEFAULT_SITE.LOGO.WIDTH,
                    height: DEFAULT_SITE.LOGO.HEIGHT,
                    url: DEFAULT_SITE.LOGO.URL,
                    showTitle: DEFAULT_SITE.LOGO.SHOW_TITLE,
                },
                emails: {
                    support: DEFAULT_SITE.EMAILS.SUPPORT,
                    noreply: DEFAULT_SITE.EMAILS.NOREPLY,
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
            }).then(() => {
                toast.success(`Created public doc.`);
                console.log("Successful write of site public doc to Firestore.");
            }).catch((error) => {
                console.error("Error adding public document: ", error);
                toast.error(`Error setting public doc: ${error}`);
            });

            await setDoc(doc(firestore, "site", "sensitive"), {
                messengers: DEFAULT_SITE.EMAILS.MESSENGERS
            }, {merge: true}).then(() => {
                console.log("Successful write of sensitive doc to Firestore.");
                toast.success(`Created sensitive doc.`);
            }).catch((error) => {
                console.error("Error adding sensitive document: ", error);
                toast.error(`Error setting sensitive doc: ${error}`);
            });
        }
    };

    const deleteSite = async () => {
        await deleteDoc(doc(firestore, "site", "public")).then(() => {
            console.log("Successful delete of doc on firestore");
            toast.success("Deleting site");
            navigate(0);
        }).catch((error) => {
            console.error("Error deleting site: ", error);
            toast.error(`Error deleting site: ${error}`);
        });
    }

    const setFileUrl = (urls, valueName) => {
        siteForm.setValue(valueName, urls[0], { shouldValidate: true, shouldDirty: true })
        toggleModal(false, valueName)
        setSubmitting(prevState => ({
            ...prevState,
            files: false
        }));
    };

    if (props.site.unset) {
        return (
            <>
            <Helmet>
                <title>Manage Site {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <LLink to="/dashboard/admin">
                <Button type="button">
                    <FaChevronLeft />
                    &nbsp; Back to Admin Dashboard
                </Button>
            </LLink>
            <H1>Manage Site</H1>
            <Body color={theme.colors.yellow}>No site doc set yet.</Body>
            <H3>Templates</H3>
            <Button type="button" btype={BTYPES.INVERTED} onClick={() => createDefaultSite()}>
                Create Fire React Base default site <FaPlus />
            </Button>
            <Button type="button" color="#4FBFE0" btype={BTYPES.INVERTED} onClick={() => createCustomSite()}>
                Create Minute.tech example site <FaPlus />
            </Button>
            </>
        )
        
    } else {
        return (
            <>
                <Helmet>
                    <title>Manage Site {props.site.name ? `| ${props.site.name}` : ""}</title>
                </Helmet>
                <LLink to="/dashboard/admin">
                    <Button type="button">
                        <FaChevronLeft />
                        &nbsp; Back to Admin Dashboard
                    </Button>
                </LLink>
                <H1 margin="0">Manage Site</H1>
                {props.site.updated && (
                    <Body size={SIZES.SM} display="inline-block" margin="0 0 25px 0">Last edited by {props.site.updated.name} ({readTimestamp(props.site.updated.timestamp).date} @ {readTimestamp(props.site.updated.timestamp).time})</Body>
                )}
                <form onSubmit={ siteForm.handleSubmit(updateSite) }>
                    {siteForm.formState.isDirty && (
                        <Button 
                            size={SIZES.LG}
                            type="submit"
                            disabled={submitting.site}
                        >
                            Save changes
                        </Button>
                    )}
                    <Tabs>
                        <div label="General">
                            <Grid fluid>
                                <Row>
                                    <Column sm={12} md={6}>
                                        <Label htmlFor={"name"} br>Site Name:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.name ?? ""}
                                            placeholder={`My Awesome Site`} 
                                            { 
                                                ...siteForm.register("name", {
                                                    required: "A site name is required!",
                                                    maxLength: {
                                                        value: 50,
                                                        message: "The site name must be at most 50 characters long."
                                                    },
                                                    minLength: {
                                                        value: 3,
                                                        message: "The site name must be at least 3 characters long."
                                                    },
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.name ?? ""} /> 
                                    </Column>
                                    <Column sm={12} md={6}>
                                        <Label htmlFor={"logo.showTitle"} br>Show name as title?</Label>
                                        <RadioInput
                                            name="logo.showTitle"
                                            defaultChecked={props.site.logo.showTitle}
                                            value={true}
                                            error={siteForm.formState.errors?.logo?.showTitle ?? ""}
                                            {
                                            ...siteForm.register("logo.showTitle")
                                            } 
                                        />
                                        <Body display="inline" margin="0">Yes</Body>
                                        <RadioInput
                                            name="logo.showTitle"
                                            defaultChecked={!props.site.logo.showTitle}
                                            value={false}
                                            error={siteForm.formState.errors?.logo?.showTitle ?? ""}
                                            {
                                            ...siteForm.register("logo.showTitle")
                                            } 
                                        />
                                        <Body display="inline" margin="0">No</Body>
                                        <FormError error={siteForm.formState.errors?.logo?.showTitle ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12} md={6}>
                                        <Label htmlFor={"emails.support"} br>Support Email:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.emails?.support ?? ""}
                                            placeholder={`help@minute.tech`} 
                                            { 
                                                ...siteForm.register("emails.support", {
                                                    required: "A support email is required!",
                                                    maxLength: {
                                                        value: 50,
                                                        message: "The support email must be at most 50 characters long."
                                                    },
                                                    minLength: {
                                                        value: 3,
                                                        message: "The support email must be at least 3 characters long."
                                                    },
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.emails?.support ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12} margin="20px 0" textalign="center">
                                        <Button 
                                            type="button" 
                                            color={theme.colors.red} 
                                            btype={BTYPES.INVERTED} 
                                            onClick={() =>         
                                                confirmAlert({
                                                    customUI: ({ onClose }) => {
                                                        return (
                                                            <ConfirmAlert
                                                                theme={theme}
                                                                onClose={onClose} 
                                                                headingText={`Revert to default site`}
                                                                body={`Are you sure you want to delete site "${props.site.name}" from the database? This action will revert all front-end changes (like color, logo, etc uploads.) to their default values and you will have to set them again. Other data like messages, users, etc will NOT be deleted with this process, so don't stress!`}
                                                                yesFunc={() => deleteSite()} 
                                                                yesText={`Yes`} 
                                                                noFunc={function () {}} 
                                                                noText={`No`}   
                                                            />
                                                        );
                                                    }
                                            })} 
                                        >
                                            <FaTrash />&nbsp; Delete site public document 
                                        </Button>
                                    </Column>
                                </Row>
                            </Grid>
                        </div>
                        <div label="Logo">
                            <Grid fluid>
                                <Row align="center">
                                    <Column sm={12} md={4} textalign="center">
                                        <Label br>Current Logo</Label>
                                        <Img 
                                            src={props.site.logo.url}
                                            border={`2px solid ${theme.colors.primary}`}
                                            alt={`site logo`}
                                            width={`${props.site.logo.width}px`}
                                        />
                                        <br/>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.INVERTED} 
                                            color={theme.colors.yellow}
                                            hidden={siteForm.getValues("logo.url") !== props.site.logo.url ? true : false}
                                            onClick={() => toggleModal(true, "logo.url")}
                                        >
                                                Update logo
                                        </Button>
                                    </Column>
                                    <Hidden xs sm>
                                        <Column 
                                            sm={12} md={4} 
                                            textalign="center" 
                                            hidden={siteForm.getValues("logo.url") === props.site.logo.url ? true : false}
                                        >
                                            <AiOutlineArrowRight style={{color: theme.colors.primary}} size={100} />
                                            <Body margin="0">Ready to save changes!</Body>
                                        </Column>
                                    </Hidden>
                                    <Visible xs sm>
                                        <Column 
                                            sm={12} md={4} 
                                            textalign="center" 
                                            hidden={siteForm.getValues("logo.url") === props.site.logo.url ? true : false}
                                        >
                                            <AiOutlineArrowDown style={{color: theme.colors.primary}} size={100} />
                                            <Body margin="0">Ready to save changes!</Body>
                                        </Column>
                                    </Visible>
                                    <Column 
                                        sm={12} 
                                        md={4} 
                                        textalign="center" 
                                        hidden={siteForm.getValues("logo.url") === props.site.logo.url ? true : false}
                                    >
                                        <Label br>Incoming Logo</Label>
                                        <Img 
                                            src={siteForm.getValues("logo.url")}
                                            border={`2px solid ${theme.colors.primary}`}
                                            alt={`incoming site logo`}
                                            width={`${props.site.logo.width}px`}
                                        />
                                        <br/>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.TEXTED} 
                                            color={theme.colors.yellow}
                                            onClick={() => toggleModal(true, "logo.url")}>
                                                Update selection
                                        </Button>
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"logo.width"} br>Logo width:</Label>
                                        <TextInput
                                            type="number" 
                                            error={siteForm.formState.errors?.logo?.width ?? ""}
                                            placeholder={100} 
                                            { 
                                                ...siteForm.register("logo.width", {
                                                    required: "A logo width is required!",
                                                    max: {
                                                        value: 1000,
                                                        message: "1000px wide is too large!"
                                                    },
                                                    min: {
                                                        value: 50,
                                                        message: "50px wide is too small!"
                                                    },
                                                    // valueAsNumber: true, //** this was not working, triggering field on another tab when dirtied, so just going to convert before we submit */
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.logo?.width ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"logo.height"} br>Logo height:</Label>
                                        <TextInput
                                            type="number" 
                                            error={siteForm.formState.errors?.logo?.height ?? ""}
                                            placeholder={100} 
                                            { 
                                                ...siteForm.register("logo.height", {
                                                    required: "A logo height is required!",
                                                    max: {
                                                        value: 1000,
                                                        message: "1000px high is too large!"
                                                    },
                                                    min: {
                                                        value: 50,
                                                        message: "50px high is too small!"
                                                    },
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.logo?.height ?? ""} /> 
                                    </Column>
                                </Row>
                            </Grid>
                        </div>
                        <div label="Theme">
                            <Grid fluid>
                                <H3>Colors <Tooltip text="All HTML colors allowed, including hex values (#FFFFF)."><FaInfoCircle size={20}/></Tooltip></H3>
                                <Row>
                                    <Column sm={6} md={4} lg={3}>
                                        <Label htmlFor={"theme.colors.primary"} br>Primary: <MiniColor color={props.site.theme.colors.primary} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.primary ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.primary", {
                                                    required: "A primary color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.primary ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={4} lg={3}>
                                        <Label htmlFor={"theme.colors.secondary"} br>Secondary: <MiniColor color={props.site.theme.colors.secondary} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.secondary ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.secondary", {
                                                    required: "A secondary color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.secondary ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={4} lg={3}>
                                        <Label htmlFor={"theme.colors.tertiary"} br>Tertiary: <MiniColor color={props.site.theme.colors.tertiary} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.tertiary ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.tertiary", {
                                                    required: "A tertiary color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.tertiary ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column md={6} lg={3}>
                                        <Label htmlFor={"theme.colors.background.light"} br>Background - Light: <MiniColor color={props.site.theme.colors.background.light} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.background?.light ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.background.light", {
                                                    required: "A background light color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.background?.light ?? ""} /> 
                                    </Column>
                                    <Column md={6} lg={3}>
                                        <Label htmlFor={"theme.colors.background.dark"} br>Background - Dark: <MiniColor color={props.site.theme.colors.background.dark} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.background?.dark ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.background.dark", {
                                                    required: "A background dark color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.background?.dark ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.green"} br>Green: <MiniColor color={props.site.theme.colors.green} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.green ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.green", {
                                                    required: "A green color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.green ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.red"} br>Red: <MiniColor color={props.site.theme.colors.red} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.red ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.red", {
                                                    required: "A red color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.red ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.yellow"} br>Yellow: <MiniColor color={props.site.theme.colors.yellow} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.yellow ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.yellow", {
                                                    required: "A yellow color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.yellow ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.blue"} br>Blue: <MiniColor color={props.site.theme.colors.blue} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.blue ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.blue", {
                                                    required: "A blue color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.blue ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.grey"} br>Grey: <MiniColor color={props.site.theme.colors.grey} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.grey ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.grey", {
                                                    required: "A grey color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.grey ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={3} lg={2}>
                                        <Label htmlFor={"theme.colors.lightGrey"} br>Light Grey: <MiniColor color={props.site.theme.colors.lightGrey} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.colors?.lightGrey ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.colors.lightGrey", {
                                                    required: "A lightGrey color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.colors?.lightGrey ?? ""} /> 
                                    </Column>
                                </Row>
                                <H3>Fonts</H3>
                                <Row>
                                    <Column md={12} lg={4}>
                                        <Label htmlFor={"theme.fonts.heading.name"} br>Heading Font Name:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.heading?.name ?? ""}
                                            placeholder={"Times New Roman"}
                                            { 
                                                ...siteForm.register("theme.fonts.heading.name", {
                                                    required: "A hero heading is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.heading?.name ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={6} lg={4}>
                                        <Label htmlFor={"theme.fonts.heading.dark"} br>Heading Font Color - Dark: <MiniColor color={props.site.theme.fonts.heading.dark} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.heading?.dark ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.fonts.heading.dark", {
                                                    required: "A heading font dark color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.heading?.dark ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={6} lg={4}>
                                        <Label htmlFor={"theme.fonts.heading.light"} br>Heading Font Color - Light: <MiniColor color={props.site.theme.fonts.heading.light} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.heading?.light ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.fonts.heading.light", {
                                                    required: "A heading font light color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.heading?.light ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12}>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.INVERTED} 
                                            color={theme.colors.yellow}
                                            onClick={() => toggleModal(true, "theme.fonts.heading.url")}
                                            hidden={(siteForm.getValues("theme.fonts.heading.url") && (siteForm.getValues("theme.fonts.heading.url") !== props.site.theme.fonts.heading.url))}
                                        >
                                                Update heading font file
                                        </Button>
                                        {(siteForm.getValues("theme.fonts.heading.url") && (siteForm.getValues("theme.fonts.heading.url") !== props.site.theme.fonts.heading.url)) && (
                                            <Body color={theme.colors.green}><CgCheck size={40}/>Heading font file uploaded successfully. Don't forget to change the font name above to match, then save this form above!</Body>
                                        )}
                                    </Column>
                                </Row>
                                <Row>
                                    <Column md={12} lg={4}>
                                        <Label htmlFor={"theme.fonts.body.name"} br>Body Font Name:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.body?.name ?? ""}
                                            placeholder={"Times New Roman"}
                                            { 
                                                ...siteForm.register("theme.fonts.body.name", {
                                                    required: "A hero body is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.body?.name ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={6} lg={4}>
                                        <Label htmlFor={"theme.fonts.body.dark"} br>Body Font Color - Dark: <MiniColor color={props.site.theme.fonts.body.dark} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.body?.dark ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.fonts.body.dark", {
                                                    required: "A body font dark color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.body?.dark ?? ""} /> 
                                    </Column>
                                    <Column sm={6} md={6} lg={4}>
                                        <Label htmlFor={"theme.fonts.body.light"} br>Body Font Color - Light: <MiniColor color={props.site.theme.fonts.body.light} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.theme?.fonts?.body?.light ?? ""}
                                            placeholder={"#FFFFFF"} 
                                            { 
                                                ...siteForm.register("theme.fonts.body.light", {
                                                    required: "A body font light color is required!",
                                                })
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.theme?.fonts?.body?.light ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12}>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.INVERTED} 
                                            color={theme.colors.yellow}
                                            onClick={() => toggleModal(true, "theme.fonts.body.url")}
                                            hidden={(siteForm.getValues("theme.fonts.body.url") && (siteForm.getValues("theme.fonts.body.url") !== props.site.theme.fonts.body.url))}
                                        >
                                                Update body font file
                                        </Button>
                                        {(siteForm.getValues("theme.fonts.body.url") && (siteForm.getValues("theme.fonts.body.url") !== props.site.theme.fonts.body.url)) && (
                                            <Body color={theme.colors.green}><CgCheck size={40}/>Body font file uploaded successfully. Don't forget to change the font name above to match, then save this form above!</Body>
                                        )}
                                    </Column>
                                </Row>
                            </Grid>
                        </div>
                        <div label="Hero">
                            <Grid fluid>
                                <Row align="center">
                                    <Column sm={12} md={4} textalign="center">
                                        <Label br>Current Banner</Label>
                                        <Img 
                                            src={props.site.hero.banner}
                                            border={`2px solid ${theme.colors.primary}`}
                                            alt={`site banner`}
                                            width={`300px`}
                                        />
                                        <br/>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.INVERTED} 
                                            color={theme.colors.yellow}
                                            hidden={siteForm.getValues("hero.banner") !== props.site.hero.banner ? true : false}
                                            onClick={() => toggleModal(true, "hero.banner")}
                                        >
                                                Update banner
                                        </Button>
                                    </Column>
                                    <Hidden xs sm>
                                        <Column 
                                            sm={12} md={4} 
                                            textalign="center" 
                                            hidden={siteForm.getValues("hero.banner") === props.site.hero.banner ? true : false}
                                        >
                                            <AiOutlineArrowRight style={{color: theme.colors.primary}} size={100} />
                                            <Body margin="0">Ready to save changes!</Body>
                                        </Column>
                                    </Hidden>
                                    <Visible xs sm>
                                        <Column 
                                            sm={12} md={4} 
                                            textalign="center" 
                                            hidden={siteForm.getValues("hero.banner") === props.site.hero.banner ? true : false}
                                        >
                                            <AiOutlineArrowDown style={{color: theme.colors.primary}} size={100} />
                                            <Body margin="0">Ready to save changes!</Body>
                                        </Column>
                                    </Visible>
                                    <Column 
                                        sm={12} 
                                        md={4} 
                                        textalign="center" 
                                        hidden={siteForm.getValues("hero.banner") === props.site.hero.banner ? true : false}
                                    >
                                        <Label br>Incoming Banner</Label>
                                        <Img 
                                            src={siteForm.getValues("hero.banner")}
                                            border={`2px solid ${theme.colors.primary}`}
                                            alt={`incoming site banner`}
                                            width={`300px`}
                                        />
                                        <br/>
                                        <Button 
                                            type="button"
                                            btype={BTYPES.TEXTED} 
                                            color={theme.colors.yellow}
                                            onClick={() => toggleModal(true, "logo.url")}>
                                                Update selection
                                        </Button>
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12} md={6}>
                                        <Label htmlFor={"hero.heading"} br>Heading:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.hero?.heading ?? ""}
                                            placeholder={"Best Site Ever"}
                                            { 
                                                ...siteForm.register("hero.heading")
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.hero?.heading ?? ""} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column sm={12} md={6}>
                                        <Label htmlFor={"hero.body"} br>Body:</Label>
                                        <TextAreaInput
                                            error={siteForm.formState.errors?.hero?.body ?? ""}
                                            placeholder={"Explain the reason visitors are at the site here!"}
                                            { 
                                                ...siteForm.register("hero.body")
                                            } 
                                        />
                                        <FormError error={siteForm.formState.errors?.hero?.body ?? ""} /> 
                                    </Column>
                                </Row>
                                <H3>Call To Action (CTA)</H3>
                                <Row>
                                    <Column sm={12} md={6} lg={3}>
                                        <Label htmlFor={"hero.cta.text"} br>Button text:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.hero?.cta?.text ?? ""}
                                            placeholder={"Explain the reason visitors are at the site here!"}
                                            {
                                                ...siteForm.register("hero.cta.text", {
                                                    maxLength: {
                                                        value: 50,
                                                        message: "The site name must be at most 50 characters long."
                                                    },
                                                    minLength: {
                                                        value: 2,
                                                        message: "The site name must be at least 2 characters long."
                                                    },
                                                })
                                            }
                                        />
                                        <FormError error={siteForm.formState.errors?.hero?.cta?.text ?? ""} /> 
                                    </Column>
                                    <Column sm={12} md={6} lg={3}>
                                        <Label htmlFor={"hero.cta.link"} br>Button link:</Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.hero?.cta?.link ?? ""}
                                            placeholder={"/about"}
                                            {
                                                ...siteForm.register("hero.cta.link")
                                            }
                                        />
                                        <FormError error={siteForm.formState.errors?.hero?.cta?.link ?? ""} /> 
                                    </Column>
                                    <Column sm={12} md={6} lg={3}>
                                        <Label htmlFor={"hero.cta.color"} br>Button color: <MiniColor color={props.site.hero.cta.color} /></Label>
                                        <TextInput
                                            type="text" 
                                            error={siteForm.formState.errors?.hero?.cta?.color ?? ""}
                                            placeholder={"Explain the reason visitors are at the site here!"}
                                            {
                                                ...siteForm.register("hero.cta.color")
                                            }
                                        />
                                        <FormError error={siteForm.formState.errors?.hero?.cta?.color ?? ""} /> 
                                    </Column>
                                    <Column sm={12} md={6} lg={3}>
                                        <Label htmlFor={"hero.cta.size"} br>Button size:</Label>
                                        <SelectInput defaultValue={props.site.hero.cta.size} {...siteForm.register("hero.cta.size")}>
                                            {
                                                Object.entries(SIZES).map(([key, size]) => {
                                                    return (
                                                        <option key={key} value={size}>{size.toUpperCase()}</option>
                                                    )
                                                })
                                            }
                                        </SelectInput>
                                        <FormError error={siteForm.formState.errors?.hero?.cta?.size ?? ""} /> 
                                    </Column>
                                </Row>
                            </Grid>
                        </div>
                    </Tabs>
                </form>
    
                {shownModals["logo.url"] && (
                    <ModalContainer onClick={() => toggleModal(false, "logo.url")}>
                        <ModalCard onClick={(e) => e.stopPropagation()}>
                            <H3>Update logo url:</H3>
                            <FileUpload
                                    name="logo.url"
                                    path={`public/site/logos/`}
                                    accepts="image/png, image/jpg, image/jpeg" 
                                    onUploadSuccess={setFileUrl}
                                    setSubmitting={setSubmitting}
                                    submitting={submitting}
                                    setError={siteForm.setError}
                                    clearError={siteForm.clearErrors}
                                    error={siteForm.formState?.errors?.logo?.url ?? ""}
                                />
                            
                            <Hr />
                            <Button 
                                type="button"
                                size={SIZES.SM} 
                                onClick={() => toggleModal(false, "logo.url")}
                            >
                                <CgClose /> Close 
                            </Button>
                        </ModalCard>
                    </ModalContainer>
                )}

                {shownModals["theme.fonts.heading.url"] && (
                    <ModalContainer onClick={() => toggleModal(false, "theme.fonts.heading.url")}>
                        <ModalCard onClick={(e) => e.stopPropagation()}>
                            <H3>Update heading font:</H3>
                            <FileUpload
                                    name="theme.fonts.heading.url"
                                    path={`public/site/fonts/`}
                                    accepts="*"
                                    onUploadSuccess={setFileUrl}
                                    setSubmitting={setSubmitting}
                                    submitting={submitting}
                                    setError={siteForm.setError}
                                    clearError={siteForm.clearErrors}
                                    error={siteForm.formState?.errors?.fonts?.heading?.url ?? ""}
                                />
                            
                            <Hr />
                            <Button 
                                type="button"
                                size={SIZES.SM} 
                                onClick={() => toggleModal(false, "theme.fonts.heading.url")}
                            >
                                <CgClose /> Close 
                            </Button>
                        </ModalCard>
                    </ModalContainer>
                )}

                {shownModals["theme.fonts.body.url"] && (
                    <ModalContainer onClick={() => toggleModal(false, "theme.fonts.body.url")}>
                        <ModalCard onClick={(e) => e.stopPropagation()}>
                            <H3>Update body font:</H3>
                            <FileUpload
                                    name="theme.fonts.body.url"
                                    path={`public/site/fonts/`}
                                    accepts="*"
                                    onUploadSuccess={setFileUrl}
                                    setSubmitting={setSubmitting}
                                    submitting={submitting}
                                    setError={siteForm.setError}
                                    clearError={siteForm.clearErrors}
                                    error={siteForm.formState?.errors?.fonts?.body?.url ?? ""}
                                />
                            
                            <Hr />
                            <Button 
                                type="button"
                                size={SIZES.SM} 
                                onClick={() => toggleModal(false, "theme.fonts.body.url")}
                            >
                                <CgClose /> Close 
                            </Button>
                        </ModalCard>
                    </ModalContainer>
                )}

                {shownModals["hero.banner"] && (
                    <ModalContainer onClick={() => toggleModal(false, "hero.banner")}>
                        <ModalCard onClick={(e) => e.stopPropagation()}>
                            <H3>Update body font:</H3>
                            <FileUpload
                                name="hero.banner"
                                path={`public/site/fonts/`}
                                accepts="*"
                                // aspectRatio={{
                                //     numer: 16,
                                //     denom: 9,
                                // }}
                                onUploadSuccess={setFileUrl}
                                setSubmitting={setSubmitting}
                                submitting={submitting}
                                setError={siteForm.setError}
                                clearError={siteForm.clearErrors}
                                error={siteForm.formState?.errors?.hero?.banner ?? ""}
                            />
                            <Hr />
                            <Button 
                                type="button"
                                size={SIZES.SM} 
                                onClick={() => toggleModal(false, "hero.banner")}
                            >
                                <CgClose /> Close 
                            </Button>
                        </ModalCard>
                    </ModalContainer>
                )}

                <Hr/>
                    
            </>
        )
    }
   
}
