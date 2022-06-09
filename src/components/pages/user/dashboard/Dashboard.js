import React from 'react';
import { signOut } from 'firebase/auth';
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { FaCog, FaUserEdit } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { auth } from "../../../../Fire.js";
import { LLink, H1, H3, Body } from '../../../../utils/styles/text.js';
import { Button } from '../../../../utils/styles/forms.js';
import { Hr } from '../../../../utils/styles/misc.js';
import ConfirmAlert from '../../../misc/ConfirmAlert';
import { APHORISMS, SCHEMES } from '../../../../utils/constants.js';

function Dashboard(props) {
    const theme = useTheme();
    const navigate = useNavigate();
    const quote = APHORISMS[Math.floor(Math.random() * APHORISMS.length)];

    const logOut = () => {
        signOut(auth).then(() => {
            navigate("/")
            console.log("Sign out successful.");
            toast.success(`Signed out successfully!`);
            props.cleanUpLogout();
        }).catch((error) => {
            console.error("Error signing out: " + error);
            toast.error(`Error signing out: ${error}`);
        });
    }
    
    return (
        <>
            <Helmet>
                <title>Dashboard {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <H1>{props?.user.firstName}'s Dashboard</H1>
            <H3 margin="0"></H3>
            <Body color={theme.value === SCHEMES.DARK ? theme.colors.lightGrey : theme.colors.grey} margin="5px 0 15px 0">{quote}</Body>
            <LLink to={`/dashboard/profile`}> 
                <Button type="button">
                    Edit your profile <FaUserEdit size={20} />
                </Button>
            </LLink>
            <Hr/>
            {props.readOnlyFlags?.isAdmin && (
                <LLink to={`/dashboard/admin`}> 
                    <Button type="button">
                        Admin Dashboard <FaCog /> 
                    </Button>
                </LLink>
            )}
            <Button 
                type="button"
                color={theme.colors.red}
                onClick={() =>         
                    confirmAlert({
                        customUI: ({ onClose }) => {
                            return (
                                <ConfirmAlert 
                                    theme={theme}
                                    onClose={onClose} 
                                    headingText={`Log out?`}
                                    body={<span>Are you sure you want to log out?</span>}
                                    yesFunc={logOut} 
                                    yesText={`Yes`} 
                                    noFunc={function () {}} 
                                    noText={`Cancel`}   
                                />
                            );
                        }
                    })}
                >
                Log out
            </Button>
        </>
    )
        
}

export default Dashboard;