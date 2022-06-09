import React from 'react';
import { FaChevronUp } from 'react-icons/fa';

import { FooterContainer } from "../../utils/styles/footer";
import { Column, Grid, Row } from '../../utils/styles/misc';
import { LLink, SLink} from "../../utils/styles/text";

function Footer(props) {
    const year = new Date().getFullYear();
    const backToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <FooterContainer>
                <Grid fluid>
                    <Row justify="between">
                        <Column sm={12} md={4} margin="5px 0">
                            <Row>
                                <Column lg={12} xl={4}>
                                    <LLink to="/privacy-policy">Privacy Policy</LLink>
                                </Column>  
                                <Column lg={12} xl={4}>
                                    <LLink to="/terms-conditions">Terms &amp; Conditions</LLink>
                                </Column>  
                                <Column lg={12} xl={4}>
                                    <LLink to="/credits">Credits</LLink>
                                </Column>  
                            </Row>
                        </Column>
                        <Column sm={12} md={4} margin="5px 0">
                            <SLink>
                                {props?.site?.name ?? ""}
                                {' '}
                                &copy;
                                {' '}
                                {year}
                            </SLink>
                        </Column>
                        <Column sm={12} md={4} margin="5px 0">
                            <SLink onClick={() => backToTop()}>
                                Back to top <FaChevronUp /> 
                            </SLink>
                        </Column>
                    </Row>    
                </Grid>
            </FooterContainer>
        </>
        
    )
}

export default Footer;