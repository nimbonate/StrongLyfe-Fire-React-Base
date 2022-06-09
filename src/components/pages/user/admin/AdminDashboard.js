import React from 'react'
import { useTheme } from 'styled-components'
import { BiMessageCheck } from "react-icons/bi"
import { FaChevronLeft, FaSitemap, FaUserAlt } from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'

import { Button } from '../../../../utils/styles/forms'
import { Hr } from '../../../../utils/styles/misc'
import { H1, LLink } from '../../../../utils/styles/text'

function AdminDashboard(props) {
    const theme = useTheme();

    return (
        <>
            <Helmet>
                <title>Admin Dashboard {props.site.name ? `| ${props.site.name}` : ""}</title>
            </Helmet>
            <LLink to="/dashboard">
                <Button type="button">
                    <FaChevronLeft />
                    &nbsp; Back to User Dashboard
                </Button>
            </LLink>
            <H1>Admin Dashboard</H1>
            <LLink to={`/dashboard/admin/site`}> 
                <Button type="button">
                    Manage Site <FaSitemap />
                </Button>
            </LLink>
            <LLink to={`/dashboard/admin/users`}> 
                <Button type="button" color={theme.colors.secondary}>
                    Manage Users <FaUserAlt />
                </Button>
            </LLink>
            <LLink to={`/dashboard/admin/messages`}> 
                <Button type="button" color={theme.colors.tertiary}>
                    Manage Messages <BiMessageCheck />
                </Button>
            </LLink>
            <Hr />
        </>
    )
}

export default AdminDashboard;