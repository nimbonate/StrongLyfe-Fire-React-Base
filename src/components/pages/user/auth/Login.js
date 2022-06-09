import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { FaChevronLeft } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { CgClose } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";

import { auth } from "../../../../Fire.js";
import { Column, Grid, Container, ModalCard, ModalContainer, Recaptcha, Row, Wrapper, Hr } from '../../../../utils/styles/misc.js';
import { ALink, Body, H1, H3, Label, LLink, SLink } from '../../../../utils/styles/text.js';
import { FormError } from '../../../misc/Misc';
import { INPUT, SIZES } from '../../../../utils/constants.js';
import { TextInput, Button } from '../../../../utils/styles/forms.js';

function UserLogin(props) {
    const navigate = useNavigate();

    const [verificationId, setVerificationId] = useState(null);
    const [mfaResolver, setMfaResolver] = useState(null);
    const [shownModals, setShownModals] = useState([]); 
    const [submitting, setSubmitting] = useState({ 
        login: false,
        vCode: false,
        forgotPassword: false,
    }); 
    
    const loginForm = useForm({
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const vCodeForm = useForm({
        defaultValues: {
            vCode: "",
        }
    });

    const forgotPasswordForm = useForm({
        defaultValues: {
            email: "",
        }
    });
    
    const toggleModal = (newStatus, index) => {
        let tempShownModals = [...shownModals]
        tempShownModals[index] = newStatus
        setShownModals(tempShownModals);
    };

    const loginUser = (data) => {
        const recaptchaToastId = toast.info('Please complete the reCAPTCHA below to continue.');
        window.recaptchaVerifier = new RecaptchaVerifier("recaptcha", {
            "size": "normal",
            "callback": (response) => {
                 // reCAPTCHA solved, allow signIn.
                 props.setIsLoggingIn(true);
                 signInWithEmailAndPassword(auth, data.email, data.password)
                    .then((userCredential) => {
                        // Signed in 
                        const tempUser = userCredential.user;
                        console.log("Logged in successfully: ");
                        console.log(tempUser);
                        // Clean up
                        toast.dismiss(recaptchaToastId);
                        window.recaptchaVerifier.clear();
                        navigate("/logging-in");
                        toast.success(`Logged in successfully!`);
                    }).catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        
                        console.log("Error signing in: " + errorCode + " - " + errorMessage);

                        if(errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password"){
                            toast.error(`Email or password was not accepted, please try another combination.`);
                        } else if(error.code === "auth/multi-factor-auth-required"){
                            console.log("MFA needed!");
                            let resolver = getMultiFactorResolver(auth, error);
                            let phoneInfoOptions = {
                                multiFactorHint: resolver.hints[0], // Just grabbing first factor source (phone)
                                session: resolver.session,
                            };
                            let phoneAuthProvider = new PhoneAuthProvider(auth);
                            // Send SMS verification code.
                            phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier).then((tempVerificationId) => {
                                toggleModal(true, "v-code");
                                setVerificationId(tempVerificationId);
                                setMfaResolver(resolver);
                                toast.success("We just sent that phone number a verification code, go grab the code and input it below!");
                            }).catch((error) => {
                                console.error("Error adding phone: ", error);
                                toast.error(`Error adding phone: ${error.message}`);
                                window.recaptchaVerifier.clear();
                            });
                        } else {
                            toast.error(`Error: ${errorMessage}`);
                        }
                        
                        // // Clean up
                        // setSubmitting(prevState => ({
                        //     ...prevState,
                        //     login: false
                        // }));
                        // window.recaptchaVerifier.clear();
                        // props.setIsLoggingIn(false);
                        // toast.dismiss(recaptchaToastId);
                    });
            },
            "expired-callback": () => {
                toast.warn('Please solve the reCAPTCHA again!');
                window.recaptchaVerifier.clear();
            }
        }, auth);
        window.recaptchaVerifier.render(); 
    }

    const submitVCode = (data) => {
        setSubmitting(prevState => ({
            ...prevState,
            vCode: true
        }));

        let cred = PhoneAuthProvider.credential(verificationId, data.vCode);
        let multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

        // Complete sign-in.
        mfaResolver.resolveSignIn(multiFactorAssertion).then((userCredential) => {
            // User successfully signed in with the second factor phone number.
            toast.success("Successfully logged in with two factor authentication (2FA)!");
            setSubmitting(prevState => ({
                ...prevState,
                vCode: false,
                login: false,
            }));
            toggleModal(false, "v-code");
            vCodeForm.reset();
            navigate("/logging-in");
        }).catch(error => {
            setSubmitting(prevState => ({
                ...prevState,
                vCode: false
            }));

            if(error.code === "auth/invalid-verification-code"){
                console.error(`The code you entered was not correct, please try again.`);
                toast.error("The code you entered was not correct, please try again.");
            } else { 
                console.error(`Error with entered code: ${error}`);
                toast.error(`Error with entered code: ${error.message}`);
            }
            
        });
    }

    const sendPasswordReset = (data) => {
        setSubmitting(prevState => ({
            ...prevState,
            forgotPassword: true
        }));
        sendPasswordResetEmail(auth, data.email).then(() => {
            toast.success('Check your email for a password reset link!');
            toggleModal(false, "forgot-password");
            setSubmitting(prevState => ({
                ...prevState,
                forgotPassword: false
            }));
        }).catch((error) => {
            toast.error(`Error sending password reset: ${error}`);
            setSubmitting(prevState => ({
                ...prevState,
                forgotPassword: false
            }));
        });
    }
  
    return (
        <Wrapper>
            <Helmet>
                <title>Login {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <LLink to="/">
                <Button type="button">
                    <FaChevronLeft />
                    &nbsp; Return home
                </Button>
            </LLink>
            <Container size={SIZES.LG}>
                <form onSubmit={ loginForm.handleSubmit(loginUser) }>
                    <Grid fluid>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <H1>Login</H1>
                            </Column>
                        </Row>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <Label htmlFor={INPUT.EMAIL.VALUE} br>Email:</Label>
                                <TextInput
                                    type="text" 
                                    error={loginForm.formState.errors[INPUT.EMAIL.VALUE]}
                                    placeholder={INPUT.EMAIL.PLACEHOLDER} 
                                    {
                                        ...loginForm.register(INPUT.EMAIL.VALUE, { 
                                                required: INPUT.EMAIL.ERRORS.REQUIRED,
                                                pattern: {
                                                    value: INPUT.EMAIL.ERRORS.PATTERN.VALUE,
                                                    message: INPUT.EMAIL.ERRORS.PATTERN.MESSAGE
                                                },
                                            }
                                        )
                                    } 
                                />
                                <FormError error={loginForm.formState.errors[INPUT.EMAIL.VALUE]} /> 
                            </Column>
                        </Row>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <Label htmlFor={INPUT.PASSWORD.VALUE} br>Password:</Label>
                                <TextInput
                                    type="password"
                                    error={loginForm.formState.errors[INPUT.PASSWORD.VALUE]}
                                    placeholder={INPUT.PASSWORD.PLACEHOLDER} 
                                    { 
                                        ...loginForm.register(INPUT.PASSWORD.VALUE, {
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
                                <FormError error={loginForm.formState.errors[INPUT.PASSWORD.VALUE]} /> 
                            </Column>
                            
                        </Row>
                        <Row>
                            <Column md={12} textalign="center">
                                <Button 
                                    type="submit" 
                                    disabled={submitting.login}
                                >
                                    Submit
                                </Button>
                            </Column>
                        </Row>
                        <Row>
                            <Column md={12} textalign="center">
                                <LLink to="/register">
                                    Don't have an account?
                                </LLink>
                            </Column>
                        </Row>
                        <Row>
                            <Column md={12} textalign="center">
                                <SLink onClick={() => toggleModal(true, "forgot-password")}>Forgot password?</SLink>
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
            </Container>

            {shownModals["v-code"] && (
                <ModalContainer onClick={() => toggleModal(false, "v-code")}>
                    <ModalCard onClick={(e) => e.stopPropagation()}>
                        <H3>Verify with 2FA</H3>
                        <Body>Enter the verification code we just sent to your phone number below to verify account ownership.</Body>
                        <form onSubmit={ vCodeForm.handleSubmit(submitVCode) }>
                            <Grid fluid>
                                <Row justify="center">
                                    <Column md={12} lg={8}>
                                        <Label htmlFor={"vCode"} br>Verification Code</Label>
                                        <TextInput
                                            type="text" 
                                            error={vCodeForm.formState.errors.vCode}
                                            placeholder={"12345"} 
                                            {
                                                ...vCodeForm.register("vCode", { 
                                                        required: "You must enter the verification code sent to your phone number to continue.",
                                                    }
                                                )
                                            } 
                                        />
                                        <FormError error={vCodeForm.formState.errors.vCode} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column md={12} textalign="center">
                                        <Button 
                                            type="submit" 
                                            disabled={submitting.vCode}
                                        >
                                            Submit
                                        </Button>
                                    </Column>
                                </Row>
                            </Grid>
                        </form>
                        <Hr />
                        <Button 
                            type="button"
                            size={SIZES.SM} 
                            onClick={() => toggleModal(false, "v-code")}
                        >
                            <CgClose /> Close 
                        </Button>
                    </ModalCard>
                </ModalContainer>
            )}

            {shownModals["forgot-password"] && (
                <ModalContainer onClick={() => toggleModal(false, "forgot-password")}>
                    <ModalCard onClick={(e) => e.stopPropagation()}>
                        <H3>Forgot Password</H3>
                        <Body>Enter your email below and we will send you an email for you to reset your password.</Body>
                        <form onSubmit={ forgotPasswordForm.handleSubmit(sendPasswordReset) }>
                            <Grid fluid>
                                <Row justify="center">
                                    <Column md={12} lg={8}>
                                        <Label htmlFor={INPUT.EMAIL.VALUE} br>Your Email:</Label>
                                        <TextInput
                                            type="text"
                                            error={forgotPasswordForm.formState.errors[INPUT.EMAIL.VALUE]}
                                            placeholder={INPUT.EMAIL.PLACEHOLDER}
                                            {
                                                ...forgotPasswordForm.register(INPUT.EMAIL.VALUE, { 
                                                        required: INPUT.EMAIL.ERRORS.REQUIRED,
                                                        pattern: {
                                                            value: INPUT.EMAIL.ERRORS.PATTERN.VALUE,
                                                            message: INPUT.EMAIL.ERRORS.PATTERN.MESSAGE
                                                        },
                                                    }
                                                )
                                            } 
                                        />
                                        <FormError error={forgotPasswordForm.formState.errors[INPUT.EMAIL.VALUE]} /> 
                                    </Column>
                                </Row>
                                <Row>
                                    <Column md={12} textalign="center">
                                        <Button 
                                            type="submit" 
                                            disabled={submitting.forgotPassword}
                                        >
                                            Send link
                                        </Button>
                                    </Column>
                                </Row>
                            </Grid>
                        </form>
                        <Hr />
                        <Button 
                            type="button"
                            size={SIZES.SM} 
                            onClick={() => toggleModal(false, "forgot-password")}
                        >
                            <CgClose /> Close 
                        </Button>
                    </ModalCard>
                </ModalContainer>
            )}
        </Wrapper>
    ) 
}

export default UserLogin;