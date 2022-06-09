import React, { useEffect, useState} from 'react'
import { collection, query, orderBy, startAfter, limit, getDocs, onSnapshot, doc, limitToLast, where, addDoc, arrayRemove, arrayUnion, updateDoc, deleteDoc, increment, endBefore } from "firebase/firestore";  
import { FaChevronLeft, FaChevronRight, FaSearch, FaShieldAlt, FaShieldVirus, FaTrash,  } from 'react-icons/fa';
import { CgClose, CgMail, CgMailOpen } from 'react-icons/cg';
import { useTheme } from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { confirmAlert } from 'react-confirm-alert';

import { ModalCard, Hr, OverflowXAuto, Table, Tbody, Td, Th, Thead, Tr, ModalContainer, Div, Grid, Column, Row } from '../../utils/styles/misc';
import { Spinner } from '../../utils/styles/images';
import { ALink, Body, H1, H2, H3, Label, LLink } from '../../utils/styles/text';
import { firestore } from '../../Fire';
import { readTimestamp } from '../../utils/misc';
import { BTYPES, SIZES, PAGE_SIZES } from '../../utils/constants.js';
import { PageSelectInput, SearchContainer, SelectInput, TextInput, Button} from '../../utils/styles/forms';
import { ColChevron, FormError } from '../misc/Misc';
import ConfirmAlert from './ConfirmAlert';

