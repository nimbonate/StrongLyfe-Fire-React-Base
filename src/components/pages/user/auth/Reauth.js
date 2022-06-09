import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { EmailAuthProvider, getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, reauthenticateWithCredential, RecaptchaVerifier } from 'firebase/auth';

import { auth } from '../../../../Fire';
import { INPUT, SIZES } from '../../../../utils/constants';
import { Button, TextInput } from '../../../../utils/styles/forms';
import { Column, Grid, Recaptcha, Row } from '../../../../utils/styles/misc';
import { ALink, Body, Label } from '../../../../utils/styles/text';
import { FormError } from '../../../misc/Misc';

export default function Reauth(props) {
    const [vCodeSent, setVCodeSent] = useState(false);
    const [verificationId, setVerificationId] = useState(null);
    const [mfaResolver, setMfaResolver] = useState(null);

    const [submitting, setSubmitting] = useState({ 
        vCode: false,
    }); 
    
    const reauthForm = useForm({
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

    const reauthUser = (data) => {
        // ** No need to setSubmitting if using recaptcha, submission will only conintue to send below info alert!
        // I tried implementing, but user will get stuck/confused if they:
        // 1. start a recaptcha -> 2. change their field value before finishing recaptcha -> 3. try to press Submit button again and it will be disabled
        const recaptchaToastId = toast.info('Please complete the reCAPTCHA below to continue.');
        window.recaptchaVerifier = new RecaptchaVerifier("recaptcha", {
            "size": "normal",
            "callback": (response, error) => {
                // reCAPTCHA solved, allow signIn.
                const user = auth.currentUser;
                let credentials = EmailAuthProvider.credential(
                    data.email,
                    data.password,
                );
                
                toast.dismiss(recaptchaToastId);
                reauthenticateWithCredential(user, credentials).then(() => {
                    // First time users will go this path
                    toast.success("Your account has been reauthenticated!");
                    props.onSuccess(true, props.destination);
                    window.recaptchaVerifier.clear();
                }).catch((error) => {
                    if(error.code === "auth/multi-factor-auth-required"){
                        console.log("MFA needed!");
                        let resolver = getMultiFactorResolver(auth, error);
                        let phoneInfoOptions = {
                            multiFactorHint: resolver.hints[0], // Just grabbing first factor source (phone)
                            session: resolver.session,
                        };
                        let phoneAuthProvider = new PhoneAuthProvider(auth);
                        // Send SMS verification code.
                        phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier).then((tempVerificationId) => {
                            setVCodeSent(true);
                            setVerificationId(tempVerificationId);
                            setMfaResolver(resolver);
                            toast.success("We just sent that phone number a verification code, go grab the code and input it below!");
                        }).catch((error) => {
                            console.error("Error adding phone: ", error);
                            toast.error(`Error adding phone: ${error.message}`);
                            window.recaptchaVerifier.clear();
                        });
                    } else if(error.code === "auth/wrong-password"){
                        toast.error(`Sorry, but that doesn't look like the right password. Please try again.`);
                        console.error("Error logging you in: " + error);
                        window.recaptchaVerifier.clear();
                    } else if(error.code === "auth/user-mismatch"){
                        toast.error(`Sorry, but that doesn't look the credentials are correct. Are you sure that is the right email? Check and try again.`);
                        console.error("Error logging you in: " + error);
                        window.recaptchaVerifier.clear();
                    } else {
                        toast.error(`Error logging you in, please try again: ${error}`);
                        console.error("Error logging you in: " + error);
                        window.recaptchaVerifier.clear();
                    }
                });
            },
            "expired-callback": () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                toast.warn("Please solve the reCAPTCHA again!");
                window.recaptchaVerifier.clear();
                toast.dismiss(recaptchaToastId);
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
            toast.success("Successfully logged in with two factor authentication!");
            setVCodeSent(false);
            setSubmitting(prevState => ({
                ...prevState,
                vCode: false
            }));
            vCodeForm.reset();
            props.onSuccess(true, props.destination);
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

    return (
        <>
            {!vCodeSent && (
                <form onSubmit={ reauthForm.handleSubmit(reauthUser) }>
                    <Grid fluid>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <Label htmlFor={INPUT.EMAIL.VALUE} br>Email:</Label>
                                <TextInput
                                    type="text" 
                                    error={reauthForm.formState.errors[INPUT.EMAIL.VALUE]}
                                    placeholder={INPUT.EMAIL.PLACEHOLDER} 
                                    {
                                        ...reauthForm.register(INPUT.EMAIL.VALUE, { 
                                                required: INPUT.EMAIL.ERRORS.REQUIRED,
                                                pattern: {
                                                    value: INPUT.EMAIL.ERRORS.PATTERN.VALUE,
                                                    message: INPUT.EMAIL.ERRORS.PATTERN.MESSAGE
                                                },
                                            }
                                        )
                                    } 
                                />
                                <FormError error={reauthForm.formState.errors[INPUT.EMAIL.VALUE]} /> 
                            </Column>
                        </Row>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <Label htmlFor={INPUT.PASSWORD.VALUE} br>Password:</Label>
                                <TextInput
                                    type="password"
                                    error={reauthForm.formState.errors[INPUT.PASSWORD.VALUE]}
                                    placeholder={INPUT.PASSWORD.PLACEHOLDER} 
                                    { 
                                        ...reauthForm.register(INPUT.PASSWORD.VALUE, {
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
                                <FormError error={reauthForm.formState.errors[INPUT.PASSWORD.VALUE]} /> 
                            </Column>
                            
                        </Row>
                        <Row>
                            <Column md={12} textalign="center">
                                <Button 
                                    type="submit" 
                                    disabled={submitting.reauth}
                                >
                                    Submit
                                </Button>
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
            )}
            
            {vCodeSent && (
                <form onSubmit={ vCodeForm.handleSubmit(submitVCode) }>
                    <Grid fluid>
                        <Row justify="center">
                            <Column md={12} lg={8}>
                                <Label htmlFor={"vCode"} br>Enter the verification code sent to your phone number:</Label>
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
            )}
        </>
    )
}
