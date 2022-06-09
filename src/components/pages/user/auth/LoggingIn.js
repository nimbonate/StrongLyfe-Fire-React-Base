import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { Wrapper } from '../../../../utils/styles/misc';
import { Spinner } from '../../../../utils/styles/images';
import { H2 } from '../../../../utils/styles/text';

function LoggingIn(props) {
    const navigate = useNavigate();
    
    useEffect(() => {
        let timer = setTimeout(() => {
            navigate("/dashboard");
            props.setIsLoggingIn(false);
        }, 2000);

        return () => {clearTimeout(timer)};
    })
    
    return (
        <Wrapper>
            <Helmet>
                <title>Logging in... {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <H2>Success! Redirecting you now... <Spinner /></H2>
        </Wrapper>
    )
}

export default (LoggingIn);