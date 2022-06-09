import React, { useRef, useState, useEffect } from 'react';
import { multiFactor, sendEmailVerification } from 'firebase/auth';
import { useTheme } from 'styled-components';
import { BiCheck } from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AiOutlineReload } from 'react-icons/ai';

import { auth } from '../../../../Fire';
import { BTYPES } from '../../../../utils/constants';
import { Button } from '../../../../utils/styles/forms';
import { Body } from '../../../../utils/styles/text';
import { toast } from 'react-toastify';

export default function AccountSecurityStatus(props) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [emailVerifySent, setEmailVerifySent] = useState(false); 
    const [refreshButtonShown, setRefreshButtonShown] = useState(false); 
    const mfaUser = multiFactor(props.fireUser);
    const verifyEmailTimer = useRef();
    
    useEffect(() => {
        return () => {clearTimeout(verifyEmailTimer.current)};
    }, [verifyEmailTimer]);

    const sendEmailVerifyLink = () => {
        sendEmailVerification(auth.currentUser).then(() => {
            console.log(`Successfully sent a verification email to ${props.fireUser.email}.`);
            setEmailVerifySent(true)
            verifyEmailTimer.current = setTimeout(() => {
                setRefreshButtonShown(true)
            }, 6000);
        }).catch((error) => {
            if(error.code === "auth/too-many-requests"){
                toast.error("You are sending too many verification requests, please try again in a little bit.");
                setRefreshButtonShown(true);
            }
            console.error(error);
        });
    }

    if (!props.fireUser.emailVerified && !emailVerifySent) {
        return (
            <Button type="button" onClick={() => sendEmailVerifyLink()} color={theme.colors.green}>
                Verify Email
            </Button>
        )
    } else if (emailVerifySent && !refreshButtonShown) {
        return (
            <Body color={theme.colors.yellow} display="inline">Email sent, check your email inbox!</Body>
        )
    } else if (emailVerifySent && refreshButtonShown) {
        return (
            <Button type="button" onClick={() => navigate(0)} btype={BTYPES.INVERTED} color={theme.colors.green}>
                <AiOutlineReload /> Reload page
            </Button>
        )
    } else if (props.fireUser.emailVerified && (!mfaUser || ((mfaUser?.enrolledFactors.length ?? 0) === 0))) {
        return (
            <>
                <Body margin="5px 0" color={theme.colors.green}>
                    <BiCheck /> Email verified!
                </Body>
                <Button
                    type="button"
                    onClick={() => props.toggleModal(true, "reauth-mfa")}
                    btype={BTYPES.INVERTED}
                    color={theme.colors.green}
                >
                    Fully secure your account with 2FA <FaUserShield />
                </Button>
            </>
            
        )
    } else if (mfaUser.enrolledFactors && mfaUser.enrolledFactors.length !== 0) {
        return (
            <Body display="inline" color={theme.colors.green}>
                Account secured with 2FA <FaUserShield />
            </Body>
        )
    } else {
        return <Body color={theme.colors.red}>Error! Contact {props.site.emails.support} for assistance.</Body>;
    }
}
