import React, { useState} from 'react'

import DataManager from '../../../misc/DataManager';

function ManageUsers(props) {
    const [tableCols, setTableCols] = useState([
        {
            label: "ID",
            value: "id",
            direction: "",
            active: false
        },
        {
            label: "Timestamp",
            value: "timestamp",
            direction: "desc", // Set to "desc" by default, so this will be sorted first, only init one of these columns as desc, others should be null for now!
            active: true
        },
        {
            label: "First Name",
            value: "firstName",
            direction: "",
            active: false
        },
        {
            label: "Last Name",
            value: "lastName",
            direction: "",
            active: false
        },
        {
            label: "Email",
            value: "email",
            direction: "",
            active: false
        },
        {
            label: "Phone",
            value: "phone",
            direction: "",
            active: false
        },
    ]);

    return (
        <DataManager 
            pageTitle="Users"
            user={props.user}
            fireUser={props.fireUser}
            readOnlyFlags={props.readOnlyFlags}
            site={props.site}
            tableCols={tableCols}
            setTableCols={setTableCols}
            dataName={"users"}
        />
    )
}

export default ManageUsers;