import React, { useState } from 'react';

import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, RecaptchaVerifier, updateProfile } from 'firebase/auth';
import { FaChevronLeft } from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";

import { firestore, auth } from "../../../../Fire.js";
import { Column, Grid, Recaptcha, Row, Wrapper } from '../../../../utils/styles/misc.js';
import { CheckboxInput, CheckboxLabel, TextInput, Button } from '../../../../utils/styles/forms.js';
import { ALink, Body, H1, Label, LLink } from '../../../../utils/styles/text.js';
import { FormError } from '../../../misc/Misc.js';
import { INPUT, SCHEMES, SIZES } from '../../../../utils/constants.js';

function Register(props) {
    const navigate = useNavigate();
    
    const [submitting, setSubmitting] = useState({ 
        register: false,
    }); 

    const registerForm = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            policyAccept: false
        }
    });

    const registerUser = (data) => {        
        let termsToastId = "";
        if (data.confirmPassword !== data.password) { 
            registerForm.setError(INPUT.CONFIRM_PASSWORD.VALUE, { 
                type: INPUT.CONFIRM_PASSWORD.ERRORS.NO_MATCH.TYPE, 
                message: INPUT.CONFIRM_PASSWORD.ERRORS.NO_MATCH.MESSAGE
            });   
            setSubmitting(prevState => ({
                ...prevState,
                register: false
            }));
        } else {
            const recaptchaToastId = toast.info('Please complete the reCAPTCHA below to continue.');
            window.recaptchaVerifier = new RecaptchaVerifier("recaptcha", {
                "size": "normal",
                "callback": async (response) => { 
                    props.setIsLoggingIn(true);
                    await createUserWithEmailAndPassword(auth, data.email, data.password)
                        .then(async (userCredential) => {
                            // Register approved
                            const tempUser = userCredential.user;
                            console.log("User created: ")
                            console.log(tempUser)

                            // Set displayName on Firebase auth user object
                            await updateProfile(auth.currentUser, {
                                displayName: (data.firstName + " " + data.lastName)
                            }).then(() => {
                                console.log("Successfully added display name to Firebase.");
                            }).catch((error) => {
                                console.error("Error adding your display name to database: ", error);
                                toast.error(`Error adding your display name to database: ${error}`);
                            });

                            // Create Firestore doc
                            await setDoc(doc(firestore, "users", tempUser.uid), {
                                firstName: data.firstName,
                                lastName: data.lastName,
                                email: data.email,
                                phone: "",
                                flags: {
                                    themeScheme: window.matchMedia(`(prefers-color-scheme: ${SCHEMES.DARK})`).matches ? SCHEMES.DARK : SCHEMES.LIGHT
                                },
                                timestamp: Date.now(),
                            }).then(() => {
                                console.log("Successful write of user doc to Firestore.");
                            }).catch((error) => {
                                console.error("Error adding document: ", error);
                                toast.error(`Error setting users doc: ${error}`);
                            });

                            // Clean up
                            toast.dismiss(recaptchaToastId);
                            window.recaptchaVerifier.clear();
                            navigate("/logging-in");
                            toast.success(`Registered successfully!`);
                        }).catch((error) => {
                            console.log("Error: " + error.message);
                            if(error.code === "auth/email-already-in-use"){
                                registerForm.setError(INPUT.EMAIL.VALUE, { 
                                    type: INPUT.EMAIL.ERRORS.TAKEN.TYPE, 
                                    message: INPUT.EMAIL.ERRORS.TAKEN.MESSAGE
                                });
                            } else {
                                toast.error(`Error adding creating account: ${error.message}`);
                            }

                            setSubmitting(prevState => ({
                                ...prevState,
                                register: false
                            }));

                            toast.dismiss(recaptchaToastId);

                            if(termsToastId){
                                toast.dismiss(termsToastId);
                            }

                            window.recaptchaVerifier.clear();
                            props.setIsLoggingIn(false);
                        });
                },
                "expired-callback": () => {
                    toast.warn('Please solve the reCAPTCHA again!');
                    window.recaptchaVerifier.clear()
                }
            }, auth);
            window.recaptchaVerifier.render(); 
        }
    }

    return (
        <Wrapper>
            <Helmet>
                <title>Register {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <LLink to="/">
                <Button type="button">
                    <FaChevronLeft />
                    &nbsp; Return home
                </Button>
            </LLink>
            <H1>Register</H1>
            <form onSubmit={ registerForm.handleSubmit(registerUser) }>
                <Grid fluid>
                    <Row>
                        <Column sm={12} md={6}>
                            <Label htmlFor={INPUT.FIRST_NAME.VALUE} br>First Name:</Label>
                            <TextInput
                                type="text" 
                                placeholder={INPUT.FIRST_NAME.PLACEHOLDER} 
                                error={registerForm.formState.errors[INPUT.FIRST_NAME.VALUE]}
                                {
                                    ...registerForm.register(INPUT.FIRST_NAME.VALUE, { 
                                            required: INPUT.FIRST_NAME.ERRORS.REQUIRED,
                                            maxLength: {
                                                value: INPUT.FIRST_NAME.ERRORS.MAX.VALUE,
                                                message: INPUT.FIRST_NAME.ERRORS.MAX.MESSAGE
                                            },
                                            minLength: {
                                                value: INPUT.FIRST_NAME.ERRORS.MIN.VALUE,
                                                message: INPUT.FIRST_NAME.ERRORS.MIN.MESSAGE
                                            },
                                        }
                                    )
                                } 
                            />
                            <FormError error={registerForm.formState.errors[INPUT.FIRST_NAME.VALUE]} /> 
                        </Column>
                        <Column sm={12} md={6}>
                            <Label htmlFor={INPUT.LAST_NAME.VALUE} br>Last Name:</Label>
                            <TextInput
                                type="text" 
                                placeholder={INPUT.LAST_NAME.PLACEHOLDER} 
                                error={registerForm.formState.errors[INPUT.LAST_NAME.VALUE]}
                                {
                                    ...registerForm.register(INPUT.LAST_NAME.VALUE, { 
                                            required: INPUT.LAST_NAME.ERRORS.REQUIRED,
                                            maxLength: {
                                                value: INPUT.LAST_NAME.ERRORS.MAX.VALUE,
                                                message: INPUT.LAST_NAME.ERRORS.MAX.MESSAGE
                                            },
                                            minLength: {
                                                value: INPUT.LAST_NAME.ERRORS.MIN.VALUE,
                                                message: INPUT.LAST_NAME.ERRORS.MIN.MESSAGE
                                            },
                                        }
                                    )
                                } 
                            />
                            <FormError error={registerForm.formState.errors[INPUT.LAST_NAME.VALUE]} /> 
                        </Column>
                    </Row>
                    <Row>
                        <Column sm={12}>
                            <Label htmlFor={INPUT.EMAIL.VALUE} br>Email:</Label>
                            <TextInput
                                type="text" 
                                error={registerForm.formState.errors[INPUT.EMAIL.VALUE]}
                                placeholder={INPUT.EMAIL.PLACEHOLDER} 
                                {
                                    ...registerForm.register(INPUT.EMAIL.VALUE, { 
                                            required: INPUT.EMAIL.ERRORS.REQUIRED,
                                            pattern: {
                                                value: INPUT.EMAIL.ERRORS.PATTERN.VALUE,
                                                message: INPUT.EMAIL.ERRORS.PATTERN.MESSAGE
                                            },
                                        }
                                    )
                                } 
                            />
                            <FormError error={registerForm.formState.errors[INPUT.EMAIL.VALUE]} /> 
                        </Column>
                    </Row>
                    <Row>
                        <Column sm={12} md={6}>
                            <Label htmlFor={INPUT.PASSWORD.VALUE} br>Password:</Label>
                            <TextInput
                                type="password"
                                placeholder={INPUT.PASSWORD.PLACEHOLDER} 
                                error={registerForm.formState.errors[INPUT.PASSWORD.VALUE]}
                                { 
                                    ...registerForm.register(INPUT.PASSWORD.VALUE, {
                                        required: INPUT.PASSWORD.ERRORS.REQUIRED,
                                        maxLength: {
                                            value: INPUT.PASSWORD.ERRORS.MAX.VALUE,
                                            message: INPUT.PASSWORD.ERRORS.MAX.MESSAGE
                                        },
                                        minLength: {
                                            value: INPUT.PASSWORD.ERRORS.MIN.VALUE,
                                            message: INPUT.PASSWORD.ERRORS.MIN.MESSAGE
                                        },
                                    })
                                } 
                            />
                            <FormError error={registerForm.formState.errors[INPUT.PASSWORD.VALUE]} /> 
                        </Column>
                        <Column sm={12} md={6}>
                            <Label htmlFor={INPUT.CONFIRM_PASSWORD.VALUE} br>Confirm Password:</Label>
                            <TextInput
                                type="password"
                                placeholder={INPUT.CONFIRM_PASSWORD.PLACEHOLDER} 
                                error={registerForm.formState.errors[INPUT.CONFIRM_PASSWORD.VALUE]}
                                { 
                                    ...registerForm.register(INPUT.CONFIRM_PASSWORD.VALUE, {
                                        required: INPUT.CONFIRM_PASSWORD.ERRORS.REQUIRED,
                                        maxLength: {
                                            value: INPUT.CONFIRM_PASSWORD.ERRORS.MAX.VALUE,
                                            message: INPUT.CONFIRM_PASSWORD.ERRORS.MAX.MESSAGE
                                        },
                                        minLength: {
                                            value: INPUT.CONFIRM_PASSWORD.ERRORS.MIN.VALUE,
                                            message: INPUT.CONFIRM_PASSWORD.ERRORS.MIN.MESSAGE
                                        },
                                    })
                                } 
                            />
                            <FormError error={registerForm.formState.errors[INPUT.CONFIRM_PASSWORD.VALUE]} /> 
                        </Column>
                    </Row>                        
                    <Row>
                        <Column sm={12} textalign="center">
                            <CheckboxInput
                                error={registerForm.formState.errors.policyAccept}
                                {
                                    ...registerForm.register("policyAccept", {
                                        required: "Please accept the policies by checking the box above.",
                                    })
                                } 
                            />
                            <CheckboxLabel>
                                I accept the&nbsp;
                                <LLink to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</LLink> and&nbsp;
                                <LLink to="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</LLink>.
                            </CheckboxLabel>
                            <FormError error={registerForm.formState.errors.policyAccept} /> 
                        </Column>
                    </Row>
                    <Row>
                        <Column md={12} textalign="center">
                            <Button 
                                type="submit" 
                                disabled={submitting.register}
                            >
                                Submit
                            </Button>
                        </Column>
                    </Row>
                    <Row>
                        <Column md={12} textalign="center">
                            <LLink to="/login">
                                Already have an account?
                            </LLink>
                        </Column>
                    </Row>
                    <Row>
                        <Column md={12} textalign="center">
                            <Body size={SIZES.SM}>This site is protected by reCAPTCHA and the <ALink target="_blank" rel="noopener" href="https://policies.google.com">Google Privacy Policy and Terms of Service</ALink> apply.</Body>
                            <Recaptcha id="recaptcha" />
                        </Column>
                    </Row>
                </Grid>
            </form>
        </Wrapper>
    )
}

export default Register;