import React, { useState, useRef } from 'react'
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { BsCloudUpload } from "react-icons/bs";
import { CgSoftwareUpload } from "react-icons/cg";
import { BiCheck } from 'react-icons/bi';
import { useTheme } from 'styled-components';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

import { storage } from "../../Fire";
import {  FileInput, FileInputLabel, Button, FileDragBox, FileDragForm } from "../../utils/styles/forms.js";
import { Body, Label } from '../../utils/styles/text';
import { Div, Hr, Progress } from '../../utils/styles/misc';
import { Img } from '../../utils/styles/images';
import { FormError } from './Misc';
import { BTYPES, SIZES } from '../../utils/constants';

function FileUpload(props) {
    const theme = useTheme();
    const formRef = useRef();
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (files) => {
        props.clearError(props.name);
        let passed = true;
        const mbLimit = props.mbLimit ? props.mbLimit : 5;
        console.log("files: ")
        console.log(files)
        Array.from(files).forEach((file, f, filesArr) => {
            const fileSizeMb = (file.size / (1024 ** 2)).toFixed(2);
            if (fileSizeMb > props) {
                passed = false;
            }

            if(Object.is(filesArr.length - 1, f)) {
                if (passed) {
                    setFiles(filesArr);
                } else {
                    props.setError(props.name, { 
                        type: "big-file", 
                        message: `Some files selected exceed the accept file size limit of ${mbLimit}Mb. Please only select files below this file size to continue.`
                    });
                    setFiles([]);
                }
            }
        });
    }

    const handleFileClick = (e) => {
        handleFileSelect(e.target.files);
    }
    
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        console.log("e.dataTransfer.files: ")
        console.log(e.dataTransfer.files)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (!props.multiple && e.dataTransfer.files.length > 1) {
                toast.error("Sorry, but you can only add 1 file to this selection!")
            } else {
                handleFileSelect(e.dataTransfer.files);
            }
        }
    };

    const deleteFileSelection = () => {
        formRef.current.value = ""
        setFiles([]);
    };

    const uploadFile = async (incFiles) => {
        props.setSubmitting(prevState => ({
            ...prevState,
            files: true
        }));

        let urls = [];
        let files = null;
        
        // If File prototype, instead of FileList, then make into FileList
        if (!Array.from(incFiles).length) {
            let dataTransfer = new DataTransfer();
            let tempFile = new File([incFiles], incFiles.name);
            dataTransfer.items.add(tempFile);
            files = dataTransfer.files;
        } else {
            files = incFiles;
        }

        // Check each file preview to ensure ratio is what we want, if all pass, continue with upload
        const filePreviewElements = document.getElementsByClassName(`${props.name}`);
        let failedAspect = "";
        if(props.aspectRatio){
            Array.from(filePreviewElements).forEach((element) => {
                let naturalHeight = element.naturalHeight;
                let naturalWidth = element.naturalWidth;
                if ((naturalWidth / naturalHeight).toFixed(2) !== (props.aspectRatio.numer / props.aspectRatio.denom).toFixed(2)) {
                    failedAspect = (naturalWidth / naturalHeight);
                }
            });
        }

        // Loop through each file, and process it!
        if(failedAspect){
            props.setError(props.name, {
                type: "invalid-aspect-ratio", 
                message: `A picture selected is the wrong ratio of  ${(failedAspect).toFixed(2)}.
                    Please resize the photo or pick a photo with the correct aspect ratio 
                    of ${props.aspectRatio.numer}/${props.aspectRatio.denom} (${(props.aspectRatio.numer/props.aspectRatio.denom).toFixed(2)}).`
            });
            props.setSubmitting(prevState => ({
                ...prevState,
                files: false
            }));
            setFiles([]);
        } else {
            Array.from(files).forEach(async (file, f, filesArr) => {
                // File passed all tests, upload
                // Create the file metadata
                /** @type {any} */
                const metadata = {
                    contentType: file.type
                };
                const fullPath = (props.path + Math.floor(Math.random() * 99999) + `-` + file.name);
                console.log("fullPath: " + fullPath)
                // Upload file and metadata to the object (give random extension)
                const storageRef = ref(storage, fullPath);
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);
                
                // Listen for state changes, errors, and completion of the upload.
                await uploadTask.on("state_changed",
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                        setUploadProgress(prevState => ({
                            ...prevState,
                            [f]: progress
                        }));

                        switch (snapshot.state) {
                            case "paused":
                            console.log("Upload is paused");
                            break;

                            case "running":
                            console.log("Upload is running");
                            break;

                            default:
                            console.log("Default case upload snapshot...");
                            break;
                        }
                    }, 
                    (error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        switch (error.code) {
                            case "storage/unauthorized":
                            console.log("User doesn't have permission to access the object");
                            props.setError(props.name, { 
                                type: "storage/unauthorized", 
                                message: "User doesn't have permission to access the object."
                            });
                            break;

                            case "storage/canceled":
                            console.log("User canceled the upload");
                            props.setError(props.name, { 
                                type: "storage/canceled", 
                                message: "User canceled the upload."
                            });
                            break;
                    
                            case "storage/unknown":
                            console.log("Unknown error occurred, inspect error.serverResponse");
                            props.setError(props.name, { 
                                type: "storage/unknown", 
                                message: `Unknown error, contact ${props.site.emails.support}`
                            });
                            break;

                            default:
                            console.log("Default case upload snapshot...");
                            props.setError(props.name, { 
                                type: "storage/unknown", 
                                message: `Default error, contact ${props.site.emails.support}`
                            });
                            break;
                        }
                        
                        props.setSubmitting(prevState => ({
                            ...prevState,
                            files: false
                        }));
                    }, 
                    async () => {
                        // Upload completed successfully, now we can get the download URL
                        await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            urls.push(downloadURL);
                        });

                        if (f === filesArr.length - 1){ 
                            props.onUploadSuccess(urls, props.name);
                            props.setSubmitting(prevState => ({
                                ...prevState,
                                files: false
                            }));
                        }
                    }
                );
            });
        }
    }
    return (
        <>
            <FileDragForm 
                dragActive={dragActive} 
                selected={files.length > 0} 
                onDragEnter={handleDrag} 
                onSubmit={(e) => e.preventDefault()}
            >
                <FileInputLabel htmlFor={props.name} selected={files.length > 0}>
                    {
                        (files.length === 0) 
                        ? 
                        <Body textAlign="center"><CgSoftwareUpload size={60} /><br/> Drag and drop your file{props.multiple ? "s" : ""} here, <br/>or simply click to browse and select file{props.multiple ? "s" : ""}.</Body> 
                        : 
                        <Body textAlign="center" color={theme.colors.red}><CgSoftwareUpload size={60}  /><br/>Change file selection</Body>
                    }
                    <FileInput
                        ref={formRef}
                        id={props.name}
                        accept={props.accepts} 
                        multiple={props.multiple ? true : false}
                        onChange={handleFileClick} 
                    />
                    
                    {files.length > 0 && (
                        <>
                        <Hr color={theme.colors.green}/>
                        <Label margin="0">Selected file{props.multiple ? "s" : ""}:</Label> 
                        </>
                    )}
                    {/* Loop through files  */}
                    {files.length > 0 && Array.from(files).map((file, f) => {
                        const fileSizeMb = (file.size / (1024 ** 2)).toFixed(2);
                        return (
                            <div key={f}>
                                <Body margin="10px 0">{f + 1}. {file.name} <i>({fileSizeMb}Mb)</i></Body>
                                {file.type.includes("image") && (
                                    <Img
                                        style={{border: `2px solid ${theme.colors.green}`}}
                                        width="300px"
                                        className={`${props.name}`}
                                        alt="file preview"
                                        src={URL.createObjectURL(file)}
                                    />
                                )}
                                {!file.type.includes("image") && (
                                    <embed 
                                        style={{border: `2px solid ${theme.colors.green}`}}
                                        key={f}
                                        width="100%"
                                        height="auto"
                                        src={URL.createObjectURL(file)}
                                    />
                                )}
                                {(uploadProgress[f] > 1 && uploadProgress[f]) && ( 
                                    <Progress uploadProgress={uploadProgress[f]}>
                                        <div>
                                            <Body>{uploadProgress[f] > 15 ? `${Math.trunc(uploadProgress[f])}%` : ""}{uploadProgress[f] === 100 ? <BiCheck /> : ""}</Body>
                                        </div>
                                    </Progress>
                                )}
                            </div>
                        );
                    })}
                </FileInputLabel>
                { dragActive && <FileDragBox onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} /> }
            </FileDragForm>

            {files.length > 0 && (
                <Div>
                    <Button 
                        type="button" 
                        disabled={props.submitting.files}
                        onClick={() => uploadFile(files.length > 1 ? files : files[0])}
                    >
                        Upload &amp; Submit file selection &nbsp;<BsCloudUpload size={20} />
                    </Button>
                    <Button 
                        type="button" 
                        color={theme.colors.red}
                        size={SIZES.SM}
                        btype={BTYPES.INVERTED}
                        onClick={() => deleteFileSelection()}
                    >
                        Remove file selection &nbsp;<FaTrash size={20} />
                    </Button>
                </Div>
            )}
            {props.error && (
                <><Body display="inline" size={SIZES.LG} color={theme.colors.red}><b>Error</b>:</Body>  <FormError error={props.error} /> </>
            )}
        </>
    )
}

export default FileUpload;
