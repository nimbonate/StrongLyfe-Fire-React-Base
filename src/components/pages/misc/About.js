import React from 'react';
import { Helmet } from 'react-helmet-async';

import { ANIMAL_GALLERY } from '../../../utils/constants';
import { Centered, Hr, Wrapper } from '../../../utils/styles/misc';
import { Img } from '../../../utils/styles/images';
import { ALink, Body, H1, H3 } from '../../../utils/styles/text';
import ContactForm from '../../misc/ContactForm';
import PhotoGallery from '../../misc/PhotoGallery';

function About(props){
    return (
        <Wrapper>
            <Helmet>
                <title>About {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <H1>About</H1>
            <Body>
                Fire React Base was created by <ALink href="https://www.douglasrcjames.com" target="_blank" rel="noopener">Douglas R.C. James</ALink> as a clean slate for all future projects. 
                Includes user authentication, admin roles, contact form, database, server side functions, and more! 
                To demonstrate how to insert an image with this template, I am going to place a pic of my cat into this paragraph like you might see on an about page!
            </Body>
            <Img 
                width="150px" 
                margin="15px"
                rounded 
                float="right" 
                src={require("../../../assets/images/misc/animals/cat.png")}
                alt={"doug's cat"}
            />
            <Body>
                Adipisicing labore consectetur pariatur consectetur ullamco voluptate fugiat nostrud eiusmod officia do. Non sint sint eu ullamco fugiat consequat. 
                Eu ex qui et est nostrud exercitation dolor non nostrud exercitation ad Lorem. Adipisicing cillum irure laboris anim duis in qui excepteur proident. 
                Excepteur eu proident duis consectetur voluptate nulla adipisicing reprehenderit cupidatat labore. Id excepteur ut sint ullamco enim occaecat pariatur tempor laborum.
            </Body>
            <Body>
                Fugiat fugiat reprehenderit eiusmod nostrud in qui dolor aute anim duis ullamco deserunt ipsum. Elit Lorem enim sint sit eiusmod. 
                Dolor cillum Lorem occaecat nulla tempor veniam. Quis eiusmod dolore incididunt laboris aliqua quis ea do. Do adipisicing laborum nostrud ea consectetur. 
                Tempor aliquip labore sit consectetur aliquip voluptate aliqua exercitation duis duis. Elit minim enim dolor consectetur sit minim sit mollit officia cupidatat.
            </Body>
            <Body>
                Eu ex qui et est nostrud exercitation dolor non nostrud exercitation ad Lorem. Adipisicing cillum irure laboris anim duis in qui excepteur proident. 
                Fugiat fugiat reprehenderit eiusmod nostrud in qui dolor aute anim duis ullamco deserunt ipsum. Elit Lorem enim sint sit eiusmod. 
                Dolor cillum Lorem occaecat nulla tempor veniam. Quis eiusmod dolore incididunt laboris aliqua quis ea do. Do adipisicing laborum nostrud ea consectetur. 
                Tempor aliquip labore sit consectetur aliquip voluptate aliqua exercitation duis duis. Elit minim enim dolor consectetur sit minim sit mollit officia cupidatat.
                Dolor cillum Lorem occaecat... Dolor cillum Lorem occaecat ....
            </Body>
            
            <Body>
                In occaecat occaecat nulla culpa dolor sit ipsum id id laborum aute deserunt. 
                Quis ipsum nostrud cupidatat magna eiusmod aliqua eiusmod reprehenderit aute reprehenderit officia enim. Aute Lorem culpa mollit anim sit.
                Mollit irure exercitation reprehenderit voluptate sunt et. Officia aliquip et cillum elit occaecat pariatur et incididunt tempor. Voluptate laboris sit officia mollit irure.
                Cupidatat laborum ex qui officia duis mollit magna sunt nulla quis incididunt non ea. Amet aliquip nostrud voluptate ex eiusmod. Cupidatat pariatur eu reprehenderit sunt nisi. 
                Ex est ea aliquip consequat adipisicing est. Lorem do irure excepteur est elit culpa deserunt cupidatat esse. Duis aliqua do dolor Lorem duis nostrud cupidatat ea aute excepteur esse. Eiusmod adipisicing dolor ullamco id.
            </Body>
            <Centered>
                <H3>Animal Gallery</H3>
                <PhotoGallery photos={ANIMAL_GALLERY} />
            </Centered>
            
            <Hr/>
            <ContactForm />
        </Wrapper>
    );
}

export default About;