export default function DataManager(props) {
    const theme = useTheme();
    const [loading, setLoading] = useState({ 
        counts: true,
        sensitive: true,
        items: true,
    }); 
    const [submitting, setSubmitting] = useState({ 
        search: false,
    }); 
    const searchForm = useForm({
        defaultValues: {
            term: "",
            column: "id"
        }
    });
    const [itemCount, setItemCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0].value);
    const [items, setItems] = useState([]);
    const [beginCursor, setBeginCursor] = useState("");
    const [finalCursor, setFinalCursor] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [shownModals, setShownModals] = useState([]); 
    const [search, setSearch] = useState({
        column: "",
        term: "",
    }); 

    // Users specific
    const [admins, setAdmins] = useState([]);
    const [superAdmins, setSuperAdmins] = useState([]);
    const [messengerEmails, setMessengerEmails] = useState([]);

    useEffect(() => {
        return onSnapshot(doc(firestore, "site", "counts"), (countsDoc) => {
            if(countsDoc.exists()){
                let countsData = countsDoc.data();
                setLoading(prevState => ({
                    ...prevState,
                    counts: false
                }));
                setItemCount(countsData[props.dataName]);
            } else {
                console.log(`No custom site set, can't properly count ${props.dataName}.`);
                setLoading(prevState => ({
                    ...prevState,
                    counts: false
                }));
            }
        });
    }, [props.dataName]);

    useEffect(() => {
        return onSnapshot(doc(firestore, "site", "sensitive"), (sensitiveDoc) => {
            if(sensitiveDoc.exists()){
                let sensitiveData = sensitiveDoc.data();
                setAdmins(sensitiveData.admins);
                setSuperAdmins(sensitiveData.superAdmins);
                setMessengerEmails(sensitiveData.messengers);

                setLoading(prevState => ({
                    ...prevState,
                    sensitive: false
                }));
            } else {
                console.log("No custom site set, can't properly find sensitives.")
                setLoading(prevState => ({
                    ...prevState,
                    sensitive: false
                }));
            }
        });
    }, []);

    useEffect(() => {
        let currentPageQuery = query(
            collection(firestore, props.dataName),
        );
        if(search.term){
            // __name__ is synonymous with the doc.id we need to query for
            // No limit set on items per page
            currentPageQuery = query(
                currentPageQuery, 
                where(search.column === "id" ? "__name__" : search.column, "==", search.term),
            );
        } else {
            currentPageQuery = query(
                currentPageQuery,  
                orderBy(
                    props.tableCols.find(column => {return column.active;}).value, 
                    props.tableCols.find(column => {return column.active;}).direction
                ),
                limit(itemsPerPage)
            );
        }
        async function fetchItems() {
            const pageDocSnaps = await getDocs(currentPageQuery);
            // Get the last visible document cursor so we can reference it for the next page
            const tempFinalCursor = pageDocSnaps.docs[ pageDocSnaps.docs.length - 1 ];
            
            // Get content from each doc on this page 
            let tempItems = [];
            let tempShownModals = [];
            pageDocSnaps.forEach((doc) => {
                const docWithMore = Object.assign({}, doc.data());
                docWithMore.id = doc.id;
                tempItems.push(docWithMore);
                tempShownModals.push(false)
            });
    
            setItems(tempItems);
            setFinalCursor(tempFinalCursor);
            setCurrentPage(1);
            setShownModals(tempShownModals);
            setLoading(prevState => ({
                ...prevState,
                items: false
            }));
        };

        fetchItems();
    }, [itemsPerPage, props.tableCols, search, props.dataName]);

    const getPrevPage = async () => {
        if(currentPage !== 1){
            setLoading(prevState => ({
                ...prevState,
                items: true
            }));
            // Construct a new query starting at this document depending if the user is searching or not
            let currentPageQuery = query(
                collection(firestore, props.dataName)
            );
            if(search.term){
                // __name__ is synonymous with the doc.id we need to query for
                currentPageQuery = query(
                    currentPageQuery, 
                    where(search.column === "id" ? "__name__" : search.column, "==", search.term),
                    endBefore(beginCursor),
                );
            } else {
                currentPageQuery = query(
                    currentPageQuery,  
                    orderBy(
                        props.tableCols.find(column => {return column.active;}).value, 
                        props.tableCols.find(column => {return column.active;}).direction
                    ),
                    endBefore(beginCursor),
                    limitToLast(itemsPerPage)
                );
            }
            const pageDocSnaps = await getDocs(currentPageQuery);
            const tempBeginCursor = pageDocSnaps.docs[ 0 ];
            const tempFinalCursor = pageDocSnaps.docs[ pageDocSnaps.docs.length - 1 ];
            const prevPage = currentPage - 1;

            // Set data in docs to state
            let tempItems = [];
            let tempShownModals = []
            pageDocSnaps.forEach((doc) => {
                const docWithMore = Object.assign({}, doc.data());
                docWithMore.id = doc.id;
                tempItems.push(docWithMore);
                tempShownModals.push(false);
            });

            setItems(tempItems);
            setFinalCursor(tempFinalCursor);
            setBeginCursor(tempBeginCursor);
            setCurrentPage(prevPage);
            setShownModals(tempShownModals);
            setLoading(prevState => ({
                ...prevState,
                items: false
            }));
        }
    }

    const getNextPage = async () => {
        if(currentPage !== Math.ceil(itemCount/itemsPerPage)){
            setLoading(prevState => ({
                ...prevState,
                items: true
            }));
            // Construct a new query starting at this document depending if the user is searching or not
            let currentPageQuery = query(
                collection(firestore, props.dataName),
            );
            if(search.term){
                // __name__ is synonymous with the doc.id we need to query for
                currentPageQuery = query(
                    currentPageQuery, 
                    where(search.column === "id" ? "__name__" : search.column, "==", search.term),
                    startAfter(finalCursor),
                );
            } else {
                currentPageQuery = query(
                    currentPageQuery,  
                    orderBy(
                        props.tableCols.find(column => {return column.active;}).value, 
                        props.tableCols.find(column => {return column.active;}).direction
                    ),
                    startAfter(finalCursor), 
                    limit(itemsPerPage),
                );
            }

            const pageDocSnaps = await getDocs(currentPageQuery);
            const tempBeginCursor = pageDocSnaps.docs[ 0 ];
            const tempFinalCursor = pageDocSnaps.docs[ pageDocSnaps.docs.length - 1 ];
            const nextPage = currentPage + 1;

            // Set data in docs to state
            let tempItems = [];
            let tempShownModals = []
            pageDocSnaps.forEach((doc) => {
                const docWithMore = Object.assign({}, doc.data());
                docWithMore.id = doc.id;
                tempItems.push(docWithMore);
                tempShownModals.push(false)
            });

            setItems(tempItems);
            setFinalCursor(tempFinalCursor);
            setBeginCursor(tempBeginCursor);
            setCurrentPage(nextPage);
            setShownModals(tempShownModals);
            setLoading(prevState => ({
                ...prevState,
                items: false
            }));
        }
    };

    const submitSearch = (data) => {
        console.log("submit searching")
        console.log(data)
        setSubmitting(prevState => ({
            ...prevState,
            search: true
        }))
        setSearch({ 
            column: data.column,
            term: data.term,
        });
        setSubmitting(prevState => ({
            ...prevState,
            search: false
        }));
    };

    const clearSearch = () => {
        searchForm.reset();
        setSearch({ 
            column: "",
            term: "",
        });
    };

    const toggleCol = (column, index) => {
        if(search.term){
            toast.warn("Sorry, but you cannot search a term and sort by a specific column at the same time.")
        } else if(column.value === "id"){
            toast.warn("Sorry, but you cannot sort by the ID of items.")
        } else {
            let tempCol = column;
            let tempTableCols = [...props.tableCols];
            const prevActiveColIndex = props.tableCols.findIndex(column => {return column.active;});
            if(prevActiveColIndex !== index){
                // De-active the old column if not same as before
                tempTableCols[prevActiveColIndex].active = false;
                tempTableCols[prevActiveColIndex].direction = "";
            }
    
            // Set new column stuff
            tempCol.active = true;
            if(!tempCol.direction || tempCol.direction === "asc"){
                tempCol.direction = "desc";
            } else {
                tempCol.direction = "asc";
            }
            tempTableCols[index] = tempCol;
            props.setTableCols(tempTableCols);
        }
    }
        
    const toggleModal = (newStatus, index) => {
        let tempShownModals = [...shownModals]
        tempShownModals[index] = newStatus
        setShownModals(tempShownModals);
    };

    const deleteItem = async (index) => {
        const itemId = items[index].id;
        let tempItems = [...items];
        const splicedValue = tempItems.splice(index, 1);
        console.log("Deleting " + splicedValue.id);
        await deleteDoc(doc(firestore, props.dataName, itemId)).then(() => {
            console.log("Successful delete of doc on firestore");
            updateDoc(doc(firestore, "site", "counts"), {
                [props.dataName]: increment(-1),
            }).then(() => {
                console.log("Successful update of counts on firestore");
                toast.success("Item deleted!");
                setItemCount(itemCount-1);
                setItems(tempItems);
            }).catch((error) => {
                console.error("Error decrementing count: ", error);
                toast.error(`Error decrementing count: ${error}`);
            });
        }).catch((error) => {
            console.error("Error deleting item: ", error);
            toast.error(`Error deleting item: ${error}`);
        });
    }

    /// Users specific functions ///
    const submitNewAdmin = (id, email, name) => {
        // Write to the current newAdmins collection to be verified on the backend.
        addDoc(collection(firestore, "users", props.user.id, "newAdmins"), {
            id: id,
            email: email,
            name: name,
            timestamp: Date.now(),
        }).then(() => {
            console.log("Successful add of new admin doc to Firestore.");
            toast.success("Successful add of new admin!");
        }).catch((error) => {
            console.error("Error adding newAdmins doc: ", error);
            toast.error(`Error setting newAdmins doc: ${error}`);
        });
    };

    const submitNewSuperAdmin = (id, email, name) => {
        // Write to the current newAdmins collection to be verified on the backend.
        addDoc(collection(firestore, "users", props.user.id, "newAdmins"), {
            id: id,
            email: email,
            name: name,
            superAdmin: true,
            timestamp: Date.now(),
        }).then(() => {
            console.log("Successful add of new super admin doc to Firestore.");
            toast.success("Successful add of new super admin!");
        }).catch((error) => {
            console.error("Error adding newAdmins doc: ", error);
            toast.error(`Error setting newAdmins doc: ${error}`);
        });
    };

    const addMessenger = (email) => {
        // Write to the current newAdmins collection to be verified on the backend.
        updateDoc(doc(firestore, "site", "sensitive"), {
            "messengers": arrayUnion(email)
        }).then(() => {
            console.log("Successful add of email to get contact users doc to Firestore.");
            toast.success("Successful add of a new email to get contact users.");
        }).catch((error) => {
            console.error("Error updating sensitive doc: ", error);
            toast.error(`Error updating sensitive doc: ${error}`);
        });
    };

    const removeMessenger = (email) => {
        // Write to the current newAdmins collection to be verified on the backend.
        updateDoc(doc(firestore, "site", "sensitive"), {
            "messengers": arrayRemove(email)
        }).then(() => {
            console.log("Successfully removed email from contact users doc to Firestore.");
            toast.success("Successfully removed email from contact users.");
        }).catch((error) => {
            console.error("Error updating sensitive doc: ", error);
            toast.error(`Error updating sensitive doc: ${error}`);
        });
    };

    const renderAdminBadge = (user) => {
        if(admins.some(admin => admin.id === user.id)){
            <Body margin="0" display="inline-block" color={theme.colors.red}><FaShieldAlt /> Admin</Body>
        } else {
            return (
                <Button
                    type="button"
                    color={theme.colors.yellow}
                    btype={BTYPES.INVERTED}
                    size={SIZES.SM}
                    onClick={() =>         
                        confirmAlert({
                            customUI: ({ onClose }) => {
                                return (
                                    <ConfirmAlert
                                        theme={theme}
                                        onClose={onClose} 
                                        headingText={`Add Admin`}
                                        body={`Are you sure you want to upgrade <${user.email}> to be an Admin?`}
                                        yesFunc={() => submitNewAdmin(user.id, user.email, `${user.firstName} ${user.lastName}`)} 
                                        yesText={`Yes`} 
                                        noFunc={function () {}} 
                                        noText={`No`}   
                                    />
                                );
                            }
                        })}       
                >
                    Set as Admin <FaShieldAlt />
                </Button> 
            )
            
        }
    };

    const renderSuperAdminBadge = (user) => {
        if(
            !superAdmins.some(superAdmin => superAdmin.id === user.id) && 
            admins.some(admin => admin.id === user.id)
        ){
            // Already admin, but not super admin yet
            return (
                <Button
                    type="button"
                    color={theme.colors.red}
                    btype={BTYPES.INVERTED}
                    size={SIZES.SM}
                    onClick={() =>         
                        confirmAlert({
                            customUI: ({ onClose }) => {
                                return (
                                    <ConfirmAlert
                                        theme={theme}
                                        onClose={onClose} 
                                        headingText={`Add Super Admin`}
                                        body={`Are you sure you want to upgrade <${user.email}> to be a SUPER Admin?`}
                                        yesFunc={() => submitNewSuperAdmin(user.id, user.email, `${user.firstName} ${user.lastName}`)} 
                                        yesText={`Yes`}
                                        noFunc={function () {}} 
                                        noText={`Cancel`}   
                                    />
                                );
                            }
                        })}        
                >
                    Set as Super Admin <FaShieldVirus />
                </Button> 
            )
            
        } else if (superAdmins.some(superAdmin => superAdmin.id === user.id)) {
            // Already superAdmin
            return (
                <Body margin="0" display="inline-block" color={theme.colors.red}><FaShieldVirus /> Super Admin</Body>
            )
            
        } else {
            // Not admin
            return (
                ""
            )
        }
    };

    const renderMessengerBadge = (user) => {
        if(
            !messengerEmails.some(email => email === user.email) && 
            admins.some(admin => admin.id === user.id)
        ){
            // Is admin but not on email list
            return (
                <Button
                    type="button"
                    color={theme.colors.green}
                    btype={BTYPES.INVERTED}
                    size={SIZES.SM}
                    onClick={() =>         
                        confirmAlert({
                            customUI: ({ onClose }) => {
                                return (
                                    <ConfirmAlert
                                        theme={theme}
                                        onClose={onClose} 
                                        headingText={`Add Contact Messenger`}
                                        body={`Are you sure you want to add <${user.email}> to be a recipient of all incoming contact messages?`}
                                        yesFunc={() => addMessenger(user.email)} 
                                        yesText={`Yes`}
                                        noFunc={function () {}} 
                                        noText={`Cancel`}   
                                    />
                                );
                            }
                        })}        
                >
                    Set as Messenger <CgMailOpen />
                </Button> 
            )
            
        } else if (
            messengerEmails.some(email => email === user.email) && 
            admins.some(admin => admin.id === user.id)
        ) {
            // Is admin and already receiving emails, but prompted to remove
            return (
                <Button
                    type="button"
                    color={theme.colors.red}
                    btype={BTYPES.INVERTED}
                    size={SIZES.SM}
                    onClick={() =>         
                        confirmAlert({
                            customUI: ({ onClose }) => {
                                return (
                                    <ConfirmAlert
                                        theme={theme}
                                        onClose={onClose} 
                                        headingText={`Remove Messenger`}
                                        body={`Are you sure you want to remove <${user.email}> so the user will no longer receive contact messages?`}
                                        yesFunc={() => removeMessenger(user.email)} 
                                        yesText={`Yes`}
                                        noFunc={function () {}} 
                                        noText={`Cancel`}   
                                    />
                                );
                            }
                        })}        
                >
                    Remove Messenger? <CgMail />
                </Button> 
            )
            
        } else {
            // Not admin
            return (
                ""
            )
        }
    };

    if(loading.counts || loading.sensitive){
        return (
            <>
                <H2>Loading... <Spinner /> </H2> 
            </>
        )
    } else {
        return (
            <>
                <Helmet>
                    <title>{props.pageTitle} {props.site.name ? `| ${props.site.name}` : ""}</title>
                </Helmet>
                <LLink to="/dashboard/admin">
                    <Button type="button">
                        <FaChevronLeft />
                        &nbsp; Back to Admin Dashboard
                    </Button>
                </LLink>
                <H1>{props.pageTitle}: {itemCount}</H1>
                <form onSubmit={ searchForm.handleSubmit(submitSearch) }>
                    <Grid fluid>
                        <Row justify="center" align="center">
                            <Column md={12} lg={8}>
                                <SearchContainer>
                                    <FaSearch />
                                    <TextInput
                                        type="text"
                                        error={searchForm.formState.errors.term}
                                        placeholder={`Search by a column title in the table`}
                                        {
                                            ...searchForm.register("term", { 
                                                    required: "Please enter a search term!",
                                                    maxLength: {
                                                        value: 50,
                                                        message: "The search term can only be 50 characters long."
                                                    },
                                                    minLength: {
                                                        value: 2,
                                                        message: "The search term must be at least 2 characters long."
                                                    },
                                                }
                                            )
                                        } 
                                    />
                                </SearchContainer>
                            </Column>
                            <Column md={12} lg={4}>
                                <SelectInput {...searchForm.register("column", { required: true })}>
                                    {
                                        props.tableCols.filter(column => column.value !== "timestamp").map((column) => {
                                            return (
                                                <option key={column.value} value={column.value}>{column.label}</option>
                                            )
                                        })
                                    }
                                </SelectInput>
                                <Button 
                                    type="submit" 
                                    disabled={submitting.search}
                                >
                                    Search 
                                </Button>
                                {search.term && (
                                    <Button 
                                        type="button"
                                        btype={BTYPES.INVERTED}
                                        color={theme.colors.yellow}
                                        onClick={() => clearSearch()}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Column>
                        </Row>
                        <Row>
                            <Column sm={12} textalign="center">
                                <FormError error={searchForm.formState.errors.term} /> 
                            </Column>
                        </Row>
                    </Grid>
                </form>
                
                {itemCount === 0 && (
                    <Body color={theme.colors.red} bold size={SIZES.LG}>No items yet!</Body>
                )}
                {itemCount !== 0 && (
                    <>
                    <OverflowXAuto>
                        <Table>
                            <Thead>
                                <Tr>
                                    {
                                        props.tableCols.map((column, c) => {
                                            return (
                                                <Th 
                                                    key={c} 
                                                    onClick={() => toggleCol(column, c)}
                                                    active={column.active}
                                                >
                                                    {column.label} <ColChevron column={column} />
                                                </Th>
                                            )
                                        })
                                    }
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                { items.length === 0 && (
                                    <Tr>
                                        <Td colSpan={props.tableCols.length + 1} style={{textAlign:"center"}}>
                                            <Body color={theme.colors.red}>No results</Body>
                                        </Td>
                                    </Tr>
                                )}
                                { loading.items && (
                                    <Tr>
                                        <Td colSpan={props.tableCols.length + 1} style={{textAlign:"center"}}>
                                            <Body color={theme.colors.green}>Loading... <Spinner /></Body>
                                        </Td>
                                    </Tr>
                                )}
                                { !loading.items && items.length !== 0 && items.map((item, i) => {
                                    return (
                                        <Tr key={i}>
                                            {
                                                props.tableCols.map((column, c) => {
                                                    if(column.value === "timestamp"){
                                                        return (
                                                            <Td key={c}>
                                                                {readTimestamp(item.timestamp).date} @ {readTimestamp(item.timestamp).time}
                                                            </Td>
                                                        )
                                                    } else {
                                                        return (
                                                            <Td key={c}>
                                                                {item[column.value]}
                                                            </Td>
                                                        )
                                                    }
                                                    
                                                })
                                            }
                                            <Td>
                                                <Button
                                                    type="button"
                                                    size={SIZES.SM}
                                                    onClick={() => toggleModal(true, i)}         
                                                >
                                                    View details
                                                </Button>
                                                {shownModals[i] && (
                                                    <ModalContainer onClick={() => toggleModal(false, i)}>
                                                        <ModalCard onClick={(e) => e.stopPropagation()}>
                                                            {/* ** for now just manually add this conditional for your pages here, not sure right now how to pass these item variables at a higher level for the differing modal views */}
                                                            {props.dataName === "users" && (
                                                                <>
                                                                <H3>{item.firstName} {item.lastName}</H3> <ALink href={`mailto:${item.email}`}>&lt;{item.email}&gt;</ALink>
                                                                <Body margin="0" size={SIZES.SM}><i>{readTimestamp(item.timestamp).date} @ {readTimestamp(item.timestamp).time}</i></Body>
                                                                <Div margin="10px 30px 0 0">
                                                                    { renderAdminBadge(item) }
                                                                    { renderSuperAdminBadge(item) }
                                                                    { renderMessengerBadge(item) }
                                                                </Div> 
                                                                </>
                                                            )}
                                                            {props.dataName === "messages" && (
                                                                <>
                                                                <Label>{item.name}</Label> <ALink href={`mailto:${item.email}`}>&lt;{item.email}&gt;</ALink>
                                                                <Body margin="0" size={SIZES.SM}><i>{readTimestamp(item.timestamp).date} @ {readTimestamp(item.timestamp).time}</i></Body>
                                                                <Body>{item.body}</Body>
                                                                </>
                                                            )}

                                                            <Button 
                                                                type="button"
                                                                size={SIZES.SM} 
                                                                color={theme.colors.red}
                                                                onClick={() => toggleModal(false, i)}
                                                            >
                                                                <CgClose /> Close 
                                                            </Button>
                                                        </ModalCard>
                                                    </ModalContainer>
                                                )}
                                                {props.dataName !== "users" && (
                                                    <Button
                                                        type="button"
                                                        btype={BTYPES.INVERTED} 
                                                        color={theme.colors.red}
                                                        size={SIZES.SM}
                                                        onClick={() =>         
                                                            confirmAlert({
                                                                customUI: ({ onClose }) => {
                                                                    return (
                                                                        <ConfirmAlert
                                                                            theme={theme}
                                                                            onClose={onClose} 
                                                                            headingText={`Delete item`}
                                                                            body={`Are you sure you want to delete item with ID of "${item.id}" from the database? This action cannot be reverse and is permanent loss of data!`}
                                                                            yesFunc={() => deleteItem(i)} 
                                                                            yesText={`Yes`} 
                                                                            noFunc={function () {}} 
                                                                            noText={`No`}   
                                                                        />
                                                                    );
                                                                }
                                                            })}           
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                )}
                                            </Td>
                                        </Tr>
                                    )
                                })}
                            </Tbody>
                        </Table>
                    </OverflowXAuto>
                    <Hr/>
                    <Grid fluid>
                        <Row align="center" justify="center">
                            <Column sm={12} md={4} textalign="center">
                                {currentPage !== 1 && (
                                    <Button 
                                        size={SIZES.SM}
                                        type="button" 
                                        onClick={() => getPrevPage()}
                                    >
                                        <FaChevronLeft /> Previous page    
                                    </Button>
                                )}
                            </Column>
                            <Column sm={12} md={4} textalign="center">
                                <Body margin="0" size={SIZES.SM}>Showing {items.length} of {itemCount}</Body>
                                {!search.term && (<Body margin="0" size={SIZES.SM}>Page {currentPage} of {Math.ceil(itemCount/itemsPerPage)}</Body>)}
                                <Body margin="10px 0" size={SIZES.SM}>
                                    {/* Don't show page size selector if itemCount is less than the second page size selection */}
                                    {(!search.term && itemCount > PAGE_SIZES[1].value) && (
                                        <>
                                        <PageSelectInput
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(e.target.value)} 
                                        >
                                            { 
                                                PAGE_SIZES.map((size) => {
                                                    return (
                                                        <option key={size.value} value={size.value}>{size.label}</option>
                                                    )
                                                })
                                            }
                                        </PageSelectInput>
                                        &nbsp; items per page
                                        </>
                                    )}
                                </Body>
                            </Column>
                            <Column sm={12} md={4} textalign="center">
                                {(currentPage !== Math.ceil(itemCount/itemsPerPage) && !search.term) && (
                                    <Button 
                                        size={SIZES.SM}
                                        type="button" 
                                        onClick={() => getNextPage()}
                                    >
                                        Next page <FaChevronRight /> 
                                    </Button>
                                )}
                            
                            </Column>
                        </Row>
                    </Grid>
                        
                    </>
                )}
            </>
        ) 
    }
}
