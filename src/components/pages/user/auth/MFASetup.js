import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { auth, firestore } from '../../../../Fire';
import { INPUT, SIZES } from '../../../../utils/constants';
import { Button, TextInput } from '../../../../utils/styles/forms';
import { Column, Grid, Recaptcha, Row } from '../../../../utils/styles/misc';
import { ALink, Body, Label } from '../../../../utils/styles/text';
import { FormError } from '../../../misc/Misc';

export default function MfaSetup(props) {
    const [vCodeSent, setVCodeSent] = useState(false);
    const [verificationId, setVerificationId] = useState(null);
    const [enteredPhone, setEnteredPhone] = useState(null);
    const [submitting, setSubmitting] = useState({
        vCode: false,
    }); 
    
    const phoneForm = useForm({
        defaultValues: {
            phone: "",
        }
    });
    
    const vCodeForm = useForm({
        defaultValues: {
            vCode: "",
        }
    });

    const sendVCodeToNewPhone = (data) => {
        if(data.phone.substring(0, 2) !== "+1"){
            // This validation only is valid for US numbers!
            toast.warn("Please reformat your phone number to international format such as: +1 234 567 8901");
        } else {
            const recaptchaToastId = toast.info("Please complete the reCAPTCHA below to continue.");
            // TODO: should this be added to every form to cover the case of the user re-submits with changed data, but unfinished recaptcha?
            // if(window.recaptchaVerifier){
            //     window.recaptchaVerifier.clear();
            // }
            
            window.recaptchaVerifier = new RecaptchaVerifier("recaptcha", {
                "size": "normal",
                "callback": (response) => {
                    const user = auth.currentUser;
                    const mfaUser = multiFactor(user);
                    mfaUser.getSession().then((multiFactorSession) => {
                        // Specify the phone number and pass the MFA session.
                        let phoneInfoOptions = {
                            phoneNumber: data.phone,
                            session: multiFactorSession
                        };
                        let phoneAuthProvider = new PhoneAuthProvider(auth);
                        // Send SMS verification code.
                        phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier).then((tempVerificationId) => {
                            setVCodeSent(true);
                            setVerificationId(tempVerificationId);
                            setEnteredPhone(data.phone);
                            toast.dismiss(recaptchaToastId);
                            toast.success("We just sent that phone number a verification code, go grab the code and input it below!");
                            window.recaptchaVerifier.clear();
                        }).catch((error) => {
                            console.error("Error adding phone: ", error);
                            toast.error(`Error adding phone: ${error.message}`);
                            toast.dismiss(recaptchaToastId);
                            window.recaptchaVerifier.clear();
                        });
                    }).catch((error) => {
                        console.error("Error adding multi-factor authentication: ", error);
                        toast.error(`Error adding multi-factor authentication: ${error}`);
                        toast.dismiss(recaptchaToastId);
                        window.recaptchaVerifier.clear();
                    });
                },
                "expired-callback": () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                    toast.warn("Please solve the reCAPTCHA again!");
                    window.recaptchaVerifier.clear();
                }
            }, auth);
            
            window.recaptchaVerifier.render();
        }
        
    }

    const submitNewPhoneVCode = (data) => {
        setSubmitting(prevState => ({
            ...prevState,
            vCode: true
        }));
        
        let cred = PhoneAuthProvider.credential(verificationId, data.vCode);
        let multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
        const user = auth.currentUser;
        const mfaUser = multiFactor(user);
        mfaUser.enroll(multiFactorAssertion, props.fireUser.userName).then(response => {
            if(props.user.phone){
                // Unenroll old phone number if user has one
                mfaUser.unenroll(mfaUser.enrolledFactors[0]).then(() => {
                    console.log("Successful removed old phone.");
                }).catch((error) => {
                    console.error("Error removing old phone", error);
                });
            }

            updateDoc(doc(firestore, "users", props.fireUser.uid), {
                phone: enteredPhone,
            }).then(() => {
                console.log("Successful updated user on Firestore.");
            }).catch((error) => {
                console.error("Error updating user document: ", error);
                toast.error(`Error updating user details: ${error}`);
            });
            
            toast.success("Successfully updated phone number!");
            props.setPhoneField("phone", enteredPhone);
            props.toggleModal(false, "mfa-setup");
            setSubmitting(prevState => ({
                ...prevState,
                vCode: false,
            }));
            setVCodeSent(false);

        }).catch(error => {
            console.error(`Error with entered code: ${error.message}`);
            toast.error(`Error with entered code: ${error.message}`);
        });
    }

    return (
        <>
        {!vCodeSent && (
            <form onSubmit={ phoneForm.handleSubmit(sendVCodeToNewPhone) }>
                <Grid fluid>
                    <Row justify="center">
                        <Column md={12} lg={8}>
                            <Label htmlFor={INPUT.PHONE.VALUE} br>Phone:</Label>
                            <TextInput
                                type="text" 
                                error={phoneForm.formState.errors[INPUT.PHONE.VALUE]}
                                placeholder={INPUT.PHONE.PLACEHOLDER} 
                                {
                                    ...phoneForm.register(INPUT.PHONE.VALUE, { 
                                            required: INPUT.PHONE.ERRORS.REQUIRED,
                                        }
                                    )
                                } 
                            />
                            <FormError error={phoneForm.formState.errors[INPUT.PHONE.VALUE]} /> 
                        </Column>
                    </Row>
                    <Row>
                        <Column md={12} textalign="center">
                            <Button 
                                type="submit" 
                                disabled={submitting.phone}
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
            <form onSubmit={ vCodeForm.handleSubmit(submitNewPhoneVCode) }>
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
