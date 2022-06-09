import React, { useState } from 'react'
import { collection, addDoc } from "firebase/firestore"; 
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa"
import { useTheme } from 'styled-components';

import { firestore } from "../../Fire";
import { CheckboxInput, CheckboxLabel, TextAreaInput, TextInput, Button } from '../../utils/styles/forms';
import { FormError } from '../misc/Misc';
import { H1, H3, Label, LLink } from '../../utils/styles/text.js';
import { Centered, Column, Grid, Row } from '../../utils/styles/misc.js';
import { INPUT } from '../../utils/constants.js';

function ContactForm(props) {
    const theme = useTheme();
    const contactForm = useForm({
        defaultValues: {
            name: "",
            email: "",
            body: "",
            policyAccept: false
        }
    });

    const [messageSent, setMessageSent] = useState(false);
    const [submitting, setSubmitting] = useState({ 
        message: false,
    }); 

    const submitMessage = (data) => {   
        setSubmitting(prevState => ({
            ...prevState,
            message: true
        }));

        addDoc(collection(firestore, "messages"), {
            name: data.name,
            email: data.email,
            body: data.body,
            timestamp: Date.now(),
        }).then(() => {
            setSubmitting(prevState => ({
                ...prevState,
                message: false
            }));
            setMessageSent(true);
            toast.success(`Message submitted successfully, thanks!`);
            contactForm.reset();
        }).catch(error => {
            toast.error(`Error submitting message: ${error}`);
            setSubmitting(prevState => ({
                ...prevState,
                message: false
            }));
        });
    }

    if(messageSent){
        return (
            <>
            <H1>Contact Form</H1>
            <Centered>
                <H3 color={theme.colors.green}><FaCheck /> Submitted.</H3>
            </Centered>
            </>
        )
    } else {
        return (
            <>
                <H1>Contact Form</H1>
                <form onSubmit={ contactForm.handleSubmit(submitMessage) }>
                    <Grid fluid>
                        <Row>
                            <Column sm={12} md={6}>
                                <Label htmlFor={INPUT.NAME.VALUE} br>{INPUT.NAME.LABEL}:</Label>
                                <TextInput 
                                    type="text" 
                                    error={contactForm.formState.errors[INPUT.NAME.VALUE]}
                                    placeholder={`${INPUT.NAME.PLACEHOLDER}`} 
                                    { 
                                        ...contactForm.register(INPUT.NAME.VALUE, {
                                            required: INPUT.NAME.ERRORS.REQUIRED,
                                            maxLength: {
                                                value: INPUT.NAME.ERRORS.MAX.VALUE,
                                                message: INPUT.NAME.ERRORS.MAX.MESSAGE
                                            },
                                            minLength: {
                                                value: INPUT.NAME.ERRORS.MIN.VALUE,
                                                message: INPUT.NAME.ERRORS.MIN.MESSAGE
                                            },
                                        })
                                    } 
                                />
                                <FormError error={contactForm.formState.errors[INPUT.NAME.VALUE]} /> 
                            </Column>
                            <Column sm={12} md={6}>
                                <Label htmlFor={INPUT.EMAIL.VALUE} br>{INPUT.EMAIL.LABEL}:</Label>
                                <TextInput 
                                    type="text" 
                                    error={contactForm.formState.errors[INPUT.EMAIL.VALUE]}
                                    placeholder={INPUT.EMAIL.PLACEHOLDER} 
                                    {
                                        ...contactForm.register(INPUT.EMAIL.VALUE, { 
                                                required: INPUT.EMAIL.ERRORS.REQUIRED,
                                                pattern: {
                                                    value: INPUT.EMAIL.ERRORS.PATTERN.VALUE,
                                                    message: INPUT.EMAIL.ERRORS.PATTERN.MESSAGE
                                                },
                                            }
                                        )
                                    } 
                                />
                                <FormError error={contactForm.formState.errors[INPUT.EMAIL.VALUE]} /> 
                            </Column>
                        </Row>
                        <Row>
                            <Column sm={12}>
                                <Label htmlFor={INPUT.BODY.VALUE} br>{INPUT.BODY.LABEL}:</Label>
                                <TextAreaInput 
                                    placeholder={INPUT.BODY.PLACEHOLDER}  
                                    error={contactForm.formState.errors[INPUT.BODY.VALUE]}
                                    {
                                        ...contactForm.register(INPUT.BODY.VALUE, {
                                            required: INPUT.BODY.ERRORS.REQUIRED,
                                            maxLength: {
                                                value: INPUT.BODY.ERRORS.MAX.VALUE,
                                                message: INPUT.BODY.ERRORS.MAX.MESSAGE
                                            },
                                            minLength: {
                                                value: INPUT.BODY.ERRORS.MIN.VALUE,
                                                message: INPUT.BODY.ERRORS.MIN.MESSAGE
                                            },
                                        })
                                    } 
                                />
                                <FormError error={contactForm.formState.errors[INPUT.BODY.VALUE]} /> 
                            </Column>
                        </Row>
                        <Row>
                            <Column sm={12} textalign="center">
                                <CheckboxInput 
                                    error={contactForm.formState.errors.policyAccept}
                                    {
                                        ...contactForm.register("policyAccept", {
                                            required: "Please accept the policies by checking the box above.",
                                        })
                                    } 
                                />
                                <CheckboxLabel>
                                    I accept the&nbsp;
                                    <LLink to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</LLink> and&nbsp;
                                    <LLink to="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</LLink>.
                                </CheckboxLabel>
                                <FormError error={contactForm.formState.errors.policyAccept} /> 
                            </Column>
                        </Row>
                        <Row>
                            <Column sm={12} textalign="center">
                                <Button 
                                    type="submit" 
                                    disabled={submitting.message}
                                >
                                    Submit
                                </Button>
                            </Column>
                        </Row>
                    </Grid>
                </form>
            </>
        )
    }
}

export default ContactForm;