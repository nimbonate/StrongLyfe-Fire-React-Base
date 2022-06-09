import React, { useEffect, useRef } from "react";
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { useLocation } from "react-router-dom";

import { ErrorText } from '../../utils/styles/text'
import { TooltipContainer } from '../../utils/styles/misc'
import { analytics } from "../../Fire";

export function FirebaseAnalytics() {
    let location = useLocation();
    useEffect(() => {
        const fireAnalytics = analytics;
        if (typeof fireAnalytics === "function") {
            const page_path = location.pathname + location.search;
            fireAnalytics().setCurrentScreen(page_path);
            fireAnalytics().logEvent("page_view", { page_path });
        }
    }, [location]);
    return null;
}

export function FormError(props) {
    return (
        <div>
            {props.error ? (
                <ErrorText>{props.error.message}</ErrorText>
            ) : (
                ""
            )}
        </div>
    )
}

export function StartAtTop() {
    const { pathname, hash } = useLocation();
    let hashTimer = useRef();
    useEffect(() => {
        // if not a hash link, scroll to top
        if (hash === "") {
            // ** this smooth too? 
            window.scrollTo(0, 0);
        } else {
            // else scroll to id
            hashTimer.current = setTimeout(() => {
                const id = hash.replace("#", "");
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth"});
                }
            }, 100);
        }

        return () => {clearTimeout(hashTimer.current)};
    }, [pathname, hash])

    return null;
}

export function ColChevron(props) {
    if(props.column.direction === "desc"){
        return (
            <BiChevronDown style={{paddingBottom: "0%"}} />
        )
    } else if(props.column.direction === "asc") {
        return (
            <BiChevronUp style={{paddingBottom: "0%"}} />
        )
    } else {
        return (<></>)
    }
};

export const Tooltip = ({ children, text, ...rest }) => {
    return (
        <TooltipContainer>
            <div>
                {text}
                <span />
            </div>
            <div {...rest}>
                {children}
            </div>
        </TooltipContainer>
    );
  };
  