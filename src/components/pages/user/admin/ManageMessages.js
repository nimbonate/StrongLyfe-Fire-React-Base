import React, { useState} from 'react'

import DataManager from '../../../misc/DataManager';

function ManageMessages(props) {

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
            direction: "desc",
            active: true
        },
        {
            label: "Name",
            value: "name",
            direction: "",
            active: false
        },
        {
            label: "Email",
            value: "email",
            direction: "",
            active: false
        },
    ]);

    return (
        <DataManager 
            pageTitle="Contact Messages"
            user={props.user}
            fireUser={props.fireUser}
            readOnlyFlags={props.readOnlyFlags}
            site={props.site}
            tableCols={tableCols}
            setTableCols={setTableCols}
            dataName={"messages"}
        />
    )
}

export default ManageMessages